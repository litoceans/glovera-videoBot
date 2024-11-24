from fastapi import FastAPI, UploadFile, File, Form, status,Request, Depends, Body, HTTPException,Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, EmailStr, Field, validator, ValidationError
from typing import List,Optional
import logging
import pymongo
import os
import requests
from datetime import datetime, timedelta
import dotenv
from utils.generator import create_access_token, get_current_user,encrypt
from utils.formatCreator import flatten_object
import time
import firebase_admin
from firebase_admin import credentials, auth
import json
from groq import Groq

dotenv.load_dotenv()

client = Groq()

mainPrompt = """You are EduGuide, an AI-powered video bot for international student counseling. Provide human-like interactions and personalized guidance./n
Objective:/n
Assist students in making informed decisions about studying abroad. Offer advice on programs, universities, visa requirements, and cultural adjustments./n
Key Features:/n
Human-Like Interaction:/n
Conversational tone./n
Show empathy and understanding./n
Use facial expressions and gestures./n
Personalized Guidance:/n
Ask questions to understand student's background and goals./n
Provide tailored advice./n
Offer insights on cultural, academic, and financial aspects./n
Comprehensive Support:/n
Answer questions on admissions, scholarships, visas, and living arrangements./n
Provide resources and links./n
Guide on application tasks./n
Continuous Learning:/n
Stay updated with latest trends./n
Improve based on user feedback./n
Ethical Considerations:/n
Ensure accurate and unbiased advice./n
Respect student privacy."""

# Google Token validation URL
GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"
mongoUrl = os.getenv("MONGO_URL")
#connect to MongoDB
cred = credentials.Certificate('services.json')
firebase_admin.initialize_app(cred)

# Initialize FastAPI app
app = FastAPI()

# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logging.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logging.info(f"Response: {response.status_code}")
    return response

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/generateToken")
async def generate_token(email: EmailStr = Query(...)):
    if not email:
        raise HTTPException(status_code=400, detail="Email is required") 
    token = create_access_token({"email": email})
    return {"token": token}

class TokenRequest(BaseModel):
    token: str


@app.post("/loginUsingGoogle")
async def loginUser(token_request: TokenRequest):
    try:
        decoded_token = auth.verify_id_token(token_request.token)
        print("decoded_token :",decoded_token)
        if not decoded_token:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        user_info = decoded_token
        userName = user_info.get("name")
        userEmail = user_info.get("email")
        print("userEmail",userEmail)
        print("userName",userName)
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        collection = db["students"]
        projectionQuery = {"_id": 0,"personal_information.email":1,"profile_completed":1,"profile_picture":1,"student_id":1}
        existing_user = collection.find_one({"personal_information.email": encrypt(userEmail)},projectionQuery)
        if existing_user is None:
            stdId = "STD" +str(int(time.time()))

            student_data = {
                "student_id": stdId,
                "last_login": time.strftime("%Y-%m-%d %H:%M:%S"),
                "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "profile_picture": user_info.get("picture"),
                "profile_completed": False,
                "personal_information": {
                    "first_name": userName,
                    "last_name": "",
                    "date_of_birth": "",
                    "gender": "",
                    "email": encrypt(userEmail),
                    "phone_number": ""
                },
                "education_background": {
                    "current_qualification": "",
                    "graduation_year": 0,   
                    "institution": "",
                    "stream_of_study": ""
                },
                "program_interests": {
                    "desired_degree": "",
                    "field_of_interest": "",
                    "preferred_universities": [],
                    "preferred_countries": []
                },
                "financial_information": {
                    "budget_range": "",
                    "scholarship_interest": False,
                    "loan_requirement": False
                },
                "assessment_scores": {
                    "gre_score": 0,
                    "gmat_score": 0,
                    "ielts_score": 0,
                    "toefl_score": 0,
                },"professional_experience": {
                    "total_exp": "",
                    }
                }
            updated_user = collection.insert_one(student_data)
            client.close()
            if updated_user.inserted_id:
                jwt_token = create_access_token({"userId":student_data.get("student_id")})
                is_profile_completed = student_data.get("profile_completed")
                getProfilePicture = student_data.get("profile_picture")
                return {"Success":{"name": userName, "email": userEmail,"id":student_data.get("student_id"), "token": jwt_token,"profile_completed":False,"photoURL":getProfilePicture}}
            else:
                raise HTTPException(status_code=500, detail="Failed to create user")
        else:
            last_login = time.strftime("%Y-%m-%d %H:%M:%S")
            collection.update_one({"email": userEmail}, {"$set": {"last_login": last_login}})
            client.close()
            jwt_token = create_access_token({"userId":existing_user.get("student_id")})
            is_profile_completed = existing_user.get("profile_completed")
            getProfilePicture = existing_user.get("profile_picture")
            return {"Success":{"name": userName,"id":existing_user.get("student_id"), "email": userEmail, "token": jwt_token,"profile_completed":is_profile_completed,"photoURL":getProfilePicture}}
    except Exception as e:
        return {"Error": f"Error: {str(e)}"}

class CreateAdminData(BaseModel):
    name: str
    email: str
    password: str

@app.post("/createAdmin")
async def create_admin(request: Request,data: CreateAdminData):
    try:
        current_user = await get_current_user(request)
        print(current_user)
        if current_user is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        admin_data = await request.json()
        email = admin_data.get("email")
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        collection = db["admin"]
        projectionQuery = {"_id": 0,"adminEmail":1}
        existing_user = collection.find_one({"adminEmail": encrypt(email)},projectionQuery)
        print("existing_user",existing_user)
        if existing_user is not None:
            return {"message": "Admin already exists"}
        adminId = "AD" +str(int(time.time()))
        name = admin_data.get("name")
        email = admin_data.get("email")
        password = admin_data.get("password")
        print("name",name)
        print("email",email)
        print("password",password)

        adminData = {
            "adminId": adminId,
            "last_login": time.strftime("%Y-%m-%d %H:%M:%S"),
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "adminName": name,
            "adminEmail": encrypt(email),
            "password": encrypt(password),
            "role": "admin"
        }
        createAdmin = collection.insert_one(adminData)
        client.close()
        if createAdmin.inserted_id:
            jwt_token = create_access_token({"email":adminData.get("adminEmail")})
            return {"name": adminData.get("adminName"), "email": adminData.get("adminEmail"), "token": jwt_token}
        else:
            raise HTTPException(status_code=500, detail="Failed to create admin")
    except Exception as e:
        return {"Error": f"Error: {str(e)}"}

class LoginAdmin(BaseModel):
    email: str
    password: str


@app.post("/loginAdmin")
async def login_admin(data: LoginAdmin):
    try:
        email = data.email
        password = data.password
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        collection = db["admin"]
        projectionQuery = {"_id": 0, "adminEmail": 1, "adminName": 1, "password": 1}
        existing_user = collection.find_one({"adminEmail": encrypt(email)}, projectionQuery)
        
        if existing_user is None:
            client.close()
            return {"Error": "Admin not found"}
            
        if existing_user.get("password") != encrypt(password):
            client.close()
            return {"Error": "Invalid password"}
            
        lastLogin = time.strftime("%Y-%m-%d %H:%M:%S")
        collection.update_one({"adminEmail": encrypt(email)}, {"$set": {"last_login": lastLogin}})
        client.close()
        
        jwt_token = create_access_token({"email": email})
        return {"Success": {"name": existing_user.get("adminName"), "email": email, "token": jwt_token}}
    except Exception as e:
        print("Login error:", str(e))
        return {"Error": f"Error: {str(e)}"}


# Pydantic model for user data (response schema)
class UserProfileResponse(BaseModel):
    isProfileCompleted: bool = Field(default=False)

@app.post("/checkProfileCompletion")
async def check_profile_completion(request: Request):
    try:
        # Authenticate user
        current_user = await get_current_user(request)
        if not current_user:
            raise HTTPException(status_code=401, detail="Unauthorized")

        # Get user ID from token payload
        user_id = current_user.get("userId")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid user ID")

        # Check profile completion status
        client = pymongo.MongoClient(mongoUrl)
        try:
            db = client["glovera"]
            collection = db["students"]
            
            user = collection.find_one(
                {"student_id": user_id},
                {"_id": 0, "profile_completed": 1}
            )
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
                
            return UserProfileResponse(
                isProfileCompleted=user.get("profile_completed", False)
            )
        finally:
            client.close()
            
    except HTTPException as e:
        raise e
    except Exception as e:
        print("Unexpected error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/{user_id}/profile", response_model=UserProfileResponse)
async def check_profile_completion(user_id: int):
    try:
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        collection = db["students"]
        projectionQuery = {"_id": 0,"profile_completed":1}
        user = collection.find_one({"student_id": user_id},projectionQuery)
        client.close()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        is_profile_completed = user.get("profile_completed")
        return {"isProfileCompleted": is_profile_completed}
    except Exception as e:
        return {"Error": f"Error: {str(e)}"}


class UserRoleResponse(BaseModel):
    role: str
# Endpoint to check if a user is an admin
@app.get("/api/users/{user_id}/role", response_model=UserRoleResponse)
async def check_is_admin(user_id: int):
    try:
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        collection = db["admin"]
        projectionQuery = {"_id": 0,"adminId":1}
        user = collection.find_one({"adminId": user_id},projectionQuery)
        client.close()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        role = user.get("role")
        return {"role": role}
    except Exception as e:
        return {"Error": f"Error: {str(e)}"}

@app.get("/getProfile")
async def get_profile(request: Request):

    try:
        current_user = await get_current_user(request)
        if current_user is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        userId = current_user.get("userId")
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        collection = db["students"]
        projectionQuery = {"_id": 0,"student_id":0,"profile_picture":0}
        user = collection.find_one({"student_id": user_id},projectionQuery)
        client.close()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        objFlat = flatten_object(user)
        return {"Success":objFlat}
    except Exception as e:
        return {"Error": f"Error: {str(e)}"}

class UpdateProfile(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    phone_number: str = Field(..., pattern=r'^\+?[0-9]{10,15}$')
    date_of_birth: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$')
    gender: str = Field(..., pattern=r'^(Male|Female|Other)$')
    current_qualification: str = Field(..., min_length=1, max_length=100)
    graduation_year: int = Field(..., ge=1900, le=2100)
    institution: str = Field(..., min_length=1, max_length=100)
    stream_of_study: str = Field(..., min_length=1, max_length=100)
    desired_degree: str = Field(..., min_length=1, max_length=100)
    field_of_interest: str = Field(..., min_length=1, max_length=100)
    preferred_universities: List[str] = Field(..., min_items=1)
    preferred_countries: List[str] = Field(..., min_items=1)
    budget_range: str = Field(..., pattern=r'^\d+-\d+$')
    scholarship_interest: bool
    loan_requirement: bool
    total_exp: str = Field(..., pattern=r'^\d+-\d+$')
    gre_score: int = Field(..., ge=0, le=340)
    gmat_score: int = Field(..., ge=0, le=800)
    ielts_score: int = Field(..., ge=0, le=9)
    toefl_score: int = Field(..., ge=0, le=120)
    token: str
    userId: str
    @validator('date_of_birth')
    def validate_date_of_birth(cls, v):
        from datetime import datetime
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError("Date of birth must be in the format YYYY-MM-DD")
    @validator('preferred_universities', 'preferred_countries')
    def validate_list_items(cls, v):
        if not all(isinstance(item, str) and item.strip() for item in v):
            raise ValueError("List items must be non-empty strings")
        return v


@app.put("/updateProfile")
async def update_profile(request: Request):
    try:
        # Authenticate user
        current_user = await get_current_user(request)
        if not current_user:
            raise HTTPException(status_code=401, detail="Unauthorized")  
        # Parse request body
        try:
            body = await request.json()
            print("Received profile data:", body)
            profile_data = UpdateProfile(**body)
        except ValidationError as e:
            print("Validation error:", str(e))
            raise HTTPException(status_code=422, detail=str(e))
        except Exception as e:
            print("Error parsing request:", str(e))
            raise HTTPException(status_code=400, detail="Invalid request data")

        # Update database
        try:
            client = pymongo.MongoClient(mongoUrl)
            db = client["glovera"]
            collection = db["students"]
            
            # Verify user exists
            user_id = profile_data.userId
            user = collection.find_one({"student_id": user_id})
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            personalInfo = ["first_name","last_name","date_of_birth","gender","phone_number"]
            educationInfo = ["current_qualification","graduation_year","institution","stream_of_study"]
            programInfo = ["desired_degree","field_of_interest","preferred_universities","preferred_countries"]
            financialInfo = ["budget_range","scholarship_interest","loan_requirement"]
            assessmentInfo = ["gre_score","gmat_score","ielts_score","toefl_score"]
            experienceInfo = ["total_exp"]

            update_data = {}
            profileKeys = profile_data.dict().keys()
            for key in profileKeys:
                if key in personalInfo:
                    update_data["personal_information"] = profile_data.dict()
                elif key in educationInfo:
                    update_data["education_background"] = profile_data.dict()
                elif key in programInfo:
                    update_data["program_interests"] = profile_data.dict()
                elif key in financialInfo:
                    update_data["financial_information"] = profile_data.dict()
                elif key in assessmentInfo:
                    update_data["assessment_scores"] = profile_data.dict()
                elif key in experienceInfo:
                    update_data["professional_experience"] = profile_data.dict()

            update_data["profile_completed"] = True

            update_data = {
                "personal_information": {
                    "first_name": profile_data.first_name,
                    "last_name": profile_data.last_name,
                    "date_of_birth": profile_data.date_of_birth,
                    "gender": profile_data.gender,
                    "phone_number": profile_data.phone_number
                },
                "education_background": {
                    "current_qualification": profile_data.current_qualification,
                    "graduation_year": profile_data.graduation_year,
                    "institution": profile_data.institution,
                    "stream_of_study": profile_data.stream_of_study
                },
                "program_interests": {
                    "desired_degree": profile_data.desired_degree,
                    "field_of_interest": profile_data.field_of_interest,
                    "preferred_universities": profile_data.preferred_universities,
                    "preferred_countries": profile_data.preferred_countries
                },
                "financial_information": {
                    "budget_range": profile_data.budget_range,
                    "scholarship_interest": profile_data.scholarship_interest,
                    "loan_requirement": profile_data.loan_requirement
                },
                "assessment_scores": {
                    "gre_score": profile_data.gre_score,
                    "gmat_score": profile_data.gmat_score,
                    "ielts_score": profile_data.ielts_score,
                    "toefl_score": profile_data.toefl_score
                },
                "professional_experience": {
                    "total_exp": profile_data.total_exp
                },
                "updated_at": datetime.utcnow(),
                "profile_completed": True
            }

            result = collection.update_one(
                {"student_id": user_id}, 
                {"$set": update_data}
            )
            
            if result.modified_count == 0:
                raise HTTPException(status_code=400, detail="Profile update failed")

            return {"message": "Profile Updated Successfully"}
        finally:
            client.close()
            
    except HTTPException as e:
        raise e
    except Exception as e:
        print("Unexpected error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/getAllStudents")
async def get_all_students(request: Request):
    try:
        current_user = await get_current_user(request)
        if current_user is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        collection = db["students"]
        
        # Await the request.json() method
        req_data = await request.json()
        pageNo = req_data.get("pageNo")
        
        if pageNo is None:
            raise HTTPException(status_code=400, detail="Page number is required")
        
        # Fetch the students from MongoDB
        users_find = collection.find({}, {"_id": 0}).limit(10).skip((pageNo - 1) * 10).to_list(length=None)
        
        if not users_find:
            client.close()
            raise HTTPException(status_code=404, detail="User not found")  
        # Convert the users_find object to a JSON-serializable format
        encoded_json = jsonable_encoder(users_find)
        for user in encoded_json:
            objectKeys = user.keys()
            for key in objectKeys:
                if key == "phone_number":
                    user[key] = decrypt(user[key])
                elif key == "email":
                    user[key] = decrypt(user[key])
        client.close()
        
        return {"Success": encoded_json}
    
    except Exception as e:
        return {"Error": str(e)}





class CreateSession(BaseModel):
    userId: str


@app.post("/createSession")
async def create_session(request: Request):
    try:
        check_jwt = await get_current_user(request)
        if check_jwt is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        reqData = await request.json()
        userId = reqData.get("userId")
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        userCollection = db["students"]
        user = userCollection.find_one({"student_id": userId},{"_id": 0,"student_id":1})
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        sessionCollection = db["sessions"]
        session_id = "SS" + str(int(time.time()))
        sysPrompt = mainPrompt
        session_data = {
            "sessionId": session_id,
            "student_id": userId,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "sysPrompt": sysPrompt,
            "chatHistory": [],
            "sessionStatus": "ACTIVE",
            "startTime": datetime.utcnow(),
            "endTime": datetime.utcnow(),

        }
        result = sessionCollection.insert_one(session_data)
        if result.inserted_id is None:
            raise HTTPException(status_code=400, detail="Session creation failed")
        return {"Success": "Session created successfully", "session_id": session_id}
    except Exception as e:
        print("Unexpected error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

class ChatSession(BaseModel):
    sessionId: str
    question: str
    userId: str

@app.post("/chatSession")
async def chat_session(request: Request):
    try:
        check_jwt = await get_current_user(request)
        if check_jwt is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        reqData = await request.json()
        sessionId = reqData.get("sessionId")
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        sessionCollection = db["sessions"]
        session = sessionCollection.find_one({"sessionId": sessionId})
        if session is None:
            client.close()
            raise HTTPException(status_code=404, detail="Session not found")
        chatHistory = session.get("chatHistory")
        filtered_chat = [{'role': item['role'], 'content': item['content']} for item in chatHistory]
        question = reqData.get("question")
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": session.get("sysPrompt"),
                },
                {
                    "role": "user",
                    "content": question,
                },
                {
                    "role": "assistant",
                    "content": "Here is the Chat History : " + str(filtered_chat),
                }
            ],
            model="llama3.1-8b-instant",
            stream=False,
            temperature=0.5,
            max_tokens=200,
            top_p=1,
            stop=None,
        )
        groqChat = chat_completion.choices[0].message.content
        print(groqChat)
        chatTime = datetime.utcnow()
        pushChat = []
        userHistory = {"role": "user", "content": question ,"time": chatTime}
        assistantHistory = {"role": "assistant", "content": groqChat, "time": chatTime}
        chatHistory.append({"question": question, "answer": groqChat, "time": chatTime})
        pushChat.append(userHistory)
        pushChat.append(assistantHistory)
        sessionCollection.update_one({"sessionId": sessionId}, {"set": {"updated_at": datetime.utcnow()},"$push": {"chatHistory": pushChat}})
        client.close()
        return {"Success": "Chat session created successfully"}

    except Exception as e:
        print("Unexpected error:", str(e))
        return {"Error": f"Error: {str(e)}"}

class EndSession(BaseModel):
    sessionId: str
    userId: str

@app.post("/endSession")
async def end_session(request: Request):
    try:
        check_jwt = await get_current_user(request)
        if check_jwt is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        reqData = await request.json()
        sessionId = reqData.get("sessionId")
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        sessionCollection = db["sessions"]
        session = sessionCollection.find_one({"sessionId": sessionId,"sessionStatus": "ACTIVE"})
        if session is None:
            client.close()
            raise HTTPException(status_code=404, detail="Session not found")
        sessionCollection.update_one({"sessionId": sessionId}, {"set": {"sessionStatus": "COMPLETED","endTime": datetime.utcnow()}})
        client.close()
        return {"Success": "Session ended successfully"}
    except Exception as e:
        print("Unexpected error:", str(e))
        return {"Error": f"Error: {str(e)}"}

class GetSession(BaseModel):
    sessionId: str
    email: str
    pageNo: int

@app.post("/getSession")
async def get_session(request: Request):
    try:
        check_jwt = await get_current_user(request)
        if check_jwt is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        reqData = await request.json()
        sessionId = reqData.get("sessionId")
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        pageNo = reqData.get("pageNo")
        sessionCollection = db["sessions"]
        session = sessionCollection.find({"sessionId": sessionId},{"_id": 0}).sort("created_at", pymongo.DESCENDING).skip((pageNo-1)*10).limit(10).to_list(length=None)
        if session is None:
            client.close()
            raise HTTPException(status_code=404, detail="Session not found")
        client.close()
        return {"Success": session}
    except Exception as e:
        print("Unexpected error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

class GetAllSession(BaseModel):
    email: str
    pageNo: int

@app.post("/getAllSession")
async def get_all_session(request: Request):
    try:
        check_jwt = await get_current_user(request)
        if check_jwt is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        reqData = await request.json()
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        pageNo = reqData.get("pageNo")
        sessionCollection = db["sessions"]
        session = sessionCollection.find({},{"_id": 0,"chatHistory": 0}).sort("created_at", pymongo.DESCENDING).skip((pageNo-1)*10).limit(10).to_list(length=None)
        if session is None:
            client.close()
            raise HTTPException(status_code=404, detail="Session not found")
        client.close()
        return {"Success": session}
    except Exception as e:
        print("Unexpected error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/getChatHistory")
async def getChatHistory(request: Request):
    try:
        check_jwt = await get_current_user(request)
        if check_jwt is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        reqData = await request.json()
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        pageNo = reqData.get("pageNo")
        sessionCollection = db["sessions"]
        sessionId = reqData.get("sessionId")
        
        # Fetch the session data from MongoDB
        session = sessionCollection.find_one({"sessionId": sessionId}, {
            "_id": 0,
            "chatHistory": {
                "$slice": [(pageNo - 1) * 10, 10]
            }
        })
        
        if session is None:
            client.close()
            raise HTTPException(status_code=404, detail="Session not found")
        
        client.close()
        session_json = jsonable_encoder(session)
        
        return {"Success": session_json}
    
    except Exception as e:
        print("Unexpected error:", str(e))
        return {"Error": f"Error: {str(e)}"}

class AddUniversity(BaseModel):
    universityId: str
    uviersityName: str
    location: str


# Pydantic Models
class FeeStructure(BaseModel):
    original_price: Optional[int]
    discounted_price: Optional[int]

class Duration(BaseModel):
    india: Optional[str]
    usa: Optional[str]

class EligibilityCriteria(BaseModel):
    required_tests: Optional[List[str]]
    scholarship_info: Optional[str]
    duration: Optional[Duration]
    fee_structure: Optional[FeeStructure]

class Program(BaseModel):
    program_name: str
    specializations: Optional[List[str]]
    eligibility_criteria: Optional[EligibilityCriteria]

class University(BaseModel):
    universityId: Optional[int]
    name: Optional[str]
    location: Optional[str]

# CRUD Operations
@app.post("/university/", response_description="Add new university", status_code=status.HTTP_201_CREATED)
async def create_university(university: University, request: Request):
    try:
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        university_collection = db["programs"]
        
        # Generate programId
        programId = "PR" + str(int(time.time()))
        
        # Create a new dictionary from the university object
        uniData = university.dict(exclude_unset=True)
        uniData["programId"] = programId
        uniData["programs"] = []
        
        # Check if the university already exists
        existing = university_collection.find_one({"universityId": university.universityId})
        if existing:
            client.close()
            return {"Error": False, "Error": "University with this ID already exists."}
        
        # Insert the new university data into MongoDB
        result = university_collection.insert_one(uniData)
        client.close()
        
        return {"Success": True, "Error": None, "Data": {"id": str(result.inserted_id)}}
    
    except Exception as e:
        print("Unexpected error:", str(e))
        return {"Error": False, "Error": str(e)}


@app.get("/getAllUniversities/", response_model=dict)
async def get_all_universities(request: Request):
    try:
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        university_collection = db["programs"]
        university = university_collection.find({}, {"_id": 0}).to_list(length=None)
        encoded_university = jsonable_encoder(university)
        client.close()
        if not encoded_university:
            return {"Success": False, "Error": "University not found."}
        return {"Success": True, "Error": None, "Data": encoded_university}
    except Exception as e:
        print("Unexpected error:", str(e))
        return {"Error": False, "Error": str(e)}

@app.get("/university/{university_id}", response_model=dict)
async def get_university(university_id: int, request: Request):
    try:
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        university_collection = db["programs"]
        university = await university_collection.find_one({"universityId": university_id})
        client.close()
        if not university:
            return {"Success": False, "Error": "University not found."}
        return {"Success": True, "Error": None, "Data": university}
    except Exception as e:
        return {"Error": False, "Error": str(e)}

@app.patch("/university/{university_id}", response_model=dict)
async def update_university(university_id: int, updates: University, request: Request):
    try:
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        university_collection = db["programs"]
        update_data = updates.dict(exclude_unset=True)
        updated = await university_collection.find_one_and_update(
            {"universityId": university_id},
            {"$set": update_data},
            return_document=True
        )
        client.close()
        if not updated:
            return {"Error": False, "Error": "University not found."}
        return {"Success": True, "Error": None, "Data": updated}
    except Exception as e:
        return {"Error": False, "Error": str(e)}

@app.delete("/university/{university_id}", response_description="Delete university")
async def delete_university(university_id: int, request: Request):
    try:
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        university_collection = db["programs"]
        delete_result = await university_collection.delete_one({"universityId": university_id})
        client.close()
        if delete_result.deleted_count == 0:
            return {"Error": False, "Error": "University not found."}
        return {"Success": True, "Error": None, "Message": "University deleted successfully."}
    except Exception as e:
        return {"Error": False, "Error": str(e)}

@app.post("/university/{university_id}/program/", response_description="Add program to university", status_code=status.HTTP_201_CREATED)
async def add_program(university_id: int, program: Program, request: Request):
    try:
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        university_collection = db["programs"]
        university = university_collection.find_one({"universityId": university_id})
        if not university:
            client.close()
            return {"Error": False, "Error": "University not found."}

        university_collection.update_one(
            {"universityId": university_id},
            {"$push": {"programs": program.dict(exclude_unset=True)}}
        )
        client.close()
        return {"Success": True, "Error": None, "Message": "Program added successfully."}
    except Exception as e:
        return {"Error": False, "Error": str(e)}

@app.get("/university/{university_id}/programs/", response_model=dict)
async def get_programs(university_id: int, request: Request):
    try:
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        university_collection = db["programs"]
        university = await university_collection.find_one({"universityId": university_id})
        client.close()
        if not university:
            return { "Error": "University not found."}
        return {"Success": True, "Error": None, "Data": university.get("programs", [])}
    except Exception as e:
        return { "Error": str(e)}

@app.patch("/university/{university_id}/program/{program_name}", response_description="Update a program")
async def update_program(university_id: int, program_name: str, program_update: Program, request: Request):
    try:
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        university_collection = db["programs"]
        university = await university_collection.find_one({"universityId": university_id})
        if not university:
            client.close()
            return {"Error": "University not found."}

        programs = university.get("programs", [])
        for program in programs:
            if program["program_name"] == program_name:
                program.update(program_update.dict(exclude_unset=True))
                break
        else:
            client.close()
            return { "Error": "Program not found."}

        await university_collection.update_one(
            {"universityId": university_id},
            {"$set": {"programs": programs}}
        )
        client.close()
        return {"Success": True, "Error": None, "Message": "Program updated successfully."}
    except Exception as e:
        return { "Error": str(e)}

@app.delete("/university/{university_id}/program/{program_name}", response_description="Delete a program")
async def delete_program(university_id: int, program_name: str, request: Request):
    try:
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        university_collection = db["programs"]
        university = await university_collection.find_one({"universityId": university_id})
        if not university:
            client.close()
            return {"Error": "University not found."}

        programs = [p for p in university.get("programs", []) if p["program_name"] != program_name]

        await university_collection.update_one(
            {"universityId": university_id},
            {"$set": {"programs": programs}}
        )
        client.close()
        return {"Success": True,"Message": "Program deleted successfully."}
    except Exception as e:
        return {"Error": str(e)}

@app.post("/getDashboard")
async def get_dashboard(request: Request):
    try:
        current_user = await get_current_user(request)
        if current_user is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        userId = current_user.get("userId")
        client = pymongo.MongoClient(mongoUrl)
        db = client["glovera"]
        collection = db["students"]
        session_collection = db["sessions"]
        projectionQuery = {"_id": 0,"student_id":0,"profile_picture":0}
        totalUsers = collection.count_documents({})
        totalSessions = session_collection.count_documents({})
        totalActiveSessions = session_collection.count_documents({"sessionStatus": "ACTIVE"})
        totalCompletedSessions = session_collection.count_documents({"sessionStatus": "COMPLETED"})
        pipeline = [
            {"$match": {}},
            {"$group": {"_id": "$student_id"}},
            {"$count": "unique_students"}
        ]
        unique_students_result = list(session_collection.aggregate(pipeline))
        # Extract the count of unique students
        unique_students_count = unique_students_result[0]["unique_students"] if unique_students_result else 0
        result = {
            "totalUsers": totalUsers,
            "totalSessions": totalSessions,
            "totalActiveSessions": totalActiveSessions,
            "totalCompletedSessions": totalCompletedSessions,
            "unique_students": unique_students_count
        }
        client.close()
        return {"Success":result}
    except Exception as e:
        return {"Error": f"Error: {str(e)}"}


# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

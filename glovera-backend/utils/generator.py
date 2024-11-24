from jose import JWTError, jwt
import os
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Request, status
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import padding as pad
from cryptography.hazmat.backends import default_backend
import base64
from datetime import datetime, timedelta
import dotenv
import hashlib
dotenv.load_dotenv()

existing_key = os.getenv("SECRET_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

crypto_secret_key = os.getenv("CRYPTO_SECRET_KEY")
crypto_secret_iv = os.getenv("CRYPTO_SECRET_IV")
crypto_encrypt_method = os.getenv("CRYPTO_ENCRYPT_METHOD")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(request: Request):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Get token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise credentials_exception
            
        token = auth_header.split(" ")[1]
        print("Received token:", token)

        
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        print("Decoded payload:", payload)
        payloadKey = payload.keys()
        print("Payload keys:", payloadKey)
        
        reqJson = await request.json()
        print("Received request JSON:", reqJson)
        # Get the user ID from the payload  
        if "userId" in payloadKey:
            value = payload.get("userId")
            if value is None or value != reqJson.get("userId"):
                raise credentials_exception
        elif "email" in payloadKey:
            value = payload.get("email")
            if value is None or value != reqJson.get("email"):
                raise credentials_exception
        else:
            raise credentials_exception
            
        return payload
            
    except JWTError:
        raise credentials_exception
    except Exception as e:
        print(f"Error: {str(e)}")
        return None



def generate_key_and_iv(secret_key, secret_iv):
    # Generate the key and IV using SHA-512
    digest_key = hashes.Hash(hashes.SHA512(), backend=default_backend())
    digest_key.update(secret_key.encode('utf-8'))
    key = digest_key.finalize()[:32]  # Use the first 32 bytes for the key

    digest_iv = hashes.Hash(hashes.SHA512(), backend=default_backend())
    digest_iv.update(secret_iv.encode('utf-8'))
    iv = digest_iv.finalize()[:16]  # Use the first 16 bytes for the IV

    return key, iv

def encrypt(plain_text):
    try:
        key, iv = generate_key_and_iv(crypto_secret_key, crypto_secret_iv)
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        encryptor = cipher.encryptor()
        padder = pad.PKCS7(algorithms.AES.block_size).padder()
        padded_data = padder.update(plain_text.encode('utf-8')) + padder.finalize()
        encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
        return base64.b64encode(encrypted_data).decode('utf-8')
    except Exception as e:
        return plain_text

def decrypt(encrypted_message):
    try:
        key, iv = generate_key_and_iv(crypto_secret_key, crypto_secret_iv)
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        encrypted_data = base64.b64decode(encrypted_message)
        decrypted_padded_data = decryptor.update(encrypted_data) + decryptor.finalize()
        unpadder = pad.PKCS7(algorithms.AES.block_size).unpadder()
        decrypted_data = unpadder.update(decrypted_padded_data) + unpadder.finalize()
        return decrypted_data.decode('utf-8')
    except Exception as e:
        return encrypted_message

// "use client";

// import React, { useState, useCallback, useEffect ,useRef, useMemo} from 'react';
// import { Howl } from 'howler';
// import Image from 'next/image';
// import axios from 'axios';
// import TranscriptionList from './components/TranscriptionList';
// import useAudioQueue from './components/AudioQueue';
// import { SpeechChunks } from "../src/vad/SpeechChunks";
// import AWS from 'aws-sdk';
// import { Canvas } from "@react-three/fiber";
// import { Experience } from "./InterviewSpace/Experience";
// import { useRouter } from "next/router";
// import * as ort from 'onnxruntime-web';
// import { useGLTF } from '@react-three/drei';
// import { useFBX } from '@react-three/drei';
// import { Mic, CallEnd, Add, Close, CallToAction, MicOff } from "@mui/icons-material";
// import { Backdrop, Box, Fade, IconButton, List, ListItem, ListItemText, Modal,  } from "@mui/material";
// import CustomAlert from "./hooks/CustomAlert";

// const AWS_ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY;
// const AWS_SECRET_KEY = process.env.NEXT_PUBLIC_AWS_SECRET_KEY;
// const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION;
// const VIEW_MODE = process.env.NEXT_PUBLIC_VIEW_MODE;
// const API_URL = process.env.NEXT_PUBLIC_API_URL;
// const NEXT_URL = process.env.NEXT_PUBLIC_NEXT_URL;
// const REDIRECT_URL = process.env.NEXT_PUBLIC_REDIRECT_URL;

// const API_CALL_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
// const CHECK_INTERVAL = 1 * 60 * 1000; // 1 minute in milliseconds (for checking every minute

// // http://localhost:3000/?avatar=1&timeStamp=1729751680326

// const awsConfig = {
//   accessKeyId: AWS_ACCESS_KEY, // Your AWS access key ID
//   secretAccessKey: AWS_SECRET_KEY, // Your AWS secret access key
//   region: AWS_REGION
// };

// AWS.config.update(awsConfig);

// const polly_client = new AWS.Polly();

// const characters = [
//   {
//       no: 101,
//       name: "Ethan",
//       avatar: "https://renambl.blr1.cdn.digitaloceanspaces.com/web/avatars/Avatar_Male1.glb",
//       voiceCharcter: "Joey",
//       engine: "standard"
//   },
//   {
//       no: 102,
//       name: "Mia",
//       avatar: "https://renambl.blr1.cdn.digitaloceanspaces.com/web/avatars/Avatar_Female2.glb",
//       voiceCharcter: "Aditi",
//       engine: "standard"
//   },
//   {
//       no: 103,
//       name: "Caleb",
//       avatar: "https://renambl.blr1.cdn.digitaloceanspaces.com/web/avatars/Avatar_Male3.glb",
//       voiceCharcter: "Brian",
//       engine: "standard"
//   },
//   {
//       no: 104,
//       name: "Ava",
//       avatar: "https://renambl.blr1.cdn.digitaloceanspaces.com/web/avatars/Avatar_Female1.glb",
//       voiceCharcter: "Raveena",
//       engine: "standard"
//   },
//   {
//       no: 105,
//       name: "Lucas",
//       avatar: "https://renambl.blr1.cdn.digitaloceanspaces.com/web/avatars/Avatar_Male2.glb",
//       voiceCharcter: "Russell",
//        engine: "standard"
//   },
//   {
//       no: 106,
//       name: "Sophie",
//       avatar: "https://renambl.blr1.cdn.digitaloceanspaces.com/web/avatars/Avatar_Female3.glb",
//       voiceCharcter: "Nicole",
//       engine: "standard"
//   },

// ]

// const Home = () => {

//   // const [transcriptions, setTranscriptions] = useState([]);
//   const [debugInfo, setDebugInfo] = useState('');
//   const [isListeningSpeech, setIsListeningSpeech] = useState(false);
//   const [audioBlobs, setAudioBlobs] = useState([]);
//   const [chatHistory, setChatHistory] = useState([]);
//   // const avatar = "https://renambl.blr1.cdn.digitaloceanspaces.com/web/avatars/Avatar_Male1.glb"
//   const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  

//   const newEpoch = useRef(Date.now());
//   const [resTTS, setResTTS] = useState({text: '', blob: null});
//   const [startPlay, setStartPlay] = useState(false);
//   const chunks = useRef(null);
//   const pollyVoice = useRef(null);
//   const [loading, setLoading] = useState(false);
//   const [characterSet, setCharacterSet] = useState(null);
//   const userId = useRef(null);
//   const [microphoneStatus, setMicrophoneStatus] = useState(null);
//   const storeQuery = useRef({});
//   const [holdFlag,setHoldFlag] = useState(false);
//   const [prevQues,setPrevQues] = useState("");


//   const [speakerListening, setSpeakerListening] = useState(false);
//   const requestAnimationFrameId = useRef(null);
//   const [isZoomed, setIsZoomed] = useState(false);
//   const [holdAndRelease, setHoldAndRelease] = useState(false);
//   const [audioBars, setAudioBars] = useState(new Array(14).fill(50));
//   const [fullTranscript, setFullTranscript] = useState("");
//   const [isListening, setIsListening] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [finalResultReceived, setFinalResultReceived] = useState(false);
//   const [isPressed, setIsPressed] = useState(false); 
//   const [isLanguageOpen, setIsLanguageOpen] = useState(false); 
//   const [isContentVisible, setIsContentVisible] = useState(false); 
//   const [isExiting, setIsExiting] = useState(false);
//   // const [speakEngine, setSpeakEngine] = useState("neural");
//   const [stopRef, setStopRef] = useState(null);
//   const speakEngine = useRef("standard");
//   const recordType = useRef("VAD");

//   const [isRecording, setIsRecording] = useState(false);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);

//   const audioContext = useRef(null);
//   const analyser = useRef(null);
//   const mediaStream = useRef(null);

//   const mediaRecorder = useRef(null);
//   const audioChunks = useRef([]);


//   const [showAlert, setShowAlert] = useState(false);
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertType, setAlertType] = useState('');

//   const lastAPICall = useRef(null);
//   const lastHold = useRef(null);
//   const apiCallIntervalId = useRef(null);
//   const holdIntervalId = useRef(null);
//   const sessionStarted = useRef(false);


//   // const languages = [
//   //   {code:"en",name:"English", keyword: "A"},
//   //   {code:"ta",name:"Tamil", keyword: "அ"},
//   //  { code:"hi",name:"Hindi", keyword: "अ"},
//   //  {code:"ml",name:"Malayalam", keyword: "അ"},
//   //  {code:"kn",name:"Kannada", keyword: "ಅ"},
//   //  {code:"mr",name:"Marathi", keyword: "अ"},
//   //  {code:"te",name:"Telugu", keyword: "అ"},
//   //  {code:"pa",name:"Punjabi", keyword: "ਅ"},
//   //  {code:"bn",name:"Bengali", keyword: "অ"},
//   //  {code:"gu",name:"Gujarati", keyword: "અ"},
//   //  {code:"or",name:"Odia", keyword: "ଅ"},
//   // ]
//   const languages = [
//     {
//       code: "en-US",
//       name: "English (United States)",
//       sourceLanguage: "en",
//       keyword: "A",
//       WhisperCode:"en"
//     },
//     {
//       code: "en-GB",
//       name: "English (United Kingdom)",
//       sourceLanguage: "en",
//       keyword: "En",
//       WhisperCode:"en"
//     },
//     {
//       code: "es-ES",
//       name: "Spanish (Spain)",
//       sourceLanguage: "es",
//       keyword: "Sp",
//       WhisperCode:"es"
//     },
//     {
//       code: "es-MX",
//       name: "Spanish (Mexico)",
//       sourceLanguage: "es",
//       keyword: "Me",
//       whisperCode:"es"
//     },
//     {
//       code: "fr-FR",
//       name: "French (France)",
//       sourceLanguage: "fr",
//       keyword: "Fr",
//       whisperCode:"fr"
//     },
//     {
//       code: "de-DE",
//       name: "German (Germany)",
//       sourceLanguage: "de",
//       keyword: "Gr",
//       whisperCode:"de"
//     },
//     {
//       code: "it-IT",
//       name: "Italian (Italy)",
//       sourceLanguage: "it",
//       keyword: "It",
//       whisperCode:"it"
//     },
//     { code: "ja-JP", name: "Japanese", sourceLanguage: "ja", keyword: "あ" ,whisperCode:"ja"},
//     {
//       code: "zh-CN",
//       name: "Chinese (Simplified, China)",
//       sourceLanguage: "zh",
//       keyword: "中",
//       whisperCode:"zh"
//     },
//     { code: "ko-KR", name: "Korean", sourceLanguage: "ko", keyword: "가" ,whisperCode:"ko"},
//     { code: "ru-RU", name: "Russian", sourceLanguage: "ru", keyword: "Ru" ,whisperCode:"ru"},
//     {
//       code: "pt-BR",
//       name: "Portuguese (Brazil)",
//       sourceLanguage: "pt",
//       keyword: "Po",
//       whisperCode:"pt"
//     },
//     {
//       code: "ar-SA",
//       name: "Arabic (Saudi Arabia)",
//       sourceLanguage: "ar",
//       keyword: "ـس",
//       whisperCode:"ar"
//     },
//     {
//       code: "hi-IN",
//       name: "Hindi (India)",
//       sourceLanguage: "hi",
//       keyword: "अ",
//       whisperCode:"hi"
//     },
//     {
//       code: "ta-IN",
//       name: "Tamil (India)",
//       sourceLanguage: "ta",
//       keyword: "அ",
//       whisperCode:"ta"
//     },
//     {
//       code: "ml-IN",
//       name: "Malayalam (India)",
//       sourceLanguage: "ml",
//       keyword: "അ",
//       whisperCode:"ml"
//     },
//     {
//       code: "nl-NL",
//       name: "Dutch (Netherlands)",
//       sourceLanguage: "nl",
//       keyword: "D",
//       whisperCode:"nl"
//     },
//     { code: "sv-SE", name: "Swedish", sourceLanguage: "sv", keyword: "Sw" ,whisperCode:"sv"},
//     { code: "tr-TR", name: "Turkish", sourceLanguage: "tr", keyword: "Tu" ,whisperCode:"tr"},
//     { code: "pl-PL", name: "Polish", sourceLanguage: "pl", keyword: "Po" ,whisperCode:"pl"},
//     { code: "th-TH", name: "Thai", sourceLanguage: "th", keyword: "ท" ,whisperCode:"th"},
//     { code: "vi-VN", name: "Vietnamese", sourceLanguage: "vi", keyword: "Vi" ,whisperCode:"vi"},
//     {
//       code: "kn-IN",
//       name: "Kannada (India)",
//       sourceLanguage: "kn",
//       keyword: "ಅ",
//       whisperCode:"kn"
//     },
//     {
//       code: "bn-IN",
//       name: "Bengali (India)",
//       sourceLanguage: "bn",
//       keyword: "অ",
//       whisperCode:"bn"
//     },
//     {
//       code: "mr-IN",
//       name: "Marathi (India)",
//       sourceLanguage: "mr",
//       keyword: "अ",
//       whisperCode:"mr"
//     },
//     {
//       code: "gu-IN",
//       name: "Gujarati (India)",
//       sourceLanguage: "gu",
//       keyword: "અ",
//       whisperCode:"gu"
//     },
//     {
//       code: "pa-IN",
//       name: "Punjabi (India)",
//       sourceLanguage: "pa",
//       keyword: "ਅ",
//       whisperCode:"pa"
//     },
//     {
//       code: "or-IN",
//       name: "Oriya (India)",
//       sourceLanguage: "or",
//       keyword: "ଅ",
//       whisperCode:"or"
//     },
//     {
//       code: "as-IN",
//       name: "Assamese (India)",
//       sourceLanguage: "as",
//       keyword: "অ",
//       whisperCode:"as"
//     },
//     {
//       code: "te-IN",
//       name: "Telugu (India)",
//       sourceLanguage: "te",
//       keyword: "అ",
//       whisperCode:"te"
//     },
//   ];



//   const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);


//   const startAPIInterval = () =>{
//     apiCallIntervalId.current = setInterval(()=>{
//       const nowDate = Date.now();
//       if(lastAPICall.current && (nowDate - lastAPICall.current) >= API_CALL_INTERVAL ){
//         endSession("TOO_LATE")
//       }

//     },CHECK_INTERVAL);
//   }

//   const startHoldInterval = () =>{
//     if(apiCallIntervalId.current){
//       stopAPIInterval();
//     }
//     holdIntervalId.current = setInterval(()=>{
//       const nowDate = Date.now();
//       console.log("setIntervalCallingHolded :",lastHold.current,(nowDate - lastHold.current),API_CALL_INTERVAL)
//       if(lastHold.current && (nowDate - lastHold.current) >= API_CALL_INTERVAL ){
//         endSession("HOLDED_BY_USER")
//       }

//     },CHECK_INTERVAL);
//   }

//   const stopAPIInterval = () =>{
//     if(apiCallIntervalId.current){
//       clearInterval(apiCallIntervalId.current)
//     }
//   }

//   const stopHoldInterval = () =>{
//     if(holdIntervalId.current){
//       clearInterval(holdIntervalId.current)
//     }
//   }


//   const handleAlert = (obj) => {
//     console.log(obj);
//     let {msg,type} = obj;
//     // Simulate a response from an API or some other action
//     setAlertMessage(msg);
//     setAlertType(type);
//     setShowAlert(true);
//   };

//   const closeAlert = () => {
//     setShowAlert(false);
//   };

//   const handleChange = (selecLan) => {
//     const selectedLang = languages.find((lang) => lang.code === selecLan);
//     setSelectedLanguage(selectedLang);
//     handleLanguageModelClose()
//   };


//   const checkMicrophoneAccess = async () => {
//     try {
//       // Try to request microphone access
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       if (stream) {
//         //  alert('Microphone is available');
//         setMicrophoneStatus('Microphone is available');
//         // Stop the stream to release the microphone
//         stream.getTracks().forEach(track => track.stop());
//         return true;
//       }
//     } catch (error) {
//       //  alert('Microphone is not available: ' + error.message);
//       setMicrophoneStatus(`Microphone is not available: ${error.message}`);
//       return false;
//     }
//   };

//   // let chunks = null;

//   function isDifferenceLessThanOneMinute(epochTime1) {
//     const oneMinuteInMilliseconds = 10 * 1000;
//     const epochTime2 = Date.now();
//     console.log(epochTime1, epochTime2);
//     const differenceInMilliseconds = Math.abs(epochTime1 - epochTime2);
//     console.log(differenceInMilliseconds, oneMinuteInMilliseconds);
//     return differenceInMilliseconds < oneMinuteInMilliseconds;
//   }


    

//   const parseQueryParams = (url) => {
//     const queryString = url.split('?')[1];
//     if (!queryString) return {};

//     const params = new URLSearchParams(queryString);
//     const queryParams = {};
//     for (let [key, value] of params.entries()) {
//       queryParams[key] = value;
//     }
//     return queryParams;
//   };

//   async function startVAD() {
//     try {
//       sessionStarted.current = true;
//       setStopRef(false);
//       chunks.current = speechChunks; // Use the memoized SpeechChunks instance
//       chunks.current.start();

//       return () => chunks.current.stop();
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   const speechChunks = useMemo(() => {
//     return new SpeechChunks(
//       () => {
//         console.log("speech start");
//         setIsListeningSpeech(true);
//       },
//       (blob) => {
//         console.log("STARTVAD blob", blob);
//         console.log("STARTVAD speech end");
//         setIsListeningSpeech(false);
//         setAudioBlobs([blob]);
//         saveAudio(blob, "no");
//         setIsAudioPlaying(false);
//       }
//     );
//   }, []);

//   useEffect(() => {
//     const url = window.location.href;
//     const params = parseQueryParams(url);
//     let micCheck = checkMicrophoneAccess();
//     if(micCheck){
//       if(params?.accId && params?.sessionId && params?.token && params?.avatar && params?.timeStamp){
//         storeQuery.current = params;
//         const filterCharcter = characters.filter((character) => character.no === Number(params.avatar));
//         const timeStamp = params.timeStamp;
//         console.log(filterCharcter,params);
//         if(filterCharcter.length > 0){
//           pollyVoice.current = filterCharcter[0].voiceCharcter;
//           setCharacterSet(filterCharcter[0].avatar);
//           console.log("filterCharcter[0].engine",filterCharcter[0].engine);
//           speakEngine.current = filterCharcter[0].engine;
//           // setSpeakEngine(filterCharcter[0].engine);
//           textToSpeech("Hello, Can we start the converstion?");
//           if(VIEW_MODE == "prod"){
//             if(isDifferenceLessThanOneMinute(timeStamp)){
//               setLoading(true);
//               setStartPlay(true);
//             }else{
//               setLoading(false);
//                window.location.href =  REDIRECT_URL;
//             }
//           }else{
//             setStartPlay(true);
//           }   
//         }
//       }else{
//         return window.location.href = REDIRECT_URL
//       }
//     }else{
//       // alert("Please Enable your Microphone Permisson...")
//       handleAlert({msg:"Please Enable your Microphone Permisson...",type:"failure"});
//     }



//   }, []);

//   useEffect(() => {
//     if(loading){
//       startVAD();      
//     }
//   }, [loading]);

//   useEffect(() => {
//     if(startPlay){
//       async function startSession(){
//         try{
//           const response = await axios.post(API_URL+'/session/startSession',
//             { "accId":storeQuery.current.accId,
//               "avatarId":storeQuery.current.avatar,
//               "sessionId":storeQuery.current.sessionId,
//             },
//             {
//               headers: {
//                 "x-access-token": storeQuery.current.token
//               },
//             },
//             { responseType: 'json' }
//           );
//           console.log("startSessionAPI :",response?.data)
//           if(response?.data?.Success){
//             setLoading(true);
//           }else{
//             setTimeout(()=>{
//               window.location.href = REDIRECT_URL
//             },3000);
//           }

//         }catch(error){
//           if (error.response && error.response.status === 400) {
//             const errorMessage = typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : error.response.data;
//             handleAlert({msg:errorMessage,type:"failure"});
//             // alert(`Bad Request: ${errorMessage}`);
//           } else if (error.response && error.response.data) {
//             alert(error.response.data);
//           } else {
//             alert('An unexpected error occurred.');
//           }
//           setTimeout(()=>{
//             window.location.href = REDIRECT_URL
//           },3000);
//           // endSession("SESSION_EXPIRED_OR_INSUFFICIENT_CREDITS");
//         }

//       }
//       startSession();
//     }
//   }, [startPlay]);


//   async function holdSession(holdType){
//     lastHold.current = new Date();
//     try{
//       const response = await axios.post(API_URL+'/session/holdSession',
//         { "accId":storeQuery.current.accId,
//           "sessionId":storeQuery.current.sessionId,
//           "holdType":holdType
//         },
//         {
//           headers: {
//             "x-access-token": storeQuery.current.token
//           },
//         },
//         { responseType: 'json' }
//       );
//       console.log("holdSession :",response?.data)
//       if(response?.data?.Success){
//         if(holdType == "START"){
//           startHoldInterval();
//           stopVAD();
//         }else if(holdType=="END"){
//           stopHoldInterval();
//           startVAD();
//         }
//       }else{
//         setTimeout(()=>{
//           window.location.href = REDIRECT_URL
//         },3000);
//       }
//     }catch(error){
//       if (error.response && error.response.status === 400) {
//         const errorMessage = typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : error.response.data;
//         handleAlert({msg:errorMessage,type:"failure"});
//         // alert(`Bad Request: ${errorMessage}`);
//       } else if (error.response && error.response.data) {
//         alert(error.response.data);
//       } else {
//         alert('An unexpected error occurred.');
//       }

//     }


//   }


//   async function endSession(endReason){
//     try{
//       setIsListeningSpeech(false);
//       stopVAD();
//       const response = await axios.post(API_URL+'/session/endSession',
//         { "accId":storeQuery.current.accId,
//           "sessionId":storeQuery.current.sessionId,
//           "endReason":endReason
//         },
//         {
//           headers: {
//             "x-access-token": storeQuery.current.token
//           },
//         },
//         { responseType: 'json' }
//       );
//       console.log("endSessionAPI :",response?.data)
//       if(response?.data?.Success){
//         setTimeout(()=>{
//           window.location.href = REDIRECT_URL
//         },3000);
//       }else{
//         setTimeout(()=>{
//           window.location.href = REDIRECT_URL
//         },3000);
//       }
//     }catch(error){
//       if (error.response && error.response.status === 400) {
//         const errorMessage = typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : error.response.data;
//         handleAlert({msg:errorMessage,type:"failure"});
//         // alert(`Bad Request: ${errorMessage}`);
//       } else if (error.response && error.response.data) {
//         alert(error.response.data);
//       } else {
//         alert('An unexpected error occurred.');
//       }
      
//     }


//   }

//   async function stopVAD() {
//     if (chunks.current) {
//       sessionStarted.current = false;
//       chunks.current.stop();
//       console.log("VAD stopped");
//     } else {
//       console.log("VAD is not running");
//     }
//   }

//   const textToSpeech = async (text) => {
//     let replaceText = text.replace(".","...")
//     const params = {
//         Engine: speakEngine.current,
//         Text: replaceText,
//         OutputFormat: 'mp3',
//         VoiceId: pollyVoice.current
//     };

//     try {
//         const response = await polly_client.synthesizeSpeech(params).promise();
//         if (response.AudioStream) {
//             const url = URL.createObjectURL(new Blob([response.AudioStream], { type: 'audio/wav' }));
//             console.log("Polly Streaming audio", url);
//             // enqueueAudio(response.AudioStream);
//             // setTtsText(removeSpecialCharacters(text));
//             // setResAudioBlob(url);
//             setIsAudioPlaying(true);
//             setResTTS({text: removeSpecialCharacters(replaceText), blob: url});
//         } else {
//             console.log("Polly Could not stream audio");
//         }
//     } catch (error) {
//         console.log("Polly Error synthesizing speech:", error);
//     }
// };


// const handleReload = () => {
//   console.log('User confirmed the reload!');
//   console.log('Clearing @react-three/drei models');
//   // ort.InferenceSession.clear();
//   useFBX.clear();
//   useGLTF.clear();

//   window.location.reload();
// };

// // Event listener for the beforeunload event
// useEffect(() => {
//   const handleBeforeUnload = (event) => {
//     // Cancel the event as stated by the standard.
//     event.preventDefault();
//     // Chrome requires returnValue to be set.
//     event.returnValue = '';

//     // Call the handleReload function when the user confirms
//     window.addEventListener('unload', handleReload);
//   };

//   window.addEventListener('beforeunload', handleBeforeUnload);

//   // Cleanup the event listener when the component unmounts
//   return () => {
//     window.removeEventListener('beforeunload', handleBeforeUnload);
//     window.removeEventListener('unload', handleReload);
//   };
// }, []);




// function removeSpecialCharacters(text) {
//   return text.replace(/[^a-zA-Z0-9 ]/g, '');
// }

// function getRandomFiller() {
//   const list_fillters = ["Hmm", "Uh", "Well", "okay", "Just a minute", "Hang on", "Give me a minute", "Just a moment", "Give me a second"];
//   const randomIndex = Math.floor(Math.random() * list_fillters.length);
//   return list_fillters[randomIndex];
// }



// async function saveAudio(audioBlob, typeIs) {
//     // Check if the blob is empty
//     if (audioBlob.size === 0) {
//       // setDebugInfo(prevInfo => `${prevInfo}\nAudio blob is empty, not saving`);
//       return false;
//   }

//   // Create an audio context
//   const audioContext = new (window.AudioContext || window.webkitAudioContext)();

//   // Convert the blob to an array buffer
//   const arrayBuffer = await audioBlob.arrayBuffer();

//   // Decode the audio data
//   const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

//   // Function to calculate RMS of a set of samples
//   function calculateRMS(samples) {
//       const sum = samples.reduce((acc, val) => acc + val * val, 0);
//       return Math.sqrt(sum / samples.length);
//   }

//   // Improved function to estimate frequency using zero-crossings
//   function estimateFrequency(samples, sampleRate) {
//       let zeroCrossings = 0;
//       for (let i = 1; i < samples.length; i++) {
//           if ((samples[i] > 0 && samples[i - 1] <= 0) || 
//               (samples[i] < 0 && samples[i - 1] >= 0)) {
//               zeroCrossings++;
//           }
//       }
      
//       // Each zero crossing represents half a cycle
//       const numCycles = zeroCrossings / 2;
//       const duration = samples.length / sampleRate;
//       return numCycles / duration;
//   }

//   // Analyze the audio data for volume and pitch
//   const channelData = audioBuffer.getChannelData(0);
//   const windowSize = audioContext.sampleRate * 0.02; // 20ms window
//   let maxRMS = 0;
//   let hasSpeechPitch = false;

//   for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
//       const window = channelData.slice(i, i + windowSize);
//       const rms = calculateRMS(window);
//       maxRMS = Math.max(maxRMS, rms);

//       // Check pitch if we have a significant volume
//       if (rms > 0.01) {
//           const frequency = estimateFrequency(window, audioContext.sampleRate);
//           // console.log(`Frequency: ${frequency} Hz`, rms);
//           // Check if the frequency is in the typical speech range (roughly 85-255 Hz)
//           if (frequency >= 85 && frequency <= 255) {
//               hasSpeechPitch = true;
//               break; // We found a speech-like segment, no need to continue
//           }
//       }
//   }
//   const hasSignificantVolume = maxRMS > 0.01; // Adjust threshold as needed
//   if (!hasSignificantVolume || !hasSpeechPitch) {
//       setDebugInfo(prevInfo => `${prevInfo}\nNo significant speech detected, not saving`);
//       return false;
//   }
//   // saveAsMp3(audioBlob);
  
//   // If there is significant volume and speech-like pitch, proceed to save the audio
//   const formData = new FormData();
//   formData.append('audio', audioBlob, 'recording.mp3');
//   formData.append('trans', typeIs);
//   formData.append('lang', selectedLanguage.whisperCode);

//   try {
//       let url = "/character/api/transcribe";
//       if(VIEW_MODE === "prod") {
//         url = NEXT_URL +"/api/transcribe";
//       }
//        const response = await axios.post(url, formData, {
//         // const response = await axios.post('/character/api/transcribe', formData, {
//           headers: {
//               'Content-Type': 'multipart/form-data',
//           },
//       });

//       const data = response.data;

//       console.log("data", data.text, "epochTime", newEpoch.current);

//       if (response.status === 200) {
//           const newTranscription = {
//               type: "user",
//               text: data.text,
//               dateAndTime: new Date().toLocaleString()
//           };
//           setDebugInfo(prevInfo => `${prevInfo}\nTranscription: ${data.text}`);
//           if (data?.text?.length > 0) {
//               if (data?.text !== ' Thank you.' && data?.text !== '') {
                
//                   console.log("data.text", data.text);
//                   // setTranscriptions(prev => [...prev, newTranscription]);
//                   setChatHistory(prev => [...prev, {"role":"user","context":data.text}]);
//                   if(recordType.current == "RECORD") {
//                     await translateText(data.text);
//                   }else{
//                     await synthesizeSpeech(data.text, newEpoch.current);
//                   }
//               }
//           }
//       } else {
//           throw new Error(data.error);
//       }

//       console.log('Transcription response:', response.data);
//   } catch (error) {
//       console.error('Error transcribing audio:', error);
//       setDebugInfo(prevInfo => `${prevInfo}\nError transcribing audio: ${error.message}`);
//   }
// }

// useEffect(() => {
//   if(selectedLanguage?.whisperCode && recordType.current == "RECORD"){
//     setIsPressed(false);
//     setIsZoomed(false);
//     stopListening();
//     recordType.current = "VAD";
//     startVAD();
//   }
// },[selectedLanguage]);
  

//   const synthesizeSpeech = useCallback(async (text,oldDateQue) => {
//     try {
//       console.log(storeQuery)
//       const response = await axios.post(API_URL+'/session/chatSession',
//         { "accId":storeQuery.current.accId,
//           "question":text,
//           "sessionId":storeQuery.current.sessionId,
//           "translation":"no"},
//         {
//           headers: {
//             "x-access-token": storeQuery.current.token
//           },
//         },
//         { responseType: 'json' }
//       );
//       console.log("LLM :",response.data);
//       if(newEpoch.current == oldDateQue && response?.data && response?.data.Success){
//         textToSpeech(response.data.Success);
//         if(response.data?.sessionCompleted){
//           handleAlert({msg:"Session Completed",type:"success"});
//           // alert("Session Completed");
//           setTimeout(()=>{
//            let endSess = endSession("SESSION_COMPLETED");
//           },3000);

//         }
//         lastAPICall.current = new Date();
//         stopAPIInterval();
//         startAPIInterval();

//         if(response?.data?.nextQuestion !== prevQues && prevQues.length > 0){
//           setPrevQues(response?.data?.nextQuestion)
//           // alert("You move on to next Question");
//           handleAlert({msg:"You move on to next Question",type:"success"});
//         }else{
//           setPrevQues(response?.data?.nextQuestion)
//         }
//         setChatHistory(prev => [...prev, {"role":"assistant","context":response.data.Success}]);
//       }else{
//         stopVAD();
//         // alert(response?.data?.Error);
//         handleAlert({msg:response?.data?.Error,type:"failure"});
//       }
//       setDebugInfo(prevInfo => `${prevInfo}\nSpeech synthesized successfully`);
//     } catch (error) {
//       if (error.response && (error.response.status === 400 || error.response.status === 500)) {
//         const errorMessage = typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : error.response.data;
//         handleAlert({msg:errorMessage,type:"failure"});
//         // alert(`Bad Request: ${errorMessage}`);
//       } else if (error.response && error.response.data) {
//         alert(error.response.data);
//       } else {
//         alert('An unexpected error occurred.');
//       }
//       console.error('Error synthesizing speech:', error);
//       setDebugInfo(prevInfo => `${prevInfo}\nError synthesizing speech: ${error.message}`);
//     }
//   }, []);


//   const startListening = async () => {
//     try {
//       stopVAD();
//       setIsPressed(true);
//       recordType.current = "RECORD";
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorder.current = new MediaRecorder(stream);
//       audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
//       analyser.current = audioContext.current.createAnalyser();
  
//       // Ensure the MediaRecorder is properly initialized
//       if (mediaRecorder.current.stream) {
//         const source = audioContext.current.createMediaStreamSource(mediaRecorder.current.stream);
//         source.connect(analyser.current);
//         analyser.current.fftSize = 2048;
  
//         visualize();
  
//         mediaRecorder.current.ondataavailable = (event) => {
//           audioChunks.current.push(event.data);
//         };
  
//         mediaRecorder.current.onstop = () => {
//           setIsZoomed(false);
//           setSpeakerListening(false);
//           setIsPressed(false);
//           const audioBlob = new Blob(audioChunks.current, { type: 'audio/mpeg' });
//           saveAudio(audioBlob, "yes");
//           audioChunks.current = [];
//         };
  
//         mediaRecorder.current.start();
//         setIsRecording(true);
//       } else {
//         console.error('MediaRecorder stream is not available');
//       }
//     } catch (err) {
//       console.error('Error accessing microphone:', err);
//     }
//   };

//   const stopListening = () => {
//     if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
//       mediaRecorder.current.stop();
//       setIsRecording(false);
//     }
//   };

//   const translateText = async (lanData) => {
//     const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${selectedLanguage.sourceLanguage}&tl=en&dt=t&q=${lanData}`;
//     try {
//       const response = await fetch(url);
//       const data = await response.json();
//       console.log("Original response:", lanData);
//       const translatedText = data[0][0][0];
//       console.log("Extracted translated text:", translatedText);
//       await synthesizeSpeech(translatedText,newEpoch.current);
//       recordType.current = "VAD";
//       startVAD();
//     } catch (error) {
//       console.error("Error fetching translation:", error);
//       recordType.current = "VAD";
//       startVAD();
//     }
//   };

//   const handleClick = () => {
//     if (mediaStream.current && speakerListening) {
//       stopListening();
//     } else {
//       startListening();
//     }
//   };


//   const visualize = () => {
//     if (!analyser.current) return;

//     const bufferLength = analyser.current.frequencyBinCount;
//     const dataArray = new Uint8Array(bufferLength);

//     analyser.current.getByteFrequencyData(dataArray);

//     const threshold = 150;
//     const minHeightDivisor = 2;
//     // console.log("dataArray", dataArray);

//     const newBars = audioBars.map((_, i) => {
//       const value = dataArray[i];
//       const height = (value / 255) * 200;

//       if (value < threshold) {
//         return height / minHeightDivisor;
//       }
//       return height;
//     });

//     setAudioBars(newBars);
//     requestAnimationFrameId.current = requestAnimationFrame(visualize);
//   };





//   useEffect(() => {
//     const checkMobileView = () => {
//       if (window.innerWidth <= 768) {
//         setHoldAndRelease(true);
//       } else {
//         setHoldAndRelease(false);
//       }
//     };

//     checkMobileView();

//     window.addEventListener("resize", checkMobileView);

//     return () => {
//       window.removeEventListener("resize", checkMobileView);
//     };
//   }, []);

//     const handleHoldStart = () => {
//       console.log("handleHoldStart");
//       if (!isPressed) {
//         setIsPressed(true);
//         setIsZoomed(true);
//         startListening();
//       }
//     };

//     const handleHoldEnd = () => {
//       console.log("handleHoldEnd");
//       if (isPressed) {
//         setIsPressed(false);
//         setIsZoomed(false);
//         stopListening();
//       }
//     };

//           useEffect(() => {
//             const handleGlobalMouseUp = () => {
//               if (isPressed) {
//                 handleHoldEnd();
//               }
//             };

//             const handleGlobalTouchEnd = () => {
//               if (isPressed) {
//                 handleHoldEnd();
//               }
//             };

//             window.addEventListener("mouseup", handleGlobalMouseUp);
//             window.addEventListener("touchend", handleGlobalTouchEnd);

//             return () => {
//               window.removeEventListener("mouseup", handleGlobalMouseUp);
//               window.removeEventListener("touchend", handleGlobalTouchEnd);
//             };
//           }, [isPressed]);




//           // language model
// const handleLanguageModelOpen = () => {
//   setIsLanguageOpen(true);
//   setTimeout(() => setIsContentVisible(true), 600);
// };

//   const handleLanguageModelClose = () => {
//     setIsExiting(true); // Start exit animation
//     setTimeout(() => {
//       setIsLanguageOpen(false); // Actually close modal after animation ends
//       setIsExiting(false); // Reset exit animation state
//     }, 600); // Match this timeout with the animation duration
//   };

// return loading ?(
//   <div style={{ height: "100vh", position: "relative", overflow: "hidden", }}>
//     {showAlert && <CustomAlert message={alertMessage} type={alertType} onClose={closeAlert} />}
//     {isListeningSpeech ? (
//       <div
//         style={{
//           position: "absolute",
//           top: "20px",
//           zIndex: 10,
//           color: "#fff",
//           left: "50%",
//           fontWeight: "bold",
//           transform: "translateX(-50%)",
//         }}
//       >
//         Listening
//       </div>
//     ) : null}
//     {holdFlag ? (
//       <div
//         style={{
//           position: "absolute",
//           top: "20px",
//           zIndex: 10,
//           color: "#fff",
//           left: "50%",
//           fontWeight: "bold",
//           transform: "translateX(-50%)",
//         }}
//       >
//         Audio Muted
//       </div>
//     ) : null}
//     <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }}>
//       <color attach="background" args={["#ececec"]} />
//       <Experience selectedAvatar={characterSet} resTTS={resTTS} isListeningSpeech={isListeningSpeech} />
//     </Canvas>
//     {isListeningSpeech && recordType.current === "RECORD" && (
//       <div
//         style={{
//           position: "absolute",
//           zIndex: 10,
//           width: "100%",
//           bottom: "50px",
//           alignItems: "center",
//           justifyContent: "center",
//           display: "flex",
//         }}
//       >
//         <svg
//           className="audiogram col"
//           xmlns="http://www.w3.org/2000/svg"
//           height="320"
//           width="260"
//           style={{
//             opacity: 0.4,
//           }}
//         >
//           <defs>
//             <linearGradient
//               id="audiogram-background"
//               x1="0.5"
//               y1="0"
//               x2="0.5"
//               y2="1"
//             >
//               <stop offset="0%" stopColor="#B28FFF" />
//               <stop offset="31.33%" stopColor="#9b6ffc" />
//               <stop offset="94%" stopColor="#e32f45" />
//             </linearGradient>
//           </defs>
//           {audioBars.map((barHeight, index) => {
//             const yPos = 150 - barHeight / 2; // Center the bar vertically
//             return (
//               <rect
//                 key={index}
//                 width="10"
//                 fill="url(#audiogram-background)"
//                 height={barHeight}
//                 x={index * 20}
//                 y={yPos}
//                 rx="5"
//                 ry="5"
//               />
//             );
//           })}
//         </svg>
//       </div>
//     )}

// {isListeningSpeech && recordType.current == "VAD" && (
//       <div
//         style={{
//           position: "absolute",
//           zIndex: 10,
//           width: "100%",
//           bottom: "150px",
//           alignItems: "center",
//           justifyContent: "center",
//           display: "flex",
//         }}
//       >
//         <Image
//           src="https://renambl.blr1.cdn.digitaloceanspaces.com/web/img/wave.gif"
//           alt="Recording waves"
//           width={200}
//           height={200}
//         />
//       </div>
//     )}

//     <div
//       style={{
//         position: "absolute",
//         bottom: 0,
//         zIndex: 10,
//         width: "100%",
//         alignItems: "center",
//         justifyContent: "center",
//         display: "flex",
//         overflowY: "hidden",
//       }}
//     >
//       {holdAndRelease ? (
//         <div
//           onMouseDown={handleHoldStart}
//           onTouchStart={handleHoldStart}
//           style={{
//             transition: "transform 0.3s ease",
//             transform: isZoomed ? "scale(1.2)" : "scale(1)",
//           }}
//         >
//           {isListeningSpeech ? (
//             <>
//               <div
//                 style={{
//                   position: "relative",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   width: "150px",
//                   height: "150px",
//                   zIndex: 4,
//                 }}
//               >
//                 <svg
//                   id="logo"
//                   width="150"
//                   height="150"
//                   style={{ marginBottom: 12 }}
//                 >
//                   <path
//                     d="M 75 81 m -30, 0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0"
//                     fill="#8b57ff"
//                     stroke="#8b57ff"
//                     strokeWidth="3"
//                   />
//                 </svg>
//                 <div style={{
//         position: "absolute",
//         // background: "black",
//         color: "white",
//         padding: "10px",
//         borderRadius: "5px",
//         textAlign: "center"
//       }}>
//         Hold
//       </div>
//               </div>
//             </>
//           ) : (
//             <div
//               style={{
//                 position: "relative",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 width: "150px",
//                 height: "150px",
//                 zIndex: 4,
//               }}
//             >
//               <svg id="logo" width="150" height="150">
//                 <circle
//                   cx="75"
//                   cy="75"
//                   r="30"
//                   fill="rgba(184, 184, 184, 0.30)"
//                   stroke="none"
//                   strokeWidth="3"
//                 />
//               </svg>
//               <div style={{
//         position: "absolute",
//         // background: "black",
//         color: "white",
//         padding: "10px",
//         borderRadius: "5px",
//         textAlign: "center"
//       }}>
//         REC
//       </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div
//           onClick={handleClick}
//           style={{
//             transition: "transform 0.3s ease",
//             transform: isZoomed ? "scale(1.2)" : "scale(1)",
//           }}
//         >
//           {isPressed ? (
//             <>
//               <div
//                 style={{
//                   position: "relative",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   width: "150px",
//                   height: "150px",
//                   zIndex: 4,
//                 }}
//               >
//                 <svg
//                   id="logo"
//                   width="150"
//                   height="150"
//                   style={{ marginBottom: 12 }}
//                 >
//                   <path
//                     d="M 75 81 m -30, 0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0"
//                     fill="#8b57ff"
//                     stroke="#8b57ff"
//                     strokeWidth="3"
//                   />
//                 </svg>
//                 <div style={{
//         position: "absolute",
//         // background: "black",
//         color: "white",
//         padding: "10px",
//         borderRadius: "5px",
//         textAlign: "center"
//       }}>
//         Hold
//       </div>
//               </div>
//             </>
//           ) : (
//             <div
//               style={{
//                 position: "relative",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 width: "150px",
//                 height: "150px",
//                 zIndex: 4,
//               }}
//             >
//               <svg id="logo" width="150" height="150">
//                 <circle
//                   cx="75"
//                   cy="75"
//                   r="30"
//                   fill="rgba(184, 184, 184, 0.30)"
//                   stroke="none"
//                   strokeWidth="3"
//                 />
//               </svg>
//               <div style={{
//         position: "absolute",
//         // background: "black",
//         color: "white",
//         padding: "10px",
//         borderRadius: "5px",
//         textAlign: "center"
//       }}>
//         REC
//       </div>
//             </div>
//           )}
//         </div>
//       )}

// {
//   holdFlag ? (
//     <div
//     onClick={()=>{
//       holdSession("END");
//       setHoldFlag(false);
//     }}
//      style={{
//       position: "relative",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       width: "150px",
//       height: "150px",
//       zIndex: 4
//     }}>
//       <svg id="logo" width="150" height="150">
//       <circle
//         cx="75"
//         cy="75"
//         r="30"
//         fill="rgba(135, 206, 235, 0.30)"
//         stroke="none"
//         strokeWidth="3"
//       />
//       </svg>
//       <MicOff
//                   style={{
//                     position: "absolute",
//                     color: "#fff",
//                     zIndex: 6,
//                     marginTop: 2,
//                   }}
//                   width={100}
//                   height={100}
//                 />
//     </div>
//   ) : (
//     <div 
//     onClick={()=>{
//       holdSession("START");
//       setHoldFlag(true);
//     }}
//     style={{
//       position: "relative",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       width: "150px",
//       height: "150px",
//       zIndex: 4
//     }}>
//       <svg id="logo" width="150" height="150">
//         <circle
//           cx="75"
//           cy="75"
//           r="30"
//           fill="rgba(184, 184, 184, 0.30)"
//           stroke="none"
//           strokeWidth="3"
//         />
//       </svg>
//       <Mic
//         style={{
//             position: "absolute",
//             color: "#fff",
//             zIndex: 6,
//             marginTop: 2,
//           }}
//           width={100}
//           height={100}
//         />
//     </div>
//   )
// }

//       <div
//         onClick={() => {
//           endSession("ENDED_BY_USER");
//         }}
//       >
//         <div
//           style={{
//             position: "relative",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             width: "150px",
//             height: "150px",
//             zIndex: 4,
//           }}
//         >
//           <svg id="logo" width="150" height="150">
//             <circle
//               cx="75"
//               cy="75"
//               r="30"
//               fill="rgba(184, 184, 184, 0.30)"
//               stroke="none"
//               strokeWidth="3"
//             />
//           </svg>
//           <CallEnd
//             style={{
//               position: "absolute",
//               color: "#F76B7B",
//               zIndex: 6,
//               marginTop: 2,
//             }}
//             width={100}
//             height={100}
//           />
//         </div>
//       </div>
//     </div>

//     <div
//       onClick={handleLanguageModelOpen}
//       style={{
//         position: "absolute",
//         bottom: "-45px",
//         right: "-45px",
//         width: "100px",
//         height: "100px",
//         zIndex: 10,
//         backgroundColor: "#8b57ff",
//         color: "white",
//         borderRadius: "50%",
//         boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
//         opacity: isLanguageOpen ? 0 : 1,
//         transition: "all 0.3s ease-in-out",
//         display: "flex",
//         fontSize: "20px",
//       }}
//     >
//       <div style={{ marginTop: "20px", marginLeft: "20px" }}>
//         {selectedLanguage.keyword}
//       </div>
//     </div>

//     <Modal
//       open={isLanguageOpen}
//       onClose={() => handleLanguageModelClose()}
//       aria-labelledby="simple-modal-title"
//       aria-describedby="simple-modal-description"
//     >
//       {/* <Fade in={isLanguageOpen}> */}
//       <div
//         className={`modal-language-content ${
//           isLanguageOpen && !isExiting ? "animate-diagonal-sweep" : ""
//         } ${isExiting ? "animate-diagonal-close" : ""}`}
//         onClick={() => handleLanguageModelClose()}
//       >
//         <div
//           style={{
//             position: "relative",
//             padding: "24px",
//             maxWidth: "80%",
//             width: "80%",
//             maxHeight: "90%",
//             margin: "auto",
//             backgroundColor: "white",
//             borderRadius: "8px",
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Close Button */}
//           <IconButton
//             onClick={handleLanguageModelClose}
//             style={{
//               position: "absolute",
//               top: "16px",
//               right: "16px",
//               color: "#666",
//             }}
//           >
//             <Close />
//           </IconButton>

//           {/* Modal Content */}
//           <div
//             style={{
//               opacity: isContentVisible ? 1 : 0,
//               transition: "opacity 0.3s",
//             }}
//           >
//             <h2
//               style={{
//                 fontSize: "24px",
//                 fontWeight: "bold",
//                 color: "#666",
//               }}
//             >
//               Select Language
//             </h2>
//             <p style={{ color: "#666" }}>
//               Choose a language from the list below:
//             </p>

//             {/* Scrollable Language List */}
//             <div
//               style={{
//                 maxHeight: "60vh", // Limit height of scrollable area
//                 overflowY: "auto", // Enable scroll only on this area
//                 marginTop: "16px",
//               }}
//             >
//               <List>
//                 {languages.map((language) => (
//                   <ListItem
//                     button
//                     key={language.code}
//                     onClick={() => handleChange(language.code)}
//                     style={{
//                       backgroundColor:
//                         selectedLanguage.code === language.code
//                           ? "#ededed"
//                           : "#fff",
//                       color:
//                         selectedLanguage.code === language.code
//                           ? "#545454"
//                           : "#545454",
//                     }}
//                   >
//                     <ListItemText primary={language.name} />
//                   </ListItem>
//                 ))}
//               </List>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* </Fade> */}
//     </Modal>

//     <style jsx global>{`
//       .modal-language-content {
//         position: fixed;
//         inset: 0;
//         display: flex;
//         justify-content: center;
//         align-items: center;
//         overflow: hidden;
//       }

//       @keyframes diagonal-sweep {
//         0% {
//           clip-path: polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%);
//         }
//         100% {
//           clip-path: polygon(-50% -50%, 150% -50%, 150% 150%, -50% 150%);
//         }
//       }

//       @keyframes diagonal-close {
//         0% {
//           clip-path: polygon(-50% -50%, 150% -50%, 150% 150%, -50% 150%);
//         }
//         100% {
//           clip-path: polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%);
//         }
//       }

//       .animate-diagonal-sweep {
//         animation: diagonal-sweep 0.6s ease-out forwards;
//       }

//       .animate-diagonal-close {
//         animation: diagonal-close 0.6s ease-in forwards;
//       }
//     `}</style>
//   </div>
// ):(
//   <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}>
//             {showAlert && <CustomAlert message={alertMessage} type={alertType} onClose={closeAlert} />}
//             <div className="flex items-center justify-center h-screen bg-gray-100">
//             <div className="text-center text-4xl text-gray-600">Loading...</div>
//             </div>
//   </div>

// );
// }
// export default Home;

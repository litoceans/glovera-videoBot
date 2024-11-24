"use client";
import { useRouter ,useSearchParams } from "next/navigation";
import React, { useState, useCallback, useEffect ,useRef, useMemo} from 'react';
import Image from 'next/image';
import axios from 'axios';
import { SpeechChunks } from "../../vad/SpeechChunks";
import { Canvas } from "@react-three/fiber";
import { Experience } from "../../avatar/Experience";
import { Mic, CallEnd, Add, Close, CallToAction, MicOff } from "@mui/icons-material";
import { toast } from 'react-toastify';
import AWS from 'aws-sdk';
import { useGLTF } from '@react-three/drei';
import { useFBX } from '@react-three/drei';
import { useAnimations } from '@react-three/drei';


const AWS_ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.NEXT_PUBLIC_AWS_SECRET_KEY;
const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION;

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const REDIRECT_URL = process.env.NEXT_PUBLIC_REDIRECT_URL;

const awsConfig = {
    accessKeyId: AWS_ACCESS_KEY, // Your AWS access key ID
    secretAccessKey: AWS_SECRET_KEY, // Your AWS secret access key
    region: AWS_REGION
  };
  
AWS.config.update(awsConfig);
  
const polly_client = new AWS.Polly();

const characters = [
    {
        no: 101,
        name: "Ethan",
        avatar: "https://soulfiles007.s3.us-east-1.amazonaws.com/Avatar_Male1.glb",
        voiceCharcter: "Joey",
        accent:"English (US)",
        engine: "standard"
    },
    {
        no: 102,
        name: "Mia",
        avatar: "https://soulfiles007.s3.us-east-1.amazonaws.com/Avatar_Female2.glb",
        voiceCharcter: "Aditi",
        accent:"English (Indian)",
        engine: "standard"
    },
    {
        no: 103,
        name: "Caleb",
        avatar: "https://soulfiles007.s3.us-east-1.amazonaws.com/Avatar_Male3.glb",
        voiceCharcter: "Brian",
        accent:"English (British)",
        engine: "standard"
    },
    {
        no: 104,
        name: "Ava",
        avatar: "https://soulfiles007.s3.us-east-1.amazonaws.com/Avatar_Female1.glb",
        voiceCharcter: "Raveena",
        accent:"English (Indian)",
        engine: "standard"
    },
    {
        no: 105,
        name: "Lucas",
        avatar: "https://soulfiles007.s3.us-east-1.amazonaws.com/Avatar_Male2.glb",
        voiceCharcter: "Russell",
        accent:"English (Australian)",
         engine: "standard"
    },
    {
        no: 106,
        name: "Sophie",
        avatar: "https://soulfiles007.s3.us-east-1.amazonaws.com/Avatar_Female3.glb",
        voiceCharcter: "Nicole",
        accent:"English (Australian)",
        engine: "standard"
    },
  
  ]

const Character = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isListeningSpeech, setIsListeningSpeech] = useState(false);
    const [audioBlobs, setAudioBlobs] = useState([]);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const chunks = useRef(null);
    const sessionStarted = useRef(false);
    const [loading, setLoading] = useState(false);
    const [characterSet, setCharacterSet] = useState(null);
    const userId = useRef(null);
    const [microphoneStatus, setMicrophoneStatus] = useState(null);
    const storeQuery = useRef({});
    const [holdFlag,setHoldFlag] = useState(false);
    const [resTTS, setResTTS] = useState({text: '', blob: null});
    const [sessionId, setSessionId] = useState(null);

    function isDifferenceLessThanOneMinute(epochTime1) {
      const oneMinuteInMilliseconds = 20 * 1000;
      const epochTime2 = Date.now();
      console.log(epochTime1, epochTime2);
      const differenceInMilliseconds = Math.abs(epochTime1 - epochTime2);
      console.log(differenceInMilliseconds, oneMinuteInMilliseconds);
      return differenceInMilliseconds < oneMinuteInMilliseconds;
    }

    useEffect(()=>{
      if(searchParams){
        const query = {};
        for (const [key, value] of searchParams.entries()) {
            query[key] = value;
        }
        console.log("query",query);
        if(query?.characterId && query?.timeStamp){
          let diffTime = true;
          // let diffTime = isDifferenceLessThanOneMinute(query.timeStamp)
        if(diffTime){
          let findChar = characters.find((char) => char.no == query.characterId);
          console.log("findChar",findChar);
          if(!findChar){
            console.log("Session Expired Char");
            toast.error("Session Expired");
            // setTimeout(()=>{
            //   window.location.href = REDIRECT_URL
            // },3000);
            return;
          }
          userId.current = query.userId;
          storeQuery.current = query;
          setSessionId(query.sessionId);
          setCharacterSet(findChar.avatar);
          setLoading(true);
        }else{
          console.log("Session Expired Time");
          toast.error("Session Expired");
          // setTimeout(()=>{
          //   window.location.href = REDIRECT_URL
          // },3000);
        }
        }else{
          console.log("Session Expired query");
          toast.error("Session Expired");
          // setTimeout(()=>{
          //   window.location.href = REDIRECT_URL
          // },3000);
        }
      }

    },[searchParams])


    async function startVAD() {
        try {
          toast.success("You can start speaking now");
          sessionStarted.current = true;
          chunks.current = speechChunks; // Use the memoized SpeechChunks instance
          chunks.current.start();
    
          return () => chunks.current.stop();
        } catch (error) {
          console.log(error);
        }
      }
    
      const speechChunks = useMemo(() => {
        return new SpeechChunks(
          () => {
            console.log("speech start");
            setIsListeningSpeech(true);
          },
          (blob) => {
            console.log("STARTVAD blob", blob);
            console.log("STARTVAD speech end");
            setIsListeningSpeech(false);
            setAudioBlobs([blob]);
            saveAudio(blob, "no");
            setIsAudioPlaying(false);
          }
        );
      }, []);

      useEffect(() => {
        if(loading){
          setTimeout(()=>{
            toast.success("Wait Your Session is Starting...");
            startVAD();      
          },5000)
        }
      }, [loading]);

      async function endSession(endReason){
        try{
          const token = localStorage.getItem('token');
          const userId = localStorage.getItem('userId');
          const sessionId = localStorage.getItem('sessionId');
          if(userId == null || userId == undefined || token == null || token == undefined || sessionId == null || sessionId == undefined){
            router.push('/')
            return;
          }
          setIsListeningSpeech(false);
          stopVAD();
          const response = await axios.post(API_URL+'/endSession',
            { "userId":userId,
              "sessionId":sessionId,
            },
            {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                  },
            credentials: 'include',
            },
            { responseType: 'json' }
          );
          console.log("endSessionAPI :",response?.data)
          if(response?.data?.Success){
            setTimeout(()=>{
              window.location.href = REDIRECT_URL
            },3000);
          }else{
            setTimeout(()=>{
              window.location.href = REDIRECT_URL
            },3000);
          }
        }catch(error){
          console.log(error);
          
        }
    
    
      }
    
      async function stopVAD() {
        if (chunks.current) {
          sessionStarted.current = false;
          chunks.current.stop();
          console.log("VAD stopped");
        } else {
          console.log("VAD is not running");
        }
      }


      const textToSpeech = async (text) => {
        let replaceText = text.replace(".","...")
        const params = {
            Engine: speakEngine.current,
            Text: replaceText,
            OutputFormat: 'mp3',
            VoiceId: pollyVoice.current
        };
    
        try {
            const response = await polly_client.synthesizeSpeech(params).promise();
            if (response.AudioStream) {
                const url = URL.createObjectURL(new Blob([response.AudioStream], { type: 'audio/wav' }));
                console.log("Polly Streaming audio", url);
                setIsAudioPlaying(true);
                setResTTS({text: removeSpecialCharacters(replaceText), blob: url});
            } else {
                console.log("Polly Could not stream audio");
            }
        } catch (error) {
            console.log("Polly Error synthesizing speech:", error);
        }
    };

    function removeSpecialCharacters(text) {
        return text.replace(/[^a-zA-Z0-9 ]/g, '');
      }
      
      function getRandomFiller() {
        const list_fillters = ["Hmm", "Uh", "Well", "okay", "Just a minute", "Hang on", "Give me a minute", "Just a moment", "Give me a second"];
        const randomIndex = Math.floor(Math.random() * list_fillters.length);
        return list_fillters[randomIndex];
      }
      
      
      
      async function saveAudio(audioBlob, typeIs) {
          // Check if the blob is empty
          if (audioBlob.size === 0) {
            // setDebugInfo(prevInfo => `${prevInfo}\nAudio blob is empty, not saving`);
            return false;
        }
      
        // Create an audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
        // Convert the blob to an array buffer
        const arrayBuffer = await audioBlob.arrayBuffer();
      
        // Decode the audio data
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
        // Function to calculate RMS of a set of samples
        function calculateRMS(samples) {
            const sum = samples.reduce((acc, val) => acc + val * val, 0);
            return Math.sqrt(sum / samples.length);
        }
      
        // Improved function to estimate frequency using zero-crossings
        function estimateFrequency(samples, sampleRate) {
            let zeroCrossings = 0;
            for (let i = 1; i < samples.length; i++) {
                if ((samples[i] > 0 && samples[i - 1] <= 0) || 
                    (samples[i] < 0 && samples[i - 1] >= 0)) {
                    zeroCrossings++;
                }
            }
            
            // Each zero crossing represents half a cycle
            const numCycles = zeroCrossings / 2;
            const duration = samples.length / sampleRate;
            return numCycles / duration;
        }
      
        // Analyze the audio data for volume and pitch
        const channelData = audioBuffer.getChannelData(0);
        const windowSize = audioContext.sampleRate * 0.02; // 20ms window
        let maxRMS = 0;
        let hasSpeechPitch = false;
      
        for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
            const window = channelData.slice(i, i + windowSize);
            const rms = calculateRMS(window);
            maxRMS = Math.max(maxRMS, rms);
      
            // Check pitch if we have a significant volume
            if (rms > 0.01) {
                const frequency = estimateFrequency(window, audioContext.sampleRate);
                if (frequency >= 85 && frequency <= 255) {
                    hasSpeechPitch = true;
                    break; // We found a speech-like segment, no need to continue
                }
            }
        }
        const hasSignificantVolume = maxRMS > 0.01; // Adjust threshold as needed
        if (!hasSignificantVolume || !hasSpeechPitch) {
            return false;
        }
        // saveAsMp3(audioBlob);
        
        // If there is significant volume and speech-like pitch, proceed to save the audio
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.mp3');
        formData.append('lang', "en");
      
        try {
            let url = "/api/transcribe";
             const response = await axios.post(url, formData, {
              // const response = await axios.post('/character/api/transcribe', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
      
            const data = response.data;
      
            console.log("data", data.text);
      
            if (response.status === 200) {
                const newTranscription = {
                    type: "user",
                    text: data.text,
                    dateAndTime: new Date().toLocaleString()
                };
                if (data?.text?.length > 0) {
                    if (data?.text !== ' Thank you.' && data?.text !== '') {
                      await synthesizeSpeech(data.text);
                        console.log("data.text", data.text);

                    }
                }
            } else {
                throw new Error(data.error);
            }
      
            console.log('Transcription response:', response.data);
        } catch (error) {
            console.error('Error transcribing audio:', error);
        }
      }
      
       
      
        const synthesizeSpeech = useCallback(async (text) => {
          try {
            let userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            const sessionId = localStorage.getItem('sessionId');
            if(userId == null || userId == undefined || token == null || token == undefined || sessionId == null || sessionId == undefined){
                router.push('/')
                return;
            }
            console.log(storeQuery)
            const response = await axios.post(API_URL+'/chatSession',
              { "userId":userId,
                "question":text,
                "sessionId":sessionId,
            },
              {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
              },
              { responseType: 'json' }
            );
            console.log("LLM :",response.data);
            if(response?.data && response?.data.Success){
            //   textToSpeech(response.data.Success);

            }else{
              stopVAD();
              toast.error(response?.data?.Error);
              setTimeout(()=>{
                window.location.href = REDIRECT_URL
              },3000);
              // alert(response?.data?.Error);
            //   handleAlert({msg:response?.data?.Error,type:"failure"});
            }
          } catch (error) {
            console.error('Error synthesizing speech:', error);
          }
        }, []);

        return loading ?(
            <div style={{ height: "100vh", position: "relative", overflow: "hidden", }}>
              {isListeningSpeech ? (
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    zIndex: 10,
                    color: "#fff",
                    left: "50%",
                    fontWeight: "bold",
                    transform: "translateX(-50%)",
                  }}
                >
                  Listening
                </div>
              ) : null}
              {holdFlag ? (
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    zIndex: 10,
                    color: "#fff",
                    left: "50%",
                    fontWeight: "bold",
                    transform: "translateX(-50%)",
                  }}
                >
                  Audio Muted
                </div>
              ) : null}
              <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }}>
                <color attach="background" args={["#ececec"]} />
                <Experience selectedAvatar={characterSet} resTTS={resTTS} isListeningSpeech={isListeningSpeech} />
              </Canvas>

          {isListeningSpeech && (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 10,
                    width: "100%",
                    bottom: "150px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <Image
                    src="https://soulfiles007.s3.us-east-1.amazonaws.com/wave.gif"
                    alt="Recording waves"
                    width={200}
                    height={200}
                  />
                </div>
              )}
          
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  zIndex: 10,
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  overflowY: "hidden",
                }}
              >
          
          {
            holdFlag ? (
              <div
              onClick={()=>{
                holdSession("END");
                setHoldFlag(false);
              }}
               style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "150px",
                height: "150px",
                zIndex: 4
              }}>
                <svg id="logo" width="150" height="150">
                <circle
                  cx="75"
                  cy="75"
                  r="30"
                  fill="rgba(135, 206, 235, 0.30)"
                  stroke="none"
                  strokeWidth="3"
                />
                </svg>
                <MicOff
                            style={{
                              position: "absolute",
                              color: "#fff",
                              zIndex: 6,
                              marginTop: 2,
                            }}
                            width={100}
                            height={100}
                          />
              </div>
            ) : (
              <div 
              onClick={()=>{
                holdSession("START");
                setHoldFlag(true);
              }}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "150px",
                height: "150px",
                zIndex: 4
              }}>
                <svg id="logo" width="150" height="150">
                  <circle
                    cx="75"
                    cy="75"
                    r="30"
                    fill="rgba(184, 184, 184, 0.30)"
                    stroke="none"
                    strokeWidth="3"
                  />
                </svg>
                <Mic
                  style={{
                      position: "absolute",
                      color: "#fff",
                      zIndex: 6,
                      marginTop: 2,
                    }}
                    width={100}
                    height={100}
                  />
              </div>
            )
          }
          
                <div
                  onClick={() => {
                    endSession("ENDED_BY_USER");
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "150px",
                      height: "150px",
                      zIndex: 4,
                    }}
                  >
                    <svg id="logo" width="150" height="150">
                      <circle
                        cx="75"
                        cy="75"
                        r="30"
                        fill="rgba(184, 184, 184, 0.30)"
                        stroke="none"
                        strokeWidth="3"
                      />
                    </svg>
                    <CallEnd
                      style={{
                        position: "absolute",
                        color: "#F76B7B",
                        zIndex: 6,
                        marginTop: 2,
                      }}
                      width={100}
                      height={100}
                    />
                  </div>
                </div>
              </div>
           
            </div>
          ):(
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}>
                      <div className="flex items-center justify-center h-screen bg-gray-100">
                      <div className="text-center text-4xl text-gray-600">Loading...</div>
                      </div>
            </div>
          
          );
};

export default Character;
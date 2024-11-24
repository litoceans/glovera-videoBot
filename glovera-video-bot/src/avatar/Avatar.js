import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// Viseme and phoneme mappings
const VISEME_MAP = {
  PP: "viseme_PP",
  kk: "viseme_kk",
  I: "viseme_I",
  aa: "viseme_aa",
  O: "viseme_O",
  U: "viseme_U",
  FF: "viseme_FF",
  TH: "viseme_TH",
  DD: "viseme_DD",
  CH: "viseme_CH",
  SS: "viseme_SS",
  NN: "viseme_nn",
  RR: "viseme_RR",
  EE: "viseme_E",
  sil: "viseme_sil",
};

const PHONEME_MAP = {
  pbm: "PP",
  fv: "FF",
  td: "DD",
  kgcj: "kk",
  sxz: "SS",
  nl: "NN",
  r: "RR",
  a: "aa",
  e: "EE",
  iy: "I",
  uqw: "U",
  o: "O",
};

export function Avatar({ selectedAvatar, resTTS, isListeningSpeech, ...props }) {
  const controls = {
    playAudio: true,
    headFollow: true,
    smoothMorphTarget: true,
    morphTargetSmoothing: 0.5,
    TextBox: {
      value: resTTS?.text || "",
    },
  };

  const [lipsyncData, setLipsyncData] = useState([]);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  
  const group = useRef();
  const { nodes, materials } = useGLTF(selectedAvatar, true);
  const { animations: idleAnimation } = useFBX("https://soulfiles007.s3.us-east-1.amazonaws.com/Idle.fbx");
  const { actions } = useAnimations(idleAnimation ? [{ ...idleAnimation[0], name: "Idle" }] : [], group);

  // Clean up function for audio
  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsAudioReady(false);
    setLipsyncData([]);
  }, []);

  // Handle audio setup
  const setupAudio = useCallback(async (audioBlobUrl) => {
    cleanupAudio();

    const audio = new Audio(audioBlobUrl);
    
    // Set up audio event listeners
    audio.addEventListener("ended", () => {
      setLipsyncData([]); // Clear lipsync data when audio ends
    });

    audio.addEventListener("pause", () => {
      if (audio.currentTime >= audio.duration) {
        setLipsyncData([]); // Clear lipsync data when audio completes
      }
    });

    return new Promise((resolve) => {
      audio.addEventListener("loadedmetadata", () => {
        setAudioDuration(audio.duration);
        audioRef.current = audio;
        setIsAudioReady(true);
        resolve(audio);
      });
    });
  }, [cleanupAudio]);

  // Process text for lipsync
  const generateLipsyncData = useCallback((text, duration) => {
    if (!text || !duration) return [];

    const syllables = text.split(/\s+/).flatMap(word => 
      word.match(/.{1,3}/g) || []
    );

    const syllableDuration = duration / syllables.length;
    
    return syllables.map((syllable, index) => ({
      start: (index * syllableDuration).toFixed(2),
      end: ((index + 1) * syllableDuration).toFixed(2),
      value: getPhonemeForSyllable(syllable),
    }));
  }, []);

  const getPhonemeForSyllable = useCallback((syllable) => {
    if (!syllable?.trim()) return "sil";
    const lastChar = syllable.trim().slice(-1).toLowerCase();

    if (syllable.toLowerCase().includes("ch") || syllable.toLowerCase().includes("sh")) {
      return "CH";
    }
    if (syllable.toLowerCase().includes("th")) {
      return "TH";
    }

    for (const [chars, phoneme] of Object.entries(PHONEME_MAP)) {
      if (chars.includes(lastChar)) {
        return phoneme;
      }
    }
    return "sil";
  }, []);

  // Handle new audio from TTS
  useEffect(() => {
    if (resTTS?.blob) {
      setupAudio(resTTS.blob);
    }
  }, [resTTS, setupAudio]);

  // Handle speech listening state
  useEffect(() => {
    if (isListeningSpeech) {
      cleanupAudio();
    }
  }, [isListeningSpeech, cleanupAudio]);

  // Generate lipsync data and play audio when ready
  useEffect(() => {
    if (controls.playAudio && isAudioReady && resTTS?.text && !isListeningSpeech) {
      const data = generateLipsyncData(resTTS.text, audioDuration);
      setLipsyncData(data);
      
      if (audioRef.current) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          cleanupAudio();
        });
      }
    }
  }, [controls.playAudio, isAudioReady, resTTS?.text, audioDuration, generateLipsyncData, isListeningSpeech, cleanupAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  // Animation effect
  useEffect(() => {
    if (actions.Idle) {
      actions.Idle.reset().fadeIn(0.5).play();
    }
    return () => actions.Idle?.fadeOut(0.5);
  }, [actions]);

  // Handle morph targets in frame updates
  useFrame((state) => {
    if (!controls.playAudio || !nodes.Wolf3D_Head || !nodes.Wolf3D_Teeth) return;

    const currentTime = audioRef.current?.currentTime || 0;
    const { morphTargetSmoothing, smoothMorphTarget } = controls;

    // Reset all morph targets
    Object.values(VISEME_MAP).forEach(viseme => {
      const headInfluence = nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[viseme]];
      const teethInfluence = nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[viseme]];

      if (smoothMorphTarget) {
        nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[viseme]] = 
          THREE.MathUtils.lerp(headInfluence, 0, morphTargetSmoothing);
        nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[viseme]] = 
          THREE.MathUtils.lerp(teethInfluence, 0, morphTargetSmoothing);
      } else {
        nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[viseme]] = 0;
        nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[viseme]] = 0;
      }
    });

    // Apply active viseme
    const activeCue = lipsyncData.find(cue => 
      currentTime >= parseFloat(cue.start) && currentTime <= parseFloat(cue.end)
    );

    if (activeCue) {
      const viseme = VISEME_MAP[activeCue.value];
      const targetValue = 1;

      if (smoothMorphTarget) {
        nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[viseme]] = 
          THREE.MathUtils.lerp(nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[viseme]], targetValue, morphTargetSmoothing);
        nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[viseme]] = 
          THREE.MathUtils.lerp(nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[viseme]], targetValue, morphTargetSmoothing);
      } else {
        nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[viseme]] = targetValue;
        nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[viseme]] = targetValue;
      }
    }
  });

  // Return the 3D avatar component
  return (
    <group {...props} dispose={null} ref={group}>
      {nodes.Hips ? <primitive object={nodes.Hips} /> : null}
      {Object.entries(nodes).map(([name, node]) => {
        if (node.type === "SkinnedMesh") {
          return (
            <skinnedMesh
              key={name}
              name={name}
              geometry={node.geometry}
              material={materials[node.material.name]}
              skeleton={node.skeleton}
              morphTargetDictionary={node.morphTargetDictionary}
              morphTargetInfluences={node.morphTargetInfluences}
            />
          );
        }
        return null;
      })}
    </group>
  );
}



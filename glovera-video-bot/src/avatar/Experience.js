import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Avatar } from "./Avatar";
import { useRef, useEffect, useState } from "react";

export const Experience = ({ selectedAvatar, resTTS, isListeningSpeech }) => {
  const [imagePath, setImagePath] = useState("https://renambl.blr1.cdn.digitaloceanspaces.com/web/ai/img/interviewbg5.jpg");
  const controlsRef = useRef();
  const viewport = useThree((state) => state.viewport);

  // Function to check mobile view
  useEffect(() => {
    // Function to check if the window width is mobile size
    const checkMobileView = () => {
      if (window.innerWidth <= 550) {
        setImagePath("https://renambl.blr1.cdn.digitaloceanspaces.com/web/ai/img/interviewbg5Mobile.jpg");
      } else if (window.innerWidth <= 908) {
        setImagePath("https://renambl.blr1.cdn.digitaloceanspaces.com/web/ai/img/interviewbg5Tab.jpg");
      } else {
        setImagePath("https://renambl.blr1.cdn.digitaloceanspaces.com/web/ai/img/interviewbg5.jpg");
      }
    };

    // Run the function once on component mount
    checkMobileView();

    // Add event listener to check on window resize
    window.addEventListener("resize", checkMobileView);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkMobileView);
    };
  }, []);

  // Dynamically load the texture based on imagePath
  // const ImgFullPath = "/textures/" + imagePath + ".jpg";
  const texture = useTexture(imagePath);

  useEffect(() => {
    if (controlsRef.current) {
      // Disable OrbitControls interaction
      controlsRef.current.enabled = false;
    }
  }, []);


  // Dispose of textures when component unmounts to prevent memory leakage
  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
    };
  }, [texture]);

  return (
    <>
      <OrbitControls ref={controlsRef} />
      <Avatar
        position={[0, -6, 4]}
        scale={4}
        selectedAvatar={selectedAvatar}
        resTTS={resTTS}
        isListeningSpeech={isListeningSpeech}
      />
      <Environment preset="sunset" />
      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </>
  );
};

import {
  ContactShadows,
  Environment,
  Float,
  Html,
  PresentationControls,
  Text,
  useGLTF,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useState } from "react";

export default function Experience({ portal, isFocusing, onFocus }) {
  const [cameraPosition] = useState(new THREE.Vector3());
  const [smoothCameraPosition] = useState(new THREE.Vector3());
  const [cameraTarget] = useState(new THREE.Vector3());
  const [smoothCameraTarget] = useState(new THREE.Vector3());

  const computer = useGLTF(
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/macbook/model.gltf",
  );
  const { camera } = useThree();

  if (isFocusing) {
    cameraPosition.set(0, 1, 3);
    cameraTarget.set(0, 1, -2);
  } else {
    cameraPosition.set(-3, 1.5, 4);
    cameraTarget.set(0, 0, 0);
  }

  useFrame((state, delta, frame) => {
    smoothCameraPosition.lerp(cameraPosition, delta);
    camera.position.copy(smoothCameraPosition);

    smoothCameraTarget.lerp(cameraTarget, delta);
    camera.lookAt(smoothCameraTarget);
  });

  return (
    <>
      <color args={["#241a1a"]} attach="background" />

      <Environment files="the_sky_is_on_fire_2k.hdr" />

      <PresentationControls
        global
        rotation={[0.13, 0.1, 0]}
        polar={[-0.4, 0.2]}
        azimuth={[-1, 0.75]}
        config={{ mass: 2, tension: 400 }}
        snap={{ mass: 4, tension: 400 }}
      >
        <Float rotationIntensity={0.4}>
          <rectAreaLight
            width={2.5}
            height={1.65}
            intensity={65}
            color={"#ff6900"}
            rotation={[-0.1, Math.PI, 0]}
            position={[0, 0.55, -1.15]}
          />
          <primitive object={computer.scene} position-y={-1.2}>
            <Html
              transform
              wrapperClass="htmlScreen"
              distanceFactor={1.17}
              position={[0, 1.56, -1.4]}
              rotation-x={-0.256}
              portal={portal}
            >
              <div
                className="iframe"
                style={{
                  pointerEvents: isFocusing ? "none" : "auto",
                }}
                onClick={onFocus}
              ></div>
              <iframe
                src="https://bruno-simon.com/html/"
                style={{
                  pointerEvents: isFocusing ? "auto" : "none",
                }}
              ></iframe>
            </Html>
          </primitive>

          <Text
            font="./bangers-v20-latin-regular.woff"
            fontSize={1}
            position={[2, 0.75, 0.75]}
            rotation-y={-1.25}
            maxWidth={2}
          >
            BRUNO SIMON
          </Text>
        </Float>
      </PresentationControls>

      <ContactShadows position-y={-1.4} opacity={0.4} scale={5} blur={2.4} />
    </>
  );
}

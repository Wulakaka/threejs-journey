import { OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import Lights from "./Lights.jsx";
import { Level } from "./Level.jsx";
import Player from "./Player.jsx";
import useGame from "./stores/useGame.jsx";
import { useThree } from "@react-three/fiber";

export default function Experience({ camera2 }) {
  const blocksCount = useGame((state) => state.blocksCount);
  const blocksSeed = useGame((state) => state.blocksSeed);
  const { camera, gl } = useThree();
  return (
    <>
      {/*<OrbitControls makeDefault />*/}
      <color args={["#bdedfc"]} attach="background" />
      <Physics debug={false}>
        <Lights />
        <Level count={blocksCount} seed={blocksSeed} />
        <Player camera={camera} />
        <Player camera={camera2} position={[1, 1, 0]} />
      </Physics>
    </>
  );
}

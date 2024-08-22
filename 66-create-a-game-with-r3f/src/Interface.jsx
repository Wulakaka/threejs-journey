import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { addEffect } from "@react-three/fiber";
import useGame from "./stores/useGame.jsx";

export default function Interface({ player = "player1" }) {
  const time = useRef();

  const restart = useGame((state) => state.restart);
  const phase = useGame((state) => state[player].phase);

  const forward = useKeyboardControls((state) => state[`${player}forward`]);
  const backward = useKeyboardControls((state) => state[`${player}backward`]);
  const leftward = useKeyboardControls((state) => state[`${player}leftward`]);
  const rightward = useKeyboardControls((state) => state[`${player}rightward`]);
  const jump = useKeyboardControls((state) => state[`${player}jump`]);

  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      const state = useGame.getState();

      let elapsedTime = 0;
      if (state[player].phase === "playing") {
        elapsedTime = Date.now() - state[player].startTime;
      } else if (state[player].phase === "ended") {
        elapsedTime = state[player].endTime - state[player].startTime;
      }
      elapsedTime /= 1000;
      elapsedTime = elapsedTime.toFixed(2);
      if (time.current) {
        time.current.textContent = elapsedTime;
      }
    });

    return () => {
      unsubscribeEffect();
    };
  }, []);

  return (
    <div className="interface">
      {/* Time */}
      <div ref={time} className="time">
        0.00
      </div>
      {/* Restart */}
      {phase === "ended" && (
        <div className="restart" onClick={() => restart(player)}>
          Restart
        </div>
      )}
      {/* Controls */}
      <div className="controls">
        <div className="raw">
          <div className={`key ${forward ? "active" : ""}`}></div>
        </div>
        <div className="raw">
          <div className={`key ${leftward ? "active" : ""}`}></div>
          <div className={`key ${backward ? "active" : ""}`}></div>
          <div className={`key ${rightward ? "active" : ""}`}></div>
        </div>
        <div className="raw">
          <div className={`key large ${jump ? "active" : ""}`}></div>
        </div>
      </div>
    </div>
  );
}

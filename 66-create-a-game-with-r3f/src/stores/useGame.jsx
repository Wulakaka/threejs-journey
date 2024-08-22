import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { produce } from "immer";

export default create(
  subscribeWithSelector((set) => {
    return {
      blocksCount: 10,
      blocksSeed: 0,

      start: (key) => {
        set(
          produce((state) => {
            if (state[key].phase === "ready") {
              state[key].phase = "playing";
              state[key].startTime = Date.now();
            }
          }),
        );
      },
      restart: (key) => {
        set(
          produce((state) => {
            if (
              state[key].phase === "playing" ||
              state[key].phase === "ended"
            ) {
              state[key].phase = "ready";
            }
          }),
        );
      },
      end: (key) => {
        set(
          produce((state) => {
            if (state[key].phase === "playing") {
              state[key].phase = "ended";
              state[key].endTime = Date.now();
            }
          }),
        );
      },

      player1: {
        phase: "ready",
        /**
         * Time
         */
        startTime: 0,
        endTime: 0,
      },

      /**
       * Player2
       */
      player2: {
        phase: "ready",
        /**
         * Time
         */
        startTime: 0,
        endTime: 0,
      },
    };
  }),
);

import { randomBool, randomInt } from "./random";

export type InitOptions = {
  volumeMin?: number;
  volumeMax?: number;
  muteProb?: number;
};

export function getInitialChannelState(idx: number, opts: InitOptions = {}) {
  const { volumeMin = 10, volumeMax = 90, muteProb = 0.5 } = opts;
  const isMuted = randomBool(muteProb);
  const volume = randomInt(volumeMin, volumeMax);
  return { idx, isMuted, volume };
}

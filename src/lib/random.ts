export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomBool(prob = 0.5) {
  return Math.random() < prob;
}

export type VideoCategory = {
  name: string;
  links: string[]; // sima YouTube URL-ek (watch?v=..., youtu.be/..., stb.)
};

export const videoData: VideoCategory[] = [
  {
    name: "🌳",
    links: [
      "https://www.youtube.com/watch?v=Vg1mpD1BICI&ab_channel=NomadicAmbience",
    ],
  },
  {
    name: "🪼",
    links: [
      "https://www.youtube.com/watch?v=nZUMdnky11E&t=6821s&ab_channel=NatureSoundscapes",
    ],
  },
  {
    name: "🌴",
    links: [
      "https://www.youtube.com/watch?v=2wYtJwDkKIk&ab_channel=Fireplace4K",
    ],
  },
  {
    name: "🌦️",
    links: [
      "https://www.youtube.com/watch?v=XDLQWASvK0s&ab_channel=BackgroundCompany",
    ],
  },
  {
    name: "🌦️",
    links: [
      "https://www.youtube.com/watch?v=_hEN8q2g9qQ&ab_channel=NatureSoundscapes",
    ],
  },
  {
    name: "🎶",
    links: [
      "https://www.youtube.com/watch?v=nVuV04EUPdM&t=88s&ab_channel=RainWhisperStudio",
    ],
  },
];

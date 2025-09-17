export type VideoCategory = {
  name: string;
  links: string[]; // sima YouTube URL-ek (watch?v=..., youtu.be/..., stb.)
};

export const videoData: VideoCategory[] = [
  {
    name: "🌳",
    links: [
      "https://www.youtube.com/watch?v=V4t526MJ9ac&ab_channel=DelhiteGurdeep",
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
      "https://www.youtube.com/watch?v=Ptg0Icza6Fs&ab_channel=NatureRiver",
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

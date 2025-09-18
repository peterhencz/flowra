export type VideoCategory = {
  name: string;
  links: string[]; // sima YouTube URL-ek (watch?v=..., youtu.be/..., stb.)
};

export const videoData: VideoCategory[] = [
  {
    name: "🌊",
    links: [
      "https://www.youtube.com/watch?v=-THE-zblZ9o&ab_channel=CalmedByNature",
    ],
  },
  {
    name: "🪼",
    links: [
      "https://www.youtube.com/watch?v=XDLQWASvK0s&t=8913s&ab_channel=BackgroundCompany",
    ],
  },
  {
    name: "🌴",
    links: [
      "https://www.youtube.com/watch?v=7kLzyZ9gBa0&ab_channel=NatureSoundscapes",
    ],
  },
  {
    name: "🌦️",
    links: [
      "https://www.youtube.com/watch?v=mPZkdNFkNps&ab_channel=RelaxingAmbienceASMR",
    ],
  },
  {
    name: "🏙️",
    links: [
      "https://www.youtube.com/watch?v=Vg1mpD1BICI&t=319s&ab_channel=NomadicAmbience",
    ],
  },
  {
    name: "🔥",
    links: [
      "https://www.youtube.com/watch?v=kmythL1LppA&ab_channel=Forestofwing",
    ],
  },
  {
    name: "🪷",
    links: [
      "https://www.youtube.com/watch?v=V4t526MJ9ac&t=3031s&ab_channel=DelhiteGurdeep",
    ],
  },
];

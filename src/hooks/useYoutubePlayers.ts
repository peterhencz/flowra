"use client";

import { useEffect, useRef } from "react";

export type SelectedItem = { idx: number; id: string };

export default function useYouTubePlayers(
  selected: SelectedItem[],
  onReadyForIndex: (idx: number, p: YTPlayer) => void
) {
  const playersRef = useRef<Record<number, YTPlayer>>({});

  useEffect(() => {
    const w: Window = window;

    function createPlayers(YT: NonNullable<Window["YT"]>) {
      selected.forEach(({ idx, id }) => {
        if (playersRef.current[idx]) return;
        const elId = `player-${idx}`;
        playersRef.current[idx] = new YT.Player(elId, {
          videoId: id,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => onReadyForIndex(idx, playersRef.current[idx]),
          },
        });
      });
    }

    if (w.YT?.Player) {
      createPlayers(w.YT);
    } else {
      if (!document.getElementById("yt-iframe-api")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      w.onYouTubeIframeAPIReady = () => {
        if (w.YT?.Player) createPlayers(w.YT);
      };
    }
  }, [selected, onReadyForIndex]);

  const api = {
    playAll: () =>
      Object.values(playersRef.current).forEach((p) => p.playVideo()),
    muteAll: () => Object.values(playersRef.current).forEach((p) => p.mute()),
    unmuteAll: () =>
      Object.values(playersRef.current).forEach((p) => p.unMute()),
    getRef: () => playersRef.current,
  };

  return api;
}

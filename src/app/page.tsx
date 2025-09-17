"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { videoData } from "../lib/videos";
import VolumeSlider from "./components/VolumeSlider";
import styles from "./page.module.css";

type YTPlayer = any;

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/");
    const i = parts.indexOf("embed");
    if (i !== -1 && parts[i + 1]) return parts[i + 1];
  } catch {}
  return null;
}

export default function Home() {
  // minden kategóriából random link
  const selected = useMemo(
    () =>
      videoData
        .map((cat, i) => {
          const link = getRandomItem(cat.links);
          const id = extractYouTubeId(link);
          return { idx: i, category: cat.name, link, id };
        })
        .filter((x) => !!x.id),
    []
  );

  const playersRef = useRef<Record<number, YTPlayer>>({});
  const [volumes, setVolumes] = useState<Record<number, number>>({});
  const [muted, setMuted] = useState<Record<number, boolean>>({});
  const [allMuted, setAllMuted] = useState(false);

  // YouTube IFrame API + rejtett playerek
  useEffect(() => {
    const w = window as any;

    function createPlayers() {
      selected.forEach(({ idx, id }) => {
        if (!id) return;
        const elId = `player-${idx}`;
        if (playersRef.current[idx]) return;

        playersRef.current[idx] = new w.YT.Player(elId, {
          videoId: id,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              // kezdeti hangerő + némítás állapot beállítása
              playersRef.current[idx]?.setVolume(50);
              setVolumes((v) => ({ ...v, [idx]: 50 }));
              const isM = playersRef.current[idx]?.isMuted?.() ?? false;
              setMuted((m) => ({ ...m, [idx]: isM }));
            },
          },
        });
      });
    }

    if (w.YT && w.YT.Player) {
      createPlayers();
    } else {
      if (!document.getElementById("yt-iframe-api")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      (window as any).onYouTubeIframeAPIReady = () => createPlayers();
    }
  }, [selected]);

  const handleVolume = (idx: number, value: number) => {
    setVolumes((v) => ({ ...v, [idx]: value }));
    const p = playersRef.current[idx];
    if (p?.setVolume) p.setVolume(value);
  };

  const playAll = () => {
    Object.values(playersRef.current).forEach((p) => p?.playVideo?.());
  };

  const toggleMuteAll = () => {
    if (allMuted) {
      // UNMUTE ALL
      Object.values(playersRef.current).forEach((p) => p?.unMute?.());
      setAllMuted(false);
      setMuted((m) => {
        const next = { ...m };
        Object.keys(playersRef.current).forEach((key) => {
          next[Number(key)] = false;
        });
        return next;
      });
    } else {
      // MUTE ALL
      Object.values(playersRef.current).forEach((p) => p?.mute?.());
      setAllMuted(true);
      setMuted((m) => {
        const next = { ...m };
        Object.keys(playersRef.current).forEach((key) => {
          next[Number(key)] = true;
        });
        return next;
      });
    }
  };

  const toggleChannelMute = (idx: number) => {
    const player = playersRef.current[idx];
    if (!player) return;

    const isM = player?.isMuted?.() ?? muted[idx] ?? false;
    if (isM) {
      player?.unMute?.();
    } else {
      player?.mute?.();
    }

    setMuted((m) => {
      const next = { ...m, [idx]: !isM };
      // szinkronizáljuk a "Mute All" állapotot is
      const total = Object.keys(playersRef.current).length;
      if (total > 0) {
        const allNowMuted = Array.from({ length: total }).every(
          (_, i) => next[i] === true
        );
        setAllMuted(allNowMuted);
      }
      return next;
    });
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Hello World</h1>

      {/* Globális kontrollok */}
      <div className={styles.controls}>
        <button onClick={playAll} className={`${styles.button} ${styles.play}`}>
          ▶ Play All
        </button>
        <button
          onClick={toggleMuteAll}
          className={`${styles.button} ${
            allMuted ? styles.unmute : styles.mute
          }`}
        >
          {allMuted ? "🔊 Unmute All" : "🔇 Mute All"}
        </button>
      </div>

      {/* Sliderek sorban, középen */}
      <div className={styles.slidersRow}>
        {selected.map(({ idx, category }) => (
          <div key={idx} className={styles.sliderGroup}>
            <div className={styles.categoryLabel}>{category}</div>

            <VolumeSlider
              value={volumes[idx] ?? 50}
              onChange={(val) => handleVolume(idx, val)}
            />

            {/* Lokális Mute/Unmute toggle */}
            <button
              onClick={() => toggleChannelMute(idx)}
              className={styles.smallButton}
              aria-label={muted[idx] ? "Unmute channel" : "Mute channel"}
              title={muted[idx] ? "Unmute" : "Mute"}
            >
              {muted[idx] ? "🔊" : "🔇"}
            </button>

            {/* Láthatatlan YouTube player */}
            <div
              id={`player-${idx}`}
              aria-hidden="true"
              className={styles.hiddenPlayer}
            />
          </div>
        ))}
      </div>
    </main>
  );
}

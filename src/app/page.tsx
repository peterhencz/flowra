"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { videoData } from "../lib/videos";
import VolumeSlider from "./components/VolumeSlider";
import styles from "./page.module.css";

type SelectedItem = { idx: number; category: string; link: string; id: string };

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
  } catch {
    // ignore
  }
  return null;
}

export default function Home() {
  // minden kategóriából random link (csak érvényes videoId-k maradnak)
  const selected: SelectedItem[] = useMemo(() => {
    return videoData
      .map((cat, i) => {
        const link = getRandomItem(cat.links);
        const id = extractYouTubeId(link);
        return id
          ? ({ idx: i, category: cat.name, link, id } as SelectedItem)
          : null;
      })
      .filter((x): x is SelectedItem => x !== null);
  }, []);

  // YT playerek és állapotok
  const playersRef = useRef<Record<number, YTPlayer>>({});
  const [volumes, setVolumes] = useState<Record<number, number>>({});
  const [muted, setMuted] = useState<Record<number, boolean>>({});
  const [allMuted, setAllMuted] = useState(false);

  // YouTube IFrame API betöltése + rejtett playerek létrehozása
  useEffect(() => {
    const w = window as Window;

    function createPlayers() {
      selected.forEach(({ idx, id }) => {
        const elId = `player-${idx}`;
        if (playersRef.current[idx]) return;

        // @ts-expect-error: YT lehet, hogy még nincs definiálva a típus szerint ebben a pillanatban
        playersRef.current[idx] = new w.YT.Player(elId, {
          videoId: id,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              const p = playersRef.current[idx];
              p.setVolume(50);
              setVolumes((v) => ({ ...v, [idx]: 50 }));
              const isM = p.isMuted();
              setMuted((m) => ({ ...m, [idx]: isM }));
            },
          },
        });
      });
    }

    // Ha már betöltődött az API
    // @ts-expect-error: YT dinamikusan kerül a window-ra
    if ((w as any).YT && (w as any).YT.Player) {
      createPlayers();
    } else {
      if (!document.getElementById("yt-iframe-api")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      (window as Window).onYouTubeIframeAPIReady = () => createPlayers();
    }
  }, [selected]);

  // Hangerő állítás csatornánként
  const handleVolume = (idx: number, value: number) => {
    setVolumes((v) => ({ ...v, [idx]: value }));
    const p = playersRef.current[idx];
    if (p) p.setVolume(value);
  };

  // Globális Play
  const playAll = () => {
    Object.values(playersRef.current).forEach((p) => p.playVideo());
  };

  // Globális Mute/Unmute (szinkronizálja a lokális mute state-et is)
  const toggleMuteAll = () => {
    if (allMuted) {
      Object.values(playersRef.current).forEach((p) => p.unMute());
      setAllMuted(false);
      setMuted((m) => {
        const next = { ...m };
        selected.forEach(({ idx }) => (next[idx] = false));
        return next;
      });
    } else {
      Object.values(playersRef.current).forEach((p) => p.mute());
      setAllMuted(true);
      setMuted((m) => {
        const next = { ...m };
        selected.forEach(({ idx }) => (next[idx] = true));
        return next;
      });
    }
  };

  // Lokális (csatorna) Mute/Unmute
  const toggleChannelMute = (idx: number) => {
    const player = playersRef.current[idx];
    if (!player) return;

    const isM = player.isMuted();
    if (isM) {
      player.unMute();
    } else {
      player.mute();
    }

    setMuted((m) => {
      const next = { ...m, [idx]: !isM };
      // Frissítsük a globális allMuted állapotot is a jelenlegi csatornák alapján
      const allNowMuted = selected.every(({ idx: i }) => next[i] === true);
      setAllMuted(allNowMuted);
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

            {/* Láthatatlan YouTube player konténer */}
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

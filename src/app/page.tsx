"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { videoData } from "../lib/videos";
import { getInitialChannelState } from "../lib/init-state";
import ChannelStrip from "./components/ChannelStrip";
import styles from "./page.module.css";

type SelectedItem = { idx: number; category: string; link: string; id: string };

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    const v = u.searchParams.get("v");
    if (v) return v;
    const parts = u.pathname.split("/");
    const i = parts.indexOf("embed");
    return i !== -1 && parts[i + 1] ? parts[i + 1] : null;
  } catch {
    return null;
  }
}

/* ---------- smooth volume tween ---------- */
function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/* ---------- YT guard + helpers ---------- */
function isYTPlayer(obj: unknown): obj is YTPlayer {
  return !!obj && typeof (obj as YTPlayer).playVideo === "function";
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
  const playersRef = useRef<Partial<Record<number, YTPlayer>>>({});
  const [volumes, setVolumes] = useState<Record<number, number>>({});
  const [muted, setMuted] = useState<Record<number, boolean>>({});
  const [allMuted, setAllMuted] = useState(false);
  const rafRef = useRef<Record<number, number>>({}); // volume animációk

  const getAllPlayers = () =>
    Object.values(playersRef.current).filter(isYTPlayer);

  const tweenVolume = (
    idx: number,
    from: number,
    to: number,
    duration = 250
  ) => {
    const prev = rafRef.current[idx];
    if (prev) cancelAnimationFrame(prev);

    const player = playersRef.current[idx];
    const start = performance.now();

    const run = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = easeInOutQuad(progress);
      const value = Math.round(from + (to - from) * eased);

      setVolumes((v) => ({ ...v, [idx]: value }));
      if (isYTPlayer(player)) player.setVolume(value);

      if (progress < 1) {
        rafRef.current[idx] = requestAnimationFrame(run);
      } else {
        delete rafRef.current[idx];
      }
    };
    rafRef.current[idx] = requestAnimationFrame(run);
  };

  // YouTube IFrame API betöltése + rejtett playerek létrehozása
  useEffect(() => {
    const w: Window = window;

    function createPlayers(YT: NonNullable<Window["YT"]>) {
      selected.forEach(({ idx, id }) => {
        const elId = `player-${idx}`;
        if (isYTPlayer(playersRef.current[idx])) return;

        playersRef.current[idx] = new YT.Player(elId, {
          videoId: id,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              const p = playersRef.current[idx];
              // baseline: 50, unmuted
              setVolumes((v) => ({ ...v, [idx]: 50 }));
              setMuted((m) => ({ ...m, [idx]: false }));
              if (isYTPlayer(p)) {
                p.unMute();
                p.setVolume(50);
              }

              // véletlen kezdet
              const init = getInitialChannelState(idx, {
                volumeMin: 10,
                volumeMax: 90,
                muteProb: 0.5,
              });

              if (init.isMuted) {
                tweenVolume(idx, 50, 0, 300);
                setTimeout(() => {
                  const pp = playersRef.current[idx];
                  if (isYTPlayer(pp)) pp.mute();
                  setMuted((m) => ({ ...m, [idx]: true }));
                }, 320);
              } else {
                tweenVolume(idx, 50, init.volume, 300);
                setMuted((m) => ({ ...m, [idx]: false }));
              }
            },
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

    return () => {
      Object.values(rafRef.current).forEach((id) => cancelAnimationFrame(id));
      rafRef.current = {};
    };
  }, [selected]);

  // allMuted derive-olása a per-channel állapotból
  useEffect(() => {
    if (selected.length > 0) {
      const allNowMuted = selected.every(({ idx }) => muted[idx] === true);
      setAllMuted(allNowMuted);
    }
  }, [muted, selected]);

  // Hangerő állítás csatornánként
  // Hangerő állítás csatornánként – intelligens mute/unmute
  const handleVolume = (idx: number, value: number) => {
    // UI azonnal kövesse a slider értékét
    setVolumes((v) => ({ ...v, [idx]: value }));

    const p = playersRef.current[idx];
    if (!isYTPlayer(p)) return;

    if (value <= 0) {
      // slider legalján: némítsuk a csatornát és rögzítsük 0-ra a hangerőt
      p.setVolume(0);
      p.mute();
      setMuted((m) => ({ ...m, [idx]: true }));
      return;
    }

    // ha eddig muted volt és most felhúztad: automatikus unmute + smooth fade 0 → value
    if (p.isMuted() || muted[idx] === true) {
      p.unMute();
      setMuted((m) => ({ ...m, [idx]: false }));
      // kis fade, hogy szépen jöjjön be a hang
      tweenVolume(idx, 0, value, 180);
    } else {
      // normál eset: közvetlen hangerő állítás tekerés közben
      p.setVolume(value);
    }
  };

  // Globális Play
  const playAll = () => {
    getAllPlayers().forEach((p) => p.playVideo());
  };

  // Globális Mute/Unmute – smooth
  const toggleMuteAll = () => {
    if (allMuted) {
      // unmute all
      selected.forEach(({ idx }) => {
        const p = playersRef.current[idx];
        if (!isYTPlayer(p)) return;
        p.unMute();
        const target = volumes[idx] ?? 50;
        tweenVolume(idx, 0, target, 250);
      });
      setMuted((m) => {
        const next = { ...m };
        selected.forEach(({ idx }) => (next[idx] = false));
        return next;
      });
    } else {
      // mute all
      selected.forEach(({ idx }) => {
        const p = playersRef.current[idx];
        if (!isYTPlayer(p)) return;
        const from = volumes[idx] ?? 50;
        tweenVolume(idx, from, 0, 200);
        setTimeout(() => p.mute(), 220);
      });
      setMuted((m) => {
        const next = { ...m };
        selected.forEach(({ idx }) => (next[idx] = true));
        return next;
      });
    }
  };

  // Lokális (csatorna) Mute/Unmute – smooth
  const toggleChannelMute = (idx: number) => {
    const p = playersRef.current[idx];
    if (!isYTPlayer(p)) return;

    const isM = p.isMuted() || muted[idx] === true;

    if (isM) {
      p.unMute();
      const target = volumes[idx] ?? 50;
      tweenVolume(idx, 0, target, 200);
      setMuted((m) => ({ ...m, [idx]: false }));
    } else {
      const from = volumes[idx] ?? 50;
      tweenVolume(idx, from, 0, 180);
      setTimeout(() => p.mute(), 190);
      setMuted((m) => ({ ...m, [idx]: true }));
    }
  };

  // Globális RANDOM – smooth
  const randomizeAll = () => {
    selected.forEach(({ idx }) => {
      const p = playersRef.current[idx];
      if (!isYTPlayer(p)) return;

      const next = getInitialChannelState(idx, {
        volumeMin: 10,
        volumeMax: 90,
        muteProb: 0.5,
      });

      const currentlyMuted = p.isMuted() || muted[idx] === true;
      const from = currentlyMuted ? 0 : volumes[idx] ?? 50;

      if (next.isMuted) {
        tweenVolume(idx, from, 0, 220);
        setTimeout(() => p.mute(), 230);
        setMuted((m) => ({ ...m, [idx]: true }));
        setVolumes((v) => ({ ...v, [idx]: 0 }));
      } else {
        p.unMute();
        const to = next.volume;
        const start = currentlyMuted ? 0 : from;
        tweenVolume(idx, start, to, 260);
        setMuted((m) => ({ ...m, [idx]: false }));
        setVolumes((v) => ({ ...v, [idx]: to }));
      }
    });
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Hello World</h1>

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
        <button
          onClick={randomizeAll}
          className={`${styles.button} ${styles.random}`}
          title="Randomize volumes & mute states"
        >
          🎲 Randomize
        </button>
      </div>

      <div className={styles.slidersRow}>
        {selected.map(({ idx, category }) => (
          <ChannelStrip
            key={idx}
            idx={idx}
            category={category}
            volume={volumes[idx] ?? 50}
            muted={muted[idx] ?? false}
            onVolumeChange={handleVolume}
            onToggleMute={toggleChannelMute}
          />
        ))}
      </div>
    </main>
  );
}

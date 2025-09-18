"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { videoData } from "../lib/videos";
import ChannelStrip from "./components/ChannelStrip";
import { getInitialChannelState } from "../lib/init-state";
import styles from "./page.module.css";
import PlayIcon from "./components/icons-react/Play";
import SoundOnIcon from "./components/icons-react/SoundOn";
import SoundOffIcon from "./components/icons-react/SoundOff";
import RandomIcon from "./components/icons-react/Random";
import { useEffect, useState } from "react";

/* ---------- típusok ---------- */
type SelectedItem = { idx: number; category: string; link: string; id: string };

/* ---------- utilok ---------- */
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
function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/* ---------- YT guard ---------- */
function isYTPlayer(obj: unknown): obj is YTPlayer {
  return !!obj && typeof (obj as YTPlayer).playVideo === "function";
}

export default function Home() {
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

  const playersRef = useRef<Partial<Record<number, YTPlayer>>>({});
  const [volumes, setVolumes] = useState<Record<number, number>>({});
  const [muted, setMuted] = useState<Record<number, boolean>>({});
  const [allMuted, setAllMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  const channelSnapshots = useRef<Record<number, number>>({});

  const rafRef = useRef<Record<number, number>>({});
  const preMuteSnapshotRef = useRef<{
    volumes: Record<number, number>;
    muted: Record<number, boolean>;
  } | null>(null);

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

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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

              setVolumes((v) => ({ ...v, [idx]: 50 }));
              setMuted((m) => ({ ...m, [idx]: false }));
              if (isYTPlayer(p)) {
                p.unMute();
                p.setVolume(50);
              }

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

  useEffect(() => {
    if (selected.length > 0) {
      const allNowMuted = selected.every(({ idx }) => muted[idx] === true);
      setAllMuted(allNowMuted);
    }
  }, [muted, selected]);

  const playAll = () => {
    getAllPlayers().forEach((p, k) => setTimeout(() => p.playVideo(), k * 80));
    setHasStarted(true);
  };

  const handleVolume = (idx: number, value: number) => {
    setVolumes((v) => ({ ...v, [idx]: value }));
    const p = playersRef.current[idx];
    if (!isYTPlayer(p)) return;

    if (value <= 0) {
      p.setVolume(0);
      p.mute();
      setMuted((m) => ({ ...m, [idx]: true }));
      return;
    }

    if (p.isMuted() || muted[idx] === true) {
      p.unMute();
      setMuted((m) => ({ ...m, [idx]: false }));
      tweenVolume(idx, 0, value, 180);
    } else {
      p.setVolume(value);
    }
  };

  const toggleChannelMute = (idx: number) => {
    const p = playersRef.current[idx];
    if (!isYTPlayer(p)) return;

    const isM = p.isMuted() || muted[idx] === true;

    if (!isM) {
      // most megy mute-ra → mentsük el a jelenlegi volume-ot
      channelSnapshots.current[idx] = volumes[idx] ?? 50;
      const from = volumes[idx] ?? 50;
      tweenVolume(idx, from, 0, 180);
      setTimeout(() => p.mute(), 190);
      setMuted((m) => ({ ...m, [idx]: true }));
    } else {
      // restore
      const restoreVol = channelSnapshots.current[idx] ?? 50;
      p.unMute();
      tweenVolume(idx, 0, restoreVol, 200);
      setMuted((m) => ({ ...m, [idx]: false }));
      setVolumes((v) => ({ ...v, [idx]: restoreVol }));
    }
  };

  const toggleMuteAll = () => {
    if (!allMuted) {
      preMuteSnapshotRef.current = {
        volumes: { ...volumes },
        muted: { ...muted },
      };

      selected.forEach(({ idx }) => {
        const p = playersRef.current[idx];
        const from = volumes[idx] ?? 50;
        tweenVolume(idx, from, 0, 220);
        if (isYTPlayer(p)) setTimeout(() => p.mute(), 230);
      });
      setMuted((m) => {
        const next = { ...m };
        selected.forEach(({ idx }) => (next[idx] = true));
        return next;
      });
    } else {
      const snap = preMuteSnapshotRef.current;

      selected.forEach(({ idx }) => {
        const p = playersRef.current[idx];
        const targetVol = snap?.volumes[idx] ?? volumes[idx] ?? 50;
        const targetMuted = snap?.muted[idx] ?? false;

        if (targetMuted) {
          setVolumes((v) => ({ ...v, [idx]: targetVol }));
          if (isYTPlayer(p)) {
            p.setVolume(0);
            p.mute();
          }
        } else {
          if (isYTPlayer(p)) p.unMute();
          tweenVolume(idx, 0, targetVol, 260);
        }
      });

      setMuted(() => {
        const next: Record<number, boolean> = {};
        selected.forEach(({ idx }) => {
          next[idx] = snap?.muted[idx] ?? false;
        });
        return next;
      });

      preMuteSnapshotRef.current = null;
    }
  };

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
      {isMobile === true && (
        <div className={styles.mobileOverlay}>
          <div className={styles.mobileCard}>
            <h2 className={styles.mobileTitle}>flowra</h2>
            <p className={styles.mobileText}>
              This experience is currently available on desktop only.
            </p>
            <p className={styles.mobileSub}>
              Please visit on a larger screen to mix the layers.
            </p>
          </div>
        </div>
      )}

      <div className={styles.titleContainer}>
        <h1 className={`${styles.title} modak-regular`}>flowra</h1>
      </div>

      <div className={styles.box}>
        {/* OVERLAY: csak amíg nincs start */}
        <div
          className={`${styles.overlay} ${
            hasStarted ? styles.overlayHidden : ""
          }`}
          aria-hidden={hasStarted}
        >
          <button
            className={styles.overlayButton}
            onClick={playAll}
            aria-label="Start"
          >
            <PlayIcon className={styles.overlayIcon} />
          </button>
        </div>

        {/* felső kontrollsor – Play már NINCS itt */}
        <div className={styles.controls}>
          <button
            onClick={toggleMuteAll}
            className={`${styles.button} ${
              allMuted ? styles.unmute : styles.mute
            }`}
            title={
              allMuted ? "Restore previous state" : "Mute all (snapshot & fade)"
            }
          >
            {allMuted ? (
              <SoundOnIcon className={styles.iconSound} />
            ) : (
              <SoundOffIcon className={styles.iconSound} />
            )}
          </button>

          <button
            onClick={randomizeAll}
            className={`${styles.button} ${styles.random}`}
            title="Randomize volumes & mute states"
          >
            <RandomIcon className={styles.icon} />
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
      </div>
    </main>
  );
}

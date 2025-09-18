"use client";

import VolumeSlider from "./VolumeSlider";
import styles from "@/app/page.module.css";

import SoundOnIcon from "./icons-react/SoundOn";
import SoundOffIcon from "./icons-react/SoundOff";

export type ChannelStripProps = {
  idx: number;
  category: string;
  volume: number;
  muted: boolean;
  onVolumeChange: (idx: number, v: number) => void;
  onToggleMute: (idx: number) => void; // parent kezeli a snapshotot is
};

export default function ChannelStrip({
  idx,
  category,
  volume,
  muted,
  onVolumeChange,
  onToggleMute,
}: ChannelStripProps) {
  return (
    <div className={styles.sliderGroup}>
      <div className={styles.categoryLabel}>{category}</div>

      <VolumeSlider value={volume} onChange={(v) => onVolumeChange(idx, v)} />

      <button
        onClick={() => onToggleMute(idx)}
        className={styles.smallButton}
        aria-label={muted ? "Restore channel volume" : "Mute channel"}
        title={muted ? "Restore previous volume" : "Mute"}
      >
        {muted ? (
          <SoundOnIcon className={styles.iconChannelStrip} />
        ) : (
          <SoundOffIcon className={styles.iconChannelStrip} />
        )}
      </button>

      {/* Hidden YT host */}
      <div
        id={`player-${idx}`}
        aria-hidden="true"
        className={styles.hiddenPlayer}
      />
    </div>
  );
}

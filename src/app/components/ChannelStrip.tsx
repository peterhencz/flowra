"use client";

import VolumeSlider from "./VolumeSlider";
import styles from "@/app/page.module.css";

export type ChannelStripProps = {
  idx: number;
  category: string;
  volume: number;
  muted: boolean;
  onVolumeChange: (idx: number, v: number) => void;
  onToggleMute: (idx: number) => void;
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
        aria-label={muted ? "Unmute channel" : "Mute channel"}
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? "🔊" : "🔇"}
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

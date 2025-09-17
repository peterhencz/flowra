"use client";

import * as Slider from "@radix-ui/react-slider";
import styles from "./VolumeSlider.module.css";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function VolumeSlider({ value, onChange }: Props) {
  return (
    <Slider.Root
      className={styles.sliderRoot}
      orientation="vertical"
      min={0}
      max={100}
      step={1}
      value={[value]}
      onValueChange={(val) => onChange(val[0])}
    >
      <Slider.Track className={styles.sliderTrack}>
        <Slider.Range className={styles.sliderRange} />
      </Slider.Track>
      <Slider.Thumb className={styles.sliderThumb} />
    </Slider.Root>
  );
}

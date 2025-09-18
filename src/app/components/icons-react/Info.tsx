import * as React from "react";
import type { SVGProps } from "react";
const SvgInfo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 64 64"
    {...props}
  >
    <path d="M32 10.5A21.53 21.53 0 0 0 10.5 32c1.18 28.52 41.82 28.51 43 0A21.53 21.53 0 0 0 32 10.5m0 40A18.52 18.52 0 0 1 13.5 32c1-24.54 36-24.54 37 0A18.52 18.52 0 0 1 32 50.5" />
    <path d="M32 28.57a1.5 1.5 0 0 0-1.5 1.5v9.41a1.5 1.5 0 1 0 3 0v-9.41a1.5 1.5 0 0 0-1.5-1.5" />
    <path d="M30.94 22.92a1.5 1.5 0 0 0-.19.23q-.083.124-.14.26-.05.137-.08.28a1.5 1.5 0 1 0 .41-.77" />
    <defs>
      <linearGradient
        id="info_svg__a"
        x1={10.5}
        x2={53.5}
        y1={31.94}
        y2={31.94}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6031A5" />
        <stop offset={0.63} stopColor="#412083" />
        <stop offset={1} stopColor="#331974" />
      </linearGradient>
      <linearGradient
        id="info_svg__b"
        x1={122}
        x2={131}
        y1={460.066}
        y2={460.066}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6031A5" />
        <stop offset={0.63} stopColor="#412083" />
        <stop offset={1} stopColor="#331974" />
      </linearGradient>
      <linearGradient
        id="info_svg__c"
        x1={121.972}
        x2={131.032}
        y1={94.419}
        y2={94.419}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6031A5" />
        <stop offset={0.63} stopColor="#412083" />
        <stop offset={1} stopColor="#331974" />
      </linearGradient>
    </defs>
  </svg>
);
export default SvgInfo;

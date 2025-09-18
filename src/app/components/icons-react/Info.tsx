import * as React from "react";
import type { SVGProps } from "react";
const SvgInfo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width="1em"
    height="1em"
    viewBox="0 0 64 64"
    fill="currentColor"
    {...props}
  >
    <path
      fill="none"
      strokeMiterlimit={10}
      strokeWidth={2}
      d="M53.92 10.081c12.107 12.105 12.107 31.732 0 43.838-12.106 12.108-31.734 12.108-43.84 0-12.107-12.105-12.107-31.732 0-43.838 12.106-12.108 31.733-12.108 43.84 0z"
    />
    <path strokeMiterlimit={10} strokeWidth={2} d="M32 47V25M32 21v-4" />
  </svg>
);
export default SvgInfo;

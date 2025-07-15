import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

export default function CalendarIcon({ size = 20, color = 'white' }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Rect
        x="3"
        y="4"
        width="18"
        height="17"
        rx="1"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 4H4A1 1 0 0 0 3 5V9H21V5A1 1 0 0 0 20 4Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17 3V5M12 3V5M7 3V5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

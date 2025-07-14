import React from 'react';
import Svg, { Polygon } from 'react-native-svg';

export default function WaterGlassIcon({ filled }) {
  return (
    <Svg width={32} height={50} viewBox="0 0 512 512">
      <Polygon
        points="375.783,512 136.217,512 71.434,0 440.566,0"
        fill={filled ? '#4DD0E1' : '#E8F4FD'}
      />
      <Polygon
        points="426.108,0 362.949,499.177 134.593,499.177 136.217,512 375.783,512 440.566,0"
        fill={filled ? '#26C6DA' : '#B8E6FF'}
      />
    </Svg>
  );
}

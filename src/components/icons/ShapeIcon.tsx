import React from 'react';
import Svg, { Circle, Rect, Polygon } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const ShapeIcon: React.FC<IconProps> = ({ size = 64, color = '#FF6B6B' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256">
      {/* Circle */}
      <Circle cx="80" cy="90" r="40" fill="#FF6B6B" />
      {/* Square */}
      <Rect x="140" y="50" width="80" height="80" rx="8" fill="#4D96FF" />
      {/* Triangle */}
      <Polygon points="128,180 80,240 176,240" fill="#FFD93D" />
    </Svg>
  );
};

export default ShapeIcon;

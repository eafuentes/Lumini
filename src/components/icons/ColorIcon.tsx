import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const ColorIcon: React.FC<IconProps> = ({ size = 64, color = '#FF6B6B' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256">
      {/* Red circle */}
      <Circle cx="90" cy="100" r="50" fill="#FF6B6B" opacity="0.85" />
      {/* Yellow circle */}
      <Circle cx="166" cy="100" r="50" fill="#FFD93D" opacity="0.85" />
      {/* Green circle */}
      <Circle cx="128" cy="160" r="50" fill="#6BCB77" opacity="0.85" />
    </Svg>
  );
};

export default ColorIcon;

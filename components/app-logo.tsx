import { useId } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

type AppLogoProps = {
  size?: number;
};

/**
 * Cue app mark: an indigo squircle with a white chat bubble holding a check,
 * and a coral notification dot. Source artwork lives in assets/images/logo.svg.
 */
export function AppLogo({ size = 32 }: AppLogoProps) {
  // Unique gradient id so several logos on one screen don't clash (web).
  const gradientId = `cue-logo-${useId()}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="Cue">
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#818CF8" />
          <Stop offset="1" stopColor="#4F46E5" />
        </LinearGradient>
      </Defs>

      <Rect width={64} height={64} rx={18} fill={`url(#${gradientId})`} />

      {/* Lucide's message-circle + check, scaled into the tile. */}
      <G transform="translate(10.6 12.6) scale(1.7)">
        <Path
          d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719Z"
          fill="#FFFFFF"
        />
        <Path
          d="m8.5 12 2.5 2.5 5-5"
          fill="none"
          stroke="#4F46E5"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>

      <Circle cx={48} cy={16} r={4.5} fill="#FB7185" />
    </Svg>
  );
}

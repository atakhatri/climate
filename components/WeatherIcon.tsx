import React from "react";
// --- Import View from react-native ---
import { StyleProp, View, ViewStyle } from "react-native";
// ------------------------------------
import Svg, {
  Circle,
  Defs,
  G,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { WeatherIcon } from "../app/utils/types";
import { COLORS } from "../styles/theme";

interface WeatherIconProps {
  condition: WeatherIcon;
  isDay?: boolean;
  size: number;
  style?: StyleProp<ViewStyle>;
}

// --- SVG Definitions (SunnyIcon, CloudyIcon, PartlyCloudyDayIcon, RainyIcon, etc.) ---
// ... (keep all your SVG component definitions exactly as they were) ...
const SunnyIcon = ({ size }: { size: number }) => (
  <Svg height={size} width={size} viewBox="0 0 64 64">
    <Defs>
      <RadialGradient id="sunnyGrad">
        <Stop offset="0%" stopColor={COLORS.yellow} stopOpacity="1" />
        <Stop offset="100%" stopColor="#FFD700" stopOpacity="1" />
      </RadialGradient>
    </Defs>
    <Circle cx="32" cy="32" r="16" fill="url(#sunnyGrad)" />
    {/* Sun Rays */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <Path
        key={angle}
        d={`M32 ${12 - 4} L32 ${12 + 4}`} // Simple line for ray
        stroke={COLORS.yellow}
        strokeWidth="3"
        strokeLinecap="round"
        transform={`rotate(${angle} 32 32)`}
      />
    ))}
  </Svg>
);

const MoonIcon = ({ size }: { size: number }) => (
  <Svg height={size} width={size} viewBox="0 0 64 64">
    <Path
      d="M49.9,32.2c0,10.9-6.3,20.3-15.6,24.4c-1.2,0.5-2.5,0.2-3.4-0.8c-0.9-1-1-2.4-0.2-3.5c3.1-4.4,4.8-9.6,4.8-15.1 c0-6-1.9-11.6-5.4-16.4c-0.8-1.1-0.7-2.6,0.3-3.5c0.9-0.9,2.3-1,3.4-0.3C43.3,11.5,49.9,21.2,49.9,32.2z"
      fill="#F5F3CE" // A pale yellow for the moon
    />
  </Svg>
);

const CloudyIcon = ({ size }: { size: number }) => (
  <Svg height={size} width={size} viewBox="0 0 64 64">
    <Path
      d="M47.7,21.9 C46.1,14.7,39.6,9,32,9 c-5.9,0-11,2.9-14.3,7.4 C11.4,17.2,6,22.8,6,30 c0,6.6,5.4,12,12,12 h29 c5,0,9-4,9-9 C56,26.4,52.4,22.5,47.7,21.9z"
      fill="#FAFAFA" // Light gray/white cloud
      stroke="#E0E0E0" // Slightly darker border
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </Svg>
);

const PartlyCloudyDayIcon = ({ size }: { size: number }) => (
  <Svg height={size} width={size} viewBox="0 0 64 64">
    {/* Sun (partial) */}
    <Circle cx="24" cy="22" r="10" fill={COLORS.yellow} />
    {/* Cloud */}
    <Path
      d="M47.7,29.9 C46.1,22.7,39.6,17,32,17 c-5.9,0-11,2.9-14.3,7.4 C11.4,25.2,6,30.8,6,38 c0,6.6,5.4,12,12,12 h29 c5,0,9-4,9-9 C56,34.4,52.4,30.5,47.7,29.9z"
      fill="#FAFAFA"
      stroke="#E0E0E0"
      strokeWidth="1.5"
      strokeLinejoin="round"
      transform="translate(5, 5)" // Offset cloud slightly
    />
  </Svg>
);

const PartlyCloudyNightIcon = ({ size }: { size: number }) => (
  <Svg height={size} width={size} viewBox="0 0 64 64">
    {/* Moon */}
    <G transform="translate(-8, -5)">
      <Path
        d="M49.9,32.2c0,10.9-6.3,20.3-15.6,24.4c-1.2,0.5-2.5,0.2-3.4-0.8c-0.9-1-1-2.4-0.2-3.5c3.1-4.4,4.8-9.6,4.8-15.1 c0-6-1.9-11.6-5.4-16.4c-0.8-1.1-0.7-2.6,0.3-3.5c0.9-0.9,2.3-1,3.4-0.3C43.3,11.5,49.9,21.2,49.9,32.2z"
        fill="#F5F3CE"
      />
    </G>
    {/* Cloud */}
    <Path
      d="M47.7,29.9 C46.1,22.7,39.6,17,32,17 c-5.9,0-11,2.9-14.3,7.4 C11.4,25.2,6,30.8,6,38 c0,6.6,5.4,12,12,12 h29 c5,0,9-4,9-9 C56,34.4,52.4,30.5,47.7,29.9z"
      fill="#B0BEC5" // A slightly darker cloud for night
      transform="translate(5, 5)"
    />
  </Svg>
);

const RainyIcon = ({ size }: { size: number }) => (
  <Svg height={size} width={size} viewBox="0 0 64 64">
    {/* Cloud */}
    <Path
      d="M47.7,21.9 C46.1,14.7,39.6,9,32,9 c-5.9,0-11,2.9-14.3,7.4 C11.4,17.2,6,22.8,6,30 c0,6.6,5.4,12,12,12 h29 c5,0,9-4,9-9 C56,26.4,52.4,22.5,47.7,21.9z"
      fill="#BDBDBD" // Darker gray for rain cloud
      stroke="#9E9E9E"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Rain Drops */}
    <G fill={COLORS.blueLight} transform="translate(0, 8)">
      <Path d="M24 40 Q 24 44, 22 46 Q 20 48, 20 44 Q 20 40, 24 40 Z" />
      <Path d="M32 44 Q 32 48, 30 50 Q 28 52, 28 48 Q 28 44, 32 44 Z" />
      <Path d="M40 40 Q 40 44, 38 46 Q 36 48, 36 44 Q 36 40, 40 40 Z" />
    </G>
  </Svg>
);

const StormyIcon = ({ size }: { size: number }) => (
  <Svg height={size} width={size} viewBox="0 0 64 64">
    {/* Dark Storm Cloud */}
    <Path
      d="M47.7,21.9 C46.1,14.7,39.6,9,32,9 c-5.9,0-11,2.9-14.3,7.4 C11.4,17.2,6,22.8,6,30 c0,6.6,5.4,12,12,12 h29 c5,0,9-4,9-9 C56,26.4,52.4,22.5,47.7,21.9z"
      fill="#616161" // Dark gray for storm cloud
      stroke="#424242"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Lightning Bolt */}
    <Path
      d="M34 38 L28 48 L36 48 L30 58"
      fill="none"
      stroke={COLORS.yellow}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SnowyIcon = ({ size }: { size: number }) => (
  <Svg height={size} width={size} viewBox="0 0 64 64">
    {/* Cloud */}
    <Path
      d="M47.7,21.9 C46.1,14.7,39.6,9,32,9 c-5.9,0-11,2.9-14.3,7.4 C11.4,17.2,6,22.8,6,30 c0,6.6,5.4,12,12,12 h29 c5,0,9-4,9-9 C56,26.4,52.4,22.5,47.7,21.9z"
      fill="#BDBDBD" // Gray for snow cloud
    />
    {/* Snowflakes */}
    <G fill={COLORS.white} transform="translate(0, 8)">
      {[
        { x: 22, y: 42, r: 3 },
        { x: 32, y: 48, r: 4 },
        { x: 42, y: 42, r: 3 },
      ].map((flake, i) => (
        <Circle key={i} cx={flake.x} cy={flake.y} r={flake.r} />
      ))}
    </G>
  </Svg>
);

const WindyIcon = ({ size }: { size: number }) => (
  <Svg height={size} width={size} viewBox="0 0 64 64">
    {/* Cloud */}
    <Path
      d="M47.7,21.9 C46.1,14.7,39.6,9,32,9 c-5.9,0-11,2.9-14.3,7.4 C11.4,17.2,6,22.8,6,30 c0,6.6,5.4,12,12,12 h29 c5,0,9-4,9-9 C56,26.4,52.4,22.5,47.7,21.9z"
      fill="#B0BEC5" // A neutral gray cloud
      stroke="#90A4AE"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Wind Lines */}
    <G
      stroke="#90A4AE"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
      transform="translate(-5, 15)"
    >
      <Path d="M15 30 H 45" />
      <Path d="M10 40 H 40" />
    </G>
  </Svg>
);
// --- End SVG Definitions ---

export const WeatherIconComponent: React.FC<WeatherIconProps> = ({
  condition,
  isDay = true,
  size,
  style,
}) => {
  let IconComponent: React.FC<{ size: number }> | null = null;

  switch (condition) {
    case "sunny":
      IconComponent = SunnyIcon;
      break;
    case "clear":
      IconComponent = isDay ? SunnyIcon : MoonIcon;
      break;
    case "partly cloudy":
      IconComponent = isDay ? PartlyCloudyDayIcon : PartlyCloudyNightIcon;
      break;
    case "cloudy":
      IconComponent = CloudyIcon;
      break;
    case "rainy":
      IconComponent = RainyIcon;
      break;
    case "stormy":
      IconComponent = StormyIcon;
      break;
    case "snowy":
      IconComponent = SnowyIcon;
      break;
    case "windy":
      IconComponent = WindyIcon;
      break;
    default:
      IconComponent = CloudyIcon;
  }

  if (!IconComponent) {
    return null;
  }

  // --- Replace div with View ---
  return (
    <View style={style}>
      <IconComponent size={size} />
    </View>
  );
  // -----------------------------
};

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { CurrentWeather } from "../app/utils/types";
import { COLORS, SPACING } from "../styles/theme";

// We only need a subset of the weather data
type WeatherDetailsData = Pick<
  CurrentWeather,
  | "feelsLike"
  | "vis_km"
  | "airQualityIndex"
  | "humidity"
  | "windSpeed"
  | "uvIndex"
>;

interface WeatherDetailsGridProps {
  data: WeatherDetailsData;
  textColor: string;
}

// Helper to interpret AQI index
const getAqiInfo = (index: number | null): { text: string; color: string } => {
  if (index === null) return { text: "N/A", color: COLORS.gray };
  switch (index) {
    case 1:
      return { text: "Good", color: "#79c043" }; // Green
    case 2:
      return { text: "Moderate", color: "#facf39" }; // Yellow
    case 3:
      return { text: "Unhealthy*", color: "#f89939" }; // Orange
    case 4:
      return { text: "Unhealthy", color: "#ed2224" }; // Red
    case 5:
      return { text: "Very Unhealthy", color: "#992a87" }; // Purple
    case 6:
      return { text: "Hazardous", color: "#87324d" }; // Maroon
    default:
      return { text: "N/A", color: COLORS.gray };
  }
};

// Single Animated Detail Item Component
interface DetailItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
  unit?: string;
  index: number;
  textColor: string;
}

const AnimatedDetailItem: React.FC<DetailItemProps> = ({
  icon,
  label,
  value,
  valueColor,
  unit,
  index,
  textColor,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(15);

  useEffect(() => {
    // Stagger animation based on index
    opacity.value = withDelay(
      index * 80, // Stagger by 80ms
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );
    translateY.value = withDelay(
      index * 80,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
    );
  }, [opacity, translateY, index]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[styles.itemContainer, animatedStyle]}>
      <View style={styles.labelContainer}>
        <Ionicons name={icon} size={16} color={textColor} style={styles.icon} />
        <Text style={[styles.labelText, { color: textColor }]}>{label}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.valueText, { color: valueColor || textColor }]}>
          {value}
        </Text>
        {unit && (
          <Text style={[styles.unitText, { color: textColor }]}> {unit}</Text>
        )}
      </View>
    </Animated.View>
  );
};

export const WeatherDetailsGrid: React.FC<WeatherDetailsGridProps> = ({
  data,
  textColor,
}) => {
  const aqiInfo = getAqiInfo(data.airQualityIndex);

  const detailItems = [
    {
      icon: "thermometer-outline" as const,
      label: "Feels Like",
      value: `${data.feelsLike}°`,
      unit: "",
    },
    {
      icon: "eye-outline" as const,
      label: "Visibility",
      value: `${data.vis_km}`,
      unit: "km",
    },
    {
      icon: "leaf-outline" as const,
      label: "Air Quality",
      value: aqiInfo.text,
      unit: "",
      valueColor: aqiInfo.color,
    },
    {
      icon: "water-outline" as const,
      label: "Humidity",
      value: `${data.humidity}`,
      unit: "%",
    },
    {
      icon: "flag-outline" as const,
      label: "Wind Speed",
      value: `${data.windSpeed}`,
      unit: "m/s",
    },
    {
      icon: "sunny-outline" as const,
      label: "UV Index",
      value: `${data.uvIndex}`,
      unit: "",
    },
  ];

  return (
    <View style={styles.gridContainer}>
      {detailItems.map((item, index) => (
        <AnimatedDetailItem
          key={item.label}
          index={index}
          icon={item.icon}
          label={item.label}
          value={item.value}
          unit={item.unit}
          valueColor={item.valueColor}
          textColor={textColor}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    width: "100%",
    paddingHorizontal: SPACING.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    marginBottom: SPACING.md,
  },
  itemContainer: {
    width: "48%",
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: SPACING.sm,
    borderRadius: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: SPACING.xs,
    opacity: 1,
  },
  labelText: {
    fontSize: 16,
    fontWeight: "600",
    opacity: 1,
    textTransform: "uppercase",
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  valueText: {
    fontSize: 24,
    fontWeight: "700",
    paddingLeft: SPACING.xs - 2,
  },
  unitText: {
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.8,
  },
});

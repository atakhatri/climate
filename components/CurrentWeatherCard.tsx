import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
// --- Import Animated and Reanimated hooks ---
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
// ------------------------------------------
import { CurrentWeather } from "../app/utils/types";
import { COLORS, SPACING } from "../styles/theme";
import { WeatherIconComponent } from "./WeatherIcon";

const { width } = Dimensions.get("window");

// Interface for the data passed to the card
type CardData = Omit<CurrentWeather, "hourly" | "daily"> & { timezone: string };

interface CurrentWeatherCardProps {
  data: CardData;
  textColor: string;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  data,
  textColor,
}) => {
  const [currentTime, setCurrentTime] = useState("");

  // --- Reanimated Shared Values ---
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  // ------------------------------

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: data.timezone, // Use the city's timezone
          hour12: true,
        }).format(now)
      );
    };

    updateTime(); // Set time immediately on mount
    const intervalId = setInterval(updateTime, 1000); // Update every second

    // --- Trigger Animation ---
    opacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
    // -------------------------

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [data.timezone, opacity, translateY]); // Add animated values to dependencies

  // --- Animated Style ---
  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });
  // ----------------------

  return (
    // --- Wrap card content in Animated.View ---
    <Animated.View style={[styles.card, animatedCardStyle]}>
      {/* Location */}
      <Text style={[styles.location, { color: textColor }]}>
        {data.location}
      </Text>

      {/* Icon and Temperature */}
      <View style={styles.mainInfo}>
        {/* Use a prominent icon and color */}
        <WeatherIconComponent
          condition={data.icon}
          isDay={data.isDay} // Pass the isDay flag
          size={120}
          style={styles.icon}
        />
        <Text style={[styles.temperature, { color: textColor }]}>
          {data.temperature}°
        </Text>
      </View>

      {/* Current Time */}
      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, { color: textColor }]}>
          {currentTime}
        </Text>
      </View>

      {/* Condition & High/Low */}
      <Text style={[styles.condition, { color: textColor }]}>
        {data.condition}
      </Text>
      <View style={styles.feelsLikeContainer}>
        <Ionicons
          name="thermometer-outline"
          size={SPACING.lg}
          color={textColor}
          style={{ opacity: 0.8 }}
        />
        <Text style={[styles.feelsLikeText, { color: textColor }]}>
          Feels like: {data.feelsLike}°
        </Text>
      </View>

      {/* Condition & High/Low */}
      <Text style={[styles.highLowText, { color: textColor }]}>
        H: {data.high}° / L: {data.low}°
      </Text>

      {/* Detail Row */}
      <View style={styles.detailRow}>
        <DetailItem
          icon="flag-outline"
          coloroficon={COLORS.tabActiveTint}
          label={`${data.windSpeed} m/s`}
          textColor={textColor}
        />
        <DetailItem
          icon="water"
          coloroficon={COLORS.blue}
          label={`${data.humidity}%`}
          textColor={textColor}
        />
        <DetailItem
          icon="sunny-outline"
          coloroficon={COLORS.purple}
          label={`UV ${data.uvIndex}`}
          textColor={textColor}
        />
      </View>
    </Animated.View>
    // ----------------------------------------
  );
};

// DetailItem component remains the same
interface DetailItemProps {
  icon: any;
  coloroficon: string;
  label: string;
  textColor: string;
}

const DetailItem: React.FC<DetailItemProps> = ({
  icon,
  coloroficon,
  label,
  textColor,
}) => (
  <View style={styles.detailItem}>
    <Ionicons name={icon} size={SPACING.lg} color={coloroficon} />
    <Text style={[styles.detailText, { color: textColor }]}>{label}</Text>
  </View>
);

// Styles remain the same
const styles = StyleSheet.create({
  card: {
    width: width * 1, // Take full width
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg, // Use consistent padding
    alignItems: "center",
    marginBottom: SPACING.md, // Reduced margin
    marginTop: SPACING.lg, // Add some top margin
  },
  location: {
    fontSize: SPACING.lg, // Slightly smaller
    fontWeight: "600",
    marginTop: SPACING.md, // Adjusted margin
    marginBottom: SPACING.md, // Adjusted margin
    textShadowColor: "rgba(0, 0, 0, 0.3)", // Slightly darker shadow
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3, // Slightly larger radius
  },
  mainInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs, // Reduced margin
  },
  icon: {
    marginRight: SPACING.xs, // Reduced margin
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  temperature: {
    fontSize: width * 0.22, // Slightly smaller temp
    fontWeight: "200", // Keep thin font weight
    lineHeight: width * 0.23, // Adjust line height accordingly
    textShadowColor: "rgba(0, 0, 0, 0.4)", // Darker shadow
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4, // Larger radius
  },
  condition: {
    fontSize: SPACING.lg, // Consistent size with location
    fontWeight: "500",
    textTransform: "capitalize", // Capitalize condition text
    marginBottom: SPACING.xs, // Reduced margin
  },
  feelsLikeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  feelsLikeText: {
    fontSize: SPACING.md + 2,
    fontWeight: "400",
  },
  highLowText: {
    fontSize: SPACING.md + 2, // Slightly larger H/L text
    fontWeight: "400",
    marginBottom: SPACING.lg, // Adjusted margin
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%", // Use slightly less width for padding effect
    paddingTop: SPACING.md,
    marginTop: SPACING.md, // Add margin top
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)", // Lighter border color
  },
  detailItem: {
    alignItems: "center",
  },
  detailText: {
    fontSize: 16, // Slightly smaller detail text
    marginTop: SPACING.xs, // Reduced margin
    fontWeight: "500",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    marginTop: -SPACING.xs, // Pull it up slightly to be closer to temp
  },
  timeText: {
    fontSize: SPACING.md + 2,
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

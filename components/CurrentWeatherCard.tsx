import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { CurrentWeather } from "../app/utils/types";
import { COLORS, SPACING } from "../styles/theme";
import { WeatherIconComponent } from "./WeatherIcon";

const { width } = Dimensions.get("window");

// Interface for the data passed to the card
// This creates a type that is the same as CurrentWeather, but without the hourly and daily arrays.
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

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [data.timezone]); // Re-run effect if the timezone changes

  return (
    <View style={styles.card}>
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
    </View>
  );
};

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

const styles = StyleSheet.create({
  card: {
    width: width * 1, // Take full width
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg, // Use consistent padding
    alignItems: "center",
    marginBottom: SPACING.md, // Reduced margin
    marginTop: SPACING.lg, // Add some top margin
    // Removed background color and shadow - handled by ScreenWrapper gradient
  },
  location: {
    fontSize: SPACING.lg, // Slightly smaller
    fontWeight: "600",
    // color handled dynamically
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
    // Add shadow to icon for depth
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  temperature: {
    fontSize: width * 0.22, // Slightly smaller temp
    fontWeight: "200", // Keep thin font weight
    // color handled dynamically
    lineHeight: width * 0.23, // Adjust line height accordingly
    textShadowColor: "rgba(0, 0, 0, 0.4)", // Darker shadow
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4, // Larger radius
  },
  condition: {
    fontSize: SPACING.lg, // Consistent size with location
    fontWeight: "500",
    // color handled dynamically
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
    // color handled dynamically
  },

  highLowText: {
    // Combined High/Low style
    fontSize: SPACING.md + 2, // Slightly larger H/L text
    fontWeight: "400",
    // color handled dynamically
    marginBottom: SPACING.lg, // Adjusted margin
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%", // Use slightly less width for padding effect
    paddingTop: SPACING.md,
    marginTop: SPACING.md, // Add margin top
    // borderTopWidth: StyleSheet.hairlineWidth, // Use hairline width
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
    // color handled dynamically
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
    // color handled dynamically
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { getIconNameFromCondition } from "../app/services/weatherService"; // Import the centralized function
import { CurrentWeather } from "../app/utils/types";
import { COLORS, SPACING } from "../styles/theme";

const { width } = Dimensions.get("window");

// REMOVED getIconName function - using centralized one from service

// Interface for the data passed to the card
interface CardData extends Omit<CurrentWeather, "hourly" | "daily"> {}

interface CurrentWeatherCardProps {
  data: CardData;
  themePrimaryColor: string; // Passed from the parent using useWeatherTheme
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  data,
  themePrimaryColor,
}) => {
  const colorScheme = useColorScheme() ?? "light";

  // Use a slightly lighter/more transparent version of the theme color for the details row
  const detailBorderColor = `rgba(0, 0, 0, 0.2)`;
  // Use white text for better contrast on potentially dark backgrounds
  const detailTextColor = COLORS.textLight;
  const mainTextColor = COLORS.textLight; // Use white for main text as well

  return (
    <View style={styles.card}>
      {/* Location */}

      <Text style={[styles.location, { color: mainTextColor }]}>
        <Ionicons name="location" size={24} color={COLORS.white} />{" "}
        {data.location}
      </Text>

      {/* Icon and Temperature */}
      <View style={styles.mainInfo}>
        {/* Use a prominent icon and color */}
        <Ionicons
          name={getIconNameFromCondition(data.icon)} // Use centralized function
          size={width * 0.2}
          style={styles.icon}
          color={data.icon === "sunny" ? COLORS.yellow : COLORS.white}
        />
        <Text style={[styles.temperature, { color: mainTextColor }]}>
          {data.temperature}°
        </Text>
      </View>

      {/* Condition & High/Low */}
      <Text style={[styles.condition, { color: mainTextColor }]}>
        {data.condition}
      </Text>
      <Text style={[styles.highLowText, { color: mainTextColor }]}>
        H: {data.high}° L: {data.low}°
      </Text>

      {/* Detail Row */}
      <View style={[styles.detailRow, { borderTopColor: detailBorderColor }]}>
        <DetailItem
          icon="flag-outline"
          coloroficon={COLORS.white}
          label={`${data.windSpeed} m/s`}
          textColor={detailTextColor}
        />
        <DetailItem
          icon="water"
          coloroficon={COLORS.white}
          label={`${data.humidity}%`}
          textColor={detailTextColor}
        />
        <DetailItem
          icon="sunny-outline"
          coloroficon={COLORS.white}
          label={`UV ${data.uvIndex}`}
          textColor={detailTextColor}
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
    marginBottom: SPACING.xs, // Reduced margin
    textTransform: "capitalize", // Capitalize condition text
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
});

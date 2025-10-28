import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { CurrentWeather, WeatherIcon } from "../app/utils/types";
import { COLORS, SPACING } from "../styles/theme";

const { width } = Dimensions.get("window");

// A function to map our mock string condition to a system symbol name
const getIconName = (condition: WeatherIcon): any => {
  switch (condition) {
    case "sunny":
      return "sunny";
    case "clear":
      return "moon";
    case "cloudy":
      return "cloudy";
    case "partly cloudy":
      return "partly-sunny";
    case "rainy":
      return "rainy";
    case "stormy":
      return "thunderstorm";
    case "snowy":
      return "snow";
    case "windy":
      return "wind";
    default:
      return "partly-sunny";
  }
};

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
  const detailTextColor = COLORS.textDark;

  return (
    <View style={styles.card}>
      {/* Location */}

      <Text style={styles.location}>
        <Ionicons name="location" size={24} color={COLORS.blueLight} />
        {data.location}
      </Text>

      {/* Icon and Temperature */}
      <View style={styles.mainInfo}>
        {/* Use a prominent icon  and color */}
        <Ionicons
          name={getIconName(data.icon)}
          size={width * 0.2}
          style={styles.icon}
          color={data.icon === "sunny" ? COLORS.yellow : COLORS.white}
        />
        <Text style={styles.temperature}>{data.temperature}°</Text>
      </View>

      {/* Condition & High/Low */}
      <Text style={styles.condition}>{data.condition}</Text>
      <Text style={styles.high}>
        H: {data.high}°<Text> - </Text>
        <Text style={styles.Low}>L: {data.low}°</Text>
      </Text>

      {/* Detail Row */}
      <View style={[styles.detailRow, { borderTopColor: detailBorderColor }]}>
        <DetailItem
          icon="flag-outline"
          coloroficon={COLORS.indigo}
          label={`${data.windSpeed} m/s`}
          textColor={detailTextColor}
        />
        <DetailItem
          icon="water"
          coloroficon={COLORS.blueDark}
          label={`${data.humidity}%`}
          textColor={detailTextColor}
        />
        <DetailItem
          icon="sunny-outline"
          coloroficon={"purple"}
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
    <Ionicons name={icon} size={SPACING.xl} color={coloroficon} />
    <Text style={[styles.detailText, { color: textColor }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: width * 1,
    padding: SPACING.xl,
    alignItems: "center",
    marginBottom: SPACING.xl,
    // marginTop: SPACING.xxl * 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  location: {
    fontSize: SPACING.lg,
    fontWeight: "600",
    color: COLORS.textDark,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  mainInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  temperature: {
    fontSize: width * 0.25,
    fontWeight: "200",
    color: COLORS.textDark,
    lineHeight: width * 0.25,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  condition: {
    fontSize: SPACING.lg,
    fontWeight: "500",
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  high: {
    fontSize: SPACING.xl - 5,
    color: "rgba(255, 204, 0, 1)",
    marginBottom: SPACING.xl,
  },

  Low: {
    fontSize: SPACING.xl - 5,
    color: "rgba(0, 85, 255, 1)",
    marginBottom: SPACING.xl,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
  },
  detailItem: {
    alignItems: "center",
  },
  detailText: {
    fontSize: 18,
    marginTop: SPACING.xs,
    fontWeight: "500",
    color: COLORS.textDark,
  },
});

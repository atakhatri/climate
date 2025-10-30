import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
// --- Import Animated and Reanimated hooks ---
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
// ------------------------------------------
import { HourlyData } from "../app/utils/types";
import { SPACING } from "../styles/theme";
import { WeatherIconComponent } from "./WeatherIcon";

interface HourlyForecastProps {
  data: HourlyData[];
  textColor: string;
}

// --- Create an Animated Item Component ---
interface HourlyItemProps {
  item: HourlyData;
  index: number;
  textColor: string;
}

const AnimatedHourlyItem: React.FC<HourlyItemProps> = ({
  item,
  index,
  textColor,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(15);

  useEffect(() => {
    // Stagger animation based on index
    opacity.value = withDelay(
      index * 75,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );
    translateY.value = withDelay(
      index * 75,
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
    <Animated.View style={[styles.hourItem, animatedStyle]}>
      <Text style={[styles.timeText, { color: textColor }]}>{item.time}</Text>
      <WeatherIconComponent
        condition={item.icon}
        isDay={item.isDay}
        size={SPACING.xxl + 4}
        style={styles.icon}
      />
      <Text style={[styles.tempText, { color: textColor }]}>{item.temp}°</Text>
    </Animated.View>
  );
};
// ----------------------------------------

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  data,
  textColor,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>Hourly Forecast</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- Map over data and render AnimatedHourlyItem --- */}
        {data.map((item, index) => (
          <AnimatedHourlyItem
            key={index}
            item={item}
            index={index}
            textColor={textColor}
          />
        ))}
        {/* -------------------------------------------------- */}
      </ScrollView>
    </View>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: SPACING.sm, // Reduced vertical padding
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.md,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 20, // Slightly smaller title
    fontWeight: "900", // Bolder
    marginBottom: SPACING.xs,
    paddingLeft: SPACING.xs,
  },
  scrollContent: {
    paddingVertical: SPACING.sm, // Add vertical padding
  },
  hourItem: {
    alignItems: "center", // Center items vertically
    paddingHorizontal: SPACING.md,
    minWidth: 65, // Adjust width if needed
  },
  timeText: {
    fontSize: 16,
    marginBottom: SPACING.xs, // Reduce margin
    fontWeight: "700",
  },
  icon: {
    marginBottom: SPACING.xs, // Reduce margin // NOTE: Corrected from lg to xs for better spacing
    height: SPACING.xxl + 4, // Explicit height can help alignment // NOTE: Adjusted size slightly
  },
  tempText: {
    fontSize: 18, // Slightly smaller temp
    fontWeight: "800",
  },
});

import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
// --- Import Animated and Reanimated hooks ---
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
// ------------------------------------------
import { DailyData } from "../app/utils/types";
import { SPACING } from "../styles/theme";
import { WeatherIconComponent } from "./WeatherIcon";

interface DailyForecastProps {
  data: DailyData[];
  textColor: string;
}

// --- Create an Animated Item Component ---
interface DailyItemProps {
  item: DailyData;
  index: number;
  isLast: boolean;
  textColor: string;
}

const AnimatedDailyItem: React.FC<DailyItemProps> = ({
  item,
  index,
  isLast,
  textColor,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(15);

  useEffect(() => {
    // Stagger animation based on index
    opacity.value = withDelay(
      index * 90,
      withTiming(1, { duration: 450, easing: Easing.out(Easing.ease) })
    );
    translateY.value = withDelay(
      index * 90,
      withTiming(0, { duration: 450, easing: Easing.out(Easing.ease) })
    );
  }, [opacity, translateY, index]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.dayItem,
        isLast && styles.lastItem, // Keep last item style
        animatedStyle, // Apply animated styles
      ]}
    >
      <Text style={[styles.dayText, { color: textColor }]}>{item.day}</Text>

      <View style={styles.iconContainer}>
        <WeatherIconComponent
          condition={item.icon}
          isDay={true}
          size={SPACING.xxl + 2}
        />
      </View>

      <View style={styles.tempContainer}>
        <Text style={[styles.tempTextHigh, { color: textColor }]}>
          {item.high}°
        </Text>
        <Text style={[styles.tempTextLow, { color: textColor, opacity: 0.7 }]}>
          {item.low}°
        </Text>
      </View>
    </Animated.View>
  );
};
// ----------------------------------------

export const DailyForecast: React.FC<DailyForecastProps> = ({
  data,
  textColor,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>7-Day Forecast</Text>
      <View style={styles.list}>
        {/* --- Map over data and render AnimatedDailyItem --- */}
        {data.map((item, index) => (
          <AnimatedDailyItem
            key={index}
            item={item}
            index={index}
            isLast={index === data.length - 1}
            textColor={textColor}
          />
        ))}
        {/* ------------------------------------------------ */}
      </View>
    </View>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: SPACING.sm, // Increased margin
    paddingLeft: SPACING.xs,
  },
  list: {
    width: "100%",
  },
  dayItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm + 2, // Adjusted padding
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)", // Darker, less opaque border
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  dayText: {
    fontSize: 18, // Slightly smaller
    fontWeight: "800",
    flex: 1.2, // Give day text slightly more space
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
    paddingRight: SPACING.md, // Add padding
  },
  tempContainer: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center", // Align temps vertically
  },
  tempTextHigh: {
    fontSize: 18,
    fontWeight: "800",
    minWidth: 35, // Ensure space
    textAlign: "right",
    marginRight: SPACING.sm, // Add space between high and low
  },
  tempTextLow: {
    fontSize: 18,
    fontWeight: "800", // Slightly less bold
    minWidth: 35, // Ensure space
    textAlign: "right",
  },
});

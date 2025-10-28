import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { CurrentWeatherCard } from "../../components/CurrentWeatherCard";
import { DailyForecast } from "../../components/DailyForecast";
import { HourlyForecast } from "../../components/HourlyForecast";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { useWeatherTheme } from "../../hooks/useWeatherTheme";
import { MOCK_WEATHER_DATA } from "../utils/mockWeather";

export default function Index() {
  const weatherData = MOCK_WEATHER_DATA;

  // Use the custom hook to get thematic styles
  const { primaryColor } = useWeatherTheme(weatherData.icon);

  return (
    <ScreenWrapper
      backgroundColor={primaryColor}
      style={styles.contentContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Weather Card */}
        <CurrentWeatherCard
          data={weatherData}
          themePrimaryColor={primaryColor}
        />

        {/* Hourly Forecast Section */}
        <HourlyForecast data={weatherData.hourly} />

        {/* Daily Forecast Section */}
        <DailyForecast data={weatherData.daily} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 100, // Space for the tab bar
  },
});

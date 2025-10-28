import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text } from "react-native";
import { CurrentWeatherCard } from "../../components/CurrentWeatherCard";
import { DailyForecast } from "../../components/DailyForecast";
import { HourlyForecast } from "../../components/HourlyForecast";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { useWeatherTheme } from "../../hooks/useWeatherTheme";
import { COLORS } from "../../styles/theme";
import { fetchWeatherData } from "../services/weatherService"; // Import the API service
import { CurrentWeather } from "../utils/types"; // Import the type

// Coordinates for Vadodara, India
const VADODARA_LAT = 22.3072;
const VADODARA_LON = 73.1812;

export default function Index() {
  const [weatherData, setWeatherData] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the custom hook to get thematic styles - provide a default icon
  const { primaryColor, backgroundGradient } = useWeatherTheme(
    weatherData?.icon ?? "sunny"
  );

  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      setError(null);
      const data = await fetchWeatherData(VADODARA_LAT, VADODARA_LON);
      if (data) {
        setWeatherData(data);
      } else {
        setError(
          "Failed to fetch weather data. Please check your API key and network connection."
        );
        // Keep showing mock data or some default state if API fails
        // setWeatherData(MOCK_WEATHER_DATA); // Or set to null/empty state
      }
      setLoading(false);
    };

    loadWeather();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <ScreenWrapper gradientColors={backgroundGradient} style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.white} />
        <Text style={styles.loadingText}>Fetching Weather...</Text>
      </ScreenWrapper>
    );
  }

  // Handle case where API key might be missing and fetchWeatherData returned null
  if (!weatherData && !error) {
    return (
      <ScreenWrapper gradientColors={backgroundGradient} style={styles.center}>
        <Text style={styles.errorText}>
          Weather data unavailable. Please configure API Key.
        </Text>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper
        gradientColors={["#FF6B6B", "#FFBABA"]}
        style={styles.center}
      >
        <Text style={styles.errorText}>{error}</Text>
      </ScreenWrapper>
    );
  }

  // Ensure weatherData is not null before rendering components that need it
  if (!weatherData) {
    // This case should ideally be covered by loading/error states, but acts as a failsafe
    return (
      <ScreenWrapper gradientColors={backgroundGradient} style={styles.center}>
        <Text style={styles.errorText}>Something went wrong.</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      gradientColors={backgroundGradient}
      style={styles.contentContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Weather Card */}
        <CurrentWeatherCard
          data={weatherData} // Pass only the relevant part
          themePrimaryColor={primaryColor} // Use theme color from hook
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
    paddingBottom: 40, // More space at the bottom
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.white,
    fontSize: 16,
  },
  errorText: {
    color: COLORS.textDark, // Use dark text on light error background
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

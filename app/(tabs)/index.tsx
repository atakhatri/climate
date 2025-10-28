import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router"; // Import hook to get parameters
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { CurrentWeatherCard } from "../../components/CurrentWeatherCard";
import { DailyForecast } from "../../components/DailyForecast";
import { HourlyForecast } from "../../components/HourlyForecast";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { useWeatherTheme } from "../../hooks/useWeatherTheme";
import { COLORS, SPACING } from "../../styles/theme";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../services/favoritesService";
import { fetchWeatherData, GeoLocation } from "../services/weatherService";
import { CurrentWeather } from "../utils/types";

// Default Coordinates for Vadodara, India (fallback)
const DEFAULT_LAT = 22.3072;
const DEFAULT_LON = 73.1812;
const DEFAULT_NAME = "Vadodara";

export default function Index() {
  // Get lat, lon, name from navigation parameters if they exist
  const params = useLocalSearchParams<{
    lat?: string;
    lon?: string;
    name?: string;
  }>();
  const currentLat = params.lat ? parseFloat(params.lat) : DEFAULT_LAT;
  const currentLon = params.lon ? parseFloat(params.lon) : DEFAULT_LON;
  // Use the name from params if available, otherwise use default or derive later
  const initialLocationName = params.name || DEFAULT_NAME;

  const isNotDefaultLocation =
    currentLat !== DEFAULT_LAT || currentLon !== DEFAULT_LON;

  const [weatherData, setWeatherData] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState<GeoLocation[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use the custom hook - provide a default icon initially
  const { textColor, backgroundGradient } = useWeatherTheme(
    weatherData?.icon ?? "sunny",
    weatherData?.isDay ?? true
  );

  useEffect(() => {
    const loadFavorites = async () => {
      const savedFavorites = await getFavorites();
      setFavorites(savedFavorites);
    };
    loadFavorites();
  }, []);

  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      setError(null);
      console.log(`Fetching weather for: Lat=${currentLat}, Lon=${currentLon}`); // Log coordinates being used
      const data = await fetchWeatherData(currentLat, currentLon);

      if (data) {
        // If a name was passed via params, use it directly. Otherwise use API's derived name.
        const finalLocationName =
          params.name || data.location || "Current Location";
        setWeatherData({ ...data, location: finalLocationName });
      } else {
        setError(
          "Failed to fetch weather data. Please check your API key/network or try searching again."
        );
      }
      setLoading(false);
    };

    loadWeather();
    // Re-run useEffect if lat/lon parameters change
  }, [currentLat, currentLon, params.name]); // Add params.name to ensure location updates

  // Check if the current location is a favorite
  useEffect(() => {
    const checkFavoriteStatus = () => {
      if (weatherData) {
        const isFav = favorites.some(
          (fav) => fav.lat === currentLat && fav.lon === currentLon
        );
        setIsFavorite(isFav);
      }
    };
    checkFavoriteStatus();
  }, [weatherData, favorites, currentLat, currentLon]);

  const toggleFavorite = async () => {
    // Add a guard clause to prevent running if weatherData is null
    if (!weatherData) return;

    const locationData: GeoLocation = {
      name: weatherData.location,
      lat: currentLat,
      lon: currentLon,
      country: "", // Country info isn't critical for this operation
      formatted: weatherData.condition, // Use condition as a placeholder for formatted text
    };
    isFavorite
      ? await removeFavorite(locationData)
      : await addFavorite(locationData);
    setFavorites(await getFavorites()); // Refresh favorites list state
  };

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
          Weather data unavailable. Please configure API Key or select a city.
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
    return (
      <ScreenWrapper gradientColors={backgroundGradient} style={styles.center}>
        <Text style={styles.errorText}>
          Something went wrong displaying weather.
        </Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      gradientColors={backgroundGradient}
      style={styles.contentContainer}
    >
      {isNotDefaultLocation && (
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("/")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="home-outline" size={36} color={COLORS.white} />
          <Text style={{ color: COLORS.white }}>Back to Home</Text>
        </TouchableOpacity>
      )}

      {weatherData && (
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        >
          <Ionicons
            name={isFavorite ? "star" : "star-outline"}
            size={36}
            color={isFavorite ? COLORS.white : COLORS.white}
          />
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Weather Card */}
        <CurrentWeatherCard
          // Use the potentially overridden location name
          data={weatherData}
          textColor={textColor}
        />

        {/* Hourly Forecast Section */}
        <HourlyForecast data={weatherData.hourly} textColor={textColor} />

        {/* Daily Forecast Section */}
        <DailyForecast data={weatherData.daily} textColor={textColor} />
      </ScrollView>
    </ScreenWrapper>
  );
}

// Styles remain largely the same, minor adjustments below
const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: SPACING.xxl, // Increased bottom padding
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.md, // Add padding for error/loading messages
  },
  loadingText: {
    marginTop: SPACING.sm, // Consistent spacing
    color: COLORS.white,
    fontSize: 16,
  },
  errorText: {
    color: COLORS.white, // Use white text on error gradient background too
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: SPACING.lg, // More horizontal padding
  },
  homeButton: {
    position: "absolute",
    top: SPACING.xxl, // Adjust to align with safe area, roughly
    left: SPACING.lg,
    zIndex: 10,
    padding: SPACING.sm,
    paddingLeft: SPACING.md,
    paddingRight: SPACING.md,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
  },
  favoriteButton: {
    position: "absolute",
    top: SPACING.xxl,
    right: SPACING.lg,
    zIndex: 10,
    padding: SPACING.sm,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});

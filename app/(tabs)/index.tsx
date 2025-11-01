import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";
import { CurrentWeatherCard } from "../../components/CurrentWeatherCard";
import { DailyForecast } from "../../components/DailyForecast";
import { HourlyForecast } from "../../components/HourlyForecast";
import { ScreenWrapper } from "../../components/ScreenWrapper";
// --- Import the new grid component ---
import { WeatherDetailsGrid } from "../../components/WeatherDetailsGrid";
// -------------------------------------
import { useScroll } from "../../components/ScrollContext";
import { useWeatherTheme } from "../../hooks/useWeatherTheme";
import { COLORS, SPACING } from "../../styles/theme";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../services/favoritesService";
import {
  fetchWeatherData,
  GeoLocation,
  reverseGeocode,
} from "../services/weatherService";
import { CurrentWeather } from "../utils/types";

// Default Coordinates for Vadodara, India (fallback for permission denial)
const DEFAULT_LAT = 22.3072;
const DEFAULT_LON = 73.1812;
const DEFAULT_NAME = "Vadodara";

// Define a type for our location state
interface LocationInfo {
  lat: number;
  lon: number;
  name: string;
}

export default function Index() {
  const params = useLocalSearchParams<{
    lat?: string;
    lon?: string;
    name?: string;
  }>();

  const hasNavParams = !!params.lat && !!params.lon;

  const [locationData, setLocationData] = useState<LocationInfo | null>(null);
  const [weatherData, setWeatherData] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState<GeoLocation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { scrollY } = useScroll();
  const { textColor, backgroundGradient } = useWeatherTheme(
    weatherData?.icon ?? "sunny",
    weatherData?.isDay ?? true
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useFocusEffect(
    useCallback(() => {
      scrollY.value = 0;
    }, [scrollY])
  );

  useEffect(() => {
    const loadFavorites = async () => {
      const savedFavorites = await getFavorites();
      setFavorites(savedFavorites);
    };
    loadFavorites();
  }, []);

  // Effect 1: Determine the location
  useEffect(() => {
    const determineLocation = async () => {
      setError(null);
      if (hasNavParams) {
        console.log("Using location from nav params:", params.name);
        setLocationData({
          lat: parseFloat(params.lat!),
          lon: parseFloat(params.lon!),
          name: params.name || "Selected Location",
        });
      } else {
        console.log("No nav params, fetching current location...");
        try {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setError(
              "Permission to access location was denied. Showing default location."
            );
            setLocationData({
              lat: DEFAULT_LAT,
              lon: DEFAULT_LON,
              name: DEFAULT_NAME,
            });
            return;
          }

          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const { latitude, longitude } = location.coords;

          const geoData = await reverseGeocode(latitude, longitude);
          console.log(
            "Got user location:",
            geoData?.name || "Current Location"
          );

          setLocationData({
            lat: latitude,
            lon: longitude,
            name: geoData?.name || "Current Location",
          });
        } catch (err) {
          console.error("Failed to get user location:", err);
          setError("Failed to get current location. Showing default location.");
          setLocationData({
            lat: DEFAULT_LAT,
            lon: DEFAULT_LON,
            name: DEFAULT_NAME,
          });
        }
      }
    };

    determineLocation();
  }, [hasNavParams, params.lat, params.lon, params.name]);

  // Effect 2: Fetch weather *after* location is known
  useEffect(() => {
    if (!locationData) {
      return;
    }

    const loadWeather = async () => {
      setLoading(true);
      setError(null);
      const { lat, lon, name } = locationData;

      console.log(`Fetching weather for: ${name} (Lat=${lat}, Lon=${lon})`);
      const data = await fetchWeatherData(lat, lon);

      if (data) {
        setWeatherData({ ...data, location: name });
      } else {
        setError(
          "Failed to fetch weather data. Please check your API key/network or try searching again."
        );
      }
      setLoading(false);
    };

    loadWeather();
  }, [locationData]);

  // Check if the current location is a favorite
  useEffect(() => {
    const checkFavoriteStatus = () => {
      if (weatherData && locationData) {
        const isFav = favorites.some(
          (fav) => fav.lat === locationData.lat && fav.lon === locationData.lon
        );
        setIsFavorite(isFav);
      }
    };
    checkFavoriteStatus();
  }, [weatherData, favorites, locationData]);

  const toggleFavorite = async () => {
    if (!weatherData || !locationData) return;

    const location: GeoLocation = {
      name: locationData.name,
      lat: locationData.lat,
      lon: locationData.lon,
      country: "",
      formatted: weatherData.condition,
    };
    isFavorite ? await removeFavorite(location) : await addFavorite(location);
    setFavorites(await getFavorites());
  };

  // Loading/Error/Data states...
  if (loading || !locationData) {
    return (
      <ScreenWrapper gradientColors={backgroundGradient} style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.white} />
        <Text style={styles.loadingText}>
          {error
            ? "Error"
            : !locationData
            ? "Fetching Location..."
            : "Fetching Weather..."}
        </Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScreenWrapper>
    );
  }

  if (error && !weatherData) {
    return (
      <ScreenWrapper
        gradientColors={["#FF6B6B", "#FFBABA"]}
        style={styles.center}
      >
        <Text style={styles.errorText}>{error}</Text>
        {!hasNavParams && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setLocationData(null)}
          >
            <Ionicons name="refresh-outline" size={20} color={COLORS.white} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </ScreenWrapper>
    );
  }

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
      {hasNavParams && (
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("/")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="navigate-circle-outline"
            size={36}
            color={COLORS.white}
          />
          <Text style={{ color: COLORS.white }}>My Location</Text>
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

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Main Weather Card */}
        <CurrentWeatherCard data={weatherData} textColor={textColor} />

        {/* --- ADD THE NEW DETAILS GRID --- */}
        <WeatherDetailsGrid data={weatherData} textColor={textColor} />
        {/* -------------------------------- */}

        {/* Hourly Forecast Section */}
        <HourlyForecast data={weatherData.hourly} textColor={textColor} />

        {/* Daily Forecast Section */}
        <DailyForecast data={weatherData.daily} textColor={textColor} />
      </Animated.ScrollView>
    </ScreenWrapper>
  );
}

// Styles
const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: SPACING.xxl + 80, // Padding for tab bar
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.md,
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.white,
    fontSize: 16,
  },
  errorText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md, // Add margin for retry button
  },
  homeButton: {
    position: "absolute",
    top: SPACING.xxl,
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
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    marginTop: SPACING.md,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 16,
    marginLeft: SPACING.xs,
  },
});

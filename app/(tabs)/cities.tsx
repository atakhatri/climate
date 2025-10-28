import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // Import useRouter
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../../styles/theme";
import { GeoLocation, searchCities } from "../services/weatherService"; // Import search function and type

// Debounce hook (simple implementation)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function CitiesScreen() {
  const router = useRouter(); // Initialize router
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounce search input by 500ms

  // Effect to trigger search when debounced query changes
  React.useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.trim().length < 2) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const cities = await searchCities(debouncedSearchQuery);
        setResults(cities);
        if (cities.length === 0) {
          setError("No cities found.");
        }
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to fetch cities. Check connection or API key.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  // Handle selecting a city
  const handleSelectCity = useCallback(
    (city: GeoLocation) => {
      console.log("Selected city:", city);
      // TODO: Implement navigation or state update to show weather for this city
      // Example using router to navigate back to index with params (needs index.tsx adjustment)
      router.push({
        pathname: "/", // Navigate to the home tab
        params: { lat: city.lat, lon: city.lon, name: city.name },
      });
      // Reset search after selection
      setSearchQuery("");
      setResults([]);
      setError(null);
    },
    [router]
  );

  const renderResultItem = ({ item }: { item: GeoLocation }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectCity(item)}
    >
      <Text style={styles.resultName}>{item.name}</Text>
      <Text style={styles.resultDetails}>
        {item.state ? `${item.state}, ` : ""}
        {item.country}
      </Text>
    </TouchableOpacity>
  );

  return (
    // Use SafeAreaView to avoid notch/status bar overlap
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.gray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Search for a city..."
            placeholderTextColor={COLORS.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="words"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearIconContainer}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>

        {loading && (
          <ActivityIndicator
            size="small"
            color={COLORS.tabActiveTint}
            style={styles.loader}
          />
        )}

        {!loading && error && <Text style={styles.errorText}>{error}</Text>}

        {!loading && !error && results.length > 0 && (
          <FlatList
            data={results}
            renderItem={renderResultItem}
            keyExtractor={(item) => `${item.lat}-${item.lon}-${item.name}`} // More unique key
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled" // Dismiss keyboard on tap outside input when list is shown
          />
        )}

        {/* Optional: Add section for saved cities later */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.tabBackgroundLight, // Match tab bar background or choose another
  },
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray,
    height: 45, // Fixed height for search bar
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    height: "100%", // Take full height of container
  },
  clearIconContainer: {
    paddingLeft: SPACING.sm,
  },
  loader: {
    marginTop: SPACING.md,
  },
  errorText: {
    marginTop: SPACING.md,
    textAlign: "center",
    color: "red", // Or use a theme color for errors
    fontSize: 14,
  },
  resultsList: {
    flex: 1, // Allow list to take remaining space
  },
  resultItem: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.gray,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textDark,
  },
  resultDetails: {
    fontSize: 14,
    color: COLORS.slate, // Use a secondary color
  },
});

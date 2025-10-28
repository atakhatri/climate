import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router"; // Import useRouter and useFocusEffect
import React, { useCallback, useEffect, useState } from "react";
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
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../services/favoritesService"; // Import favorite services
import { GeoLocation, searchCities } from "../services/weatherService"; // Import search function and type

// Debounce hook (simple implementation)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Helper component for rendering a location item (search result or favorite)
interface LocationListItemProps {
  item: GeoLocation;
  onPress: (item: GeoLocation) => void;
  onToggleFavorite?: (item: GeoLocation) => void; // For search results
  onRemoveFavorite?: (item: GeoLocation) => void; // For favorites list
  isFavorite?: boolean;
}

const LocationListItem: React.FC<LocationListItemProps> = ({
  item,
  onPress,
  onToggleFavorite,
  onRemoveFavorite,
  isFavorite,
}) => (
  <TouchableOpacity style={styles.resultItem} onPress={() => onPress(item)}>
    <View style={styles.itemTextContainer}>
      <Text style={styles.resultName}>{item.name}</Text>
      <Text style={styles.resultDetails}>
        {item.formatted ||
          `${item.state ? `${item.state}, ` : ""}${item.country}`}
      </Text>
    </View>
    {onToggleFavorite && (
      <TouchableOpacity
        onPress={() => onToggleFavorite(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={isFavorite ? "star" : "star-outline"}
          size={24}
          color={isFavorite ? COLORS.yellow : COLORS.gray}
        />
      </TouchableOpacity>
    )}
    {onRemoveFavorite && (
      <TouchableOpacity
        onPress={() => onRemoveFavorite(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-bin" size={24} color={COLORS.red} />
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);

export default function CitiesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<GeoLocation[]>([]); // State for favorites

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Load favorites when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        const savedFavorites = await getFavorites();
        setFavorites(savedFavorites);
      };
      loadFavorites();
    }, [])
  );

  // Effect to trigger search when debounced query changes
  useEffect(() => {
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
      router.push({
        pathname: "/", // Navigate to the home tab
        params: { lat: city.lat, lon: city.lon, name: city.name },
      });
    },
    [router]
  );

  const handleToggleFavorite = async (location: GeoLocation) => {
    const isFav = favorites.some(
      (fav) => fav.lat === location.lat && fav.lon === location.lon
    );
    if (isFav) {
      await removeFavorite(location);
    } else {
      await addFavorite(location);
    }
    setFavorites(await getFavorites()); // Refresh favorites list
  };

  const handleRemoveFavorite = async (location: GeoLocation) => {
    await removeFavorite(location);
    setFavorites(await getFavorites()); // Refresh favorites list
  };

  const renderItem = ({ item }: { item: GeoLocation }) => {
    const isFav = favorites.some(
      (fav) => fav.lat === item.lat && fav.lon === item.lon
    );
    // If search query is active, render with toggle favorite
    if (searchQuery.trim().length > 0) {
      return (
        <LocationListItem
          item={item}
          onPress={handleSelectCity}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isFav}
        />
      );
    } else {
      // If search query is empty, render favorites with remove option
      return (
        <LocationListItem
          item={item}
          onPress={handleSelectCity}
          onRemoveFavorite={handleRemoveFavorite}
          isFavorite={true} // Always true for items in the favorites list
        />
      );
    }
  };

  const showFavorites = searchQuery.trim().length === 0;
  const listData = showFavorites ? favorites : results;
  const showEmptyState = !loading && !error && listData.length === 0;

  return (
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

        {showEmptyState && (
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={60} color={COLORS.gray} />
            <Text style={styles.emptyText}>
              {showFavorites ? "No Favorite Locations" : "No cities found."}
            </Text>
            <Text style={styles.emptySubText}>
              {showFavorites
                ? "Search for a city and tap the star to add it to your favorites."
                : "Try a different search term."}
            </Text>
          </View>
        )}

        {!loading && !error && listData.length > 0 && (
          <FlatList
            data={listData}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.lat}-${item.lon}-${item.name}`}
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              showFavorites && favorites.length > 0 ? (
                <Text style={styles.favoritesHeader}>
                  Your Favorite Locations
                </Text>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight, // Use a consistent background
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
    height: 45,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    height: "100%",
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
    color: COLORS.red,
    fontSize: 14,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.gray,
  },
  itemTextContainer: { flex: 1, marginRight: SPACING.md },
  resultName: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textDark,
  },
  resultDetails: {
    fontSize: 14,
    color: COLORS.slate,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  emptyText: { fontSize: 20, fontWeight: "bold", color: COLORS.textDark },
  emptySubText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  favoritesHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
});

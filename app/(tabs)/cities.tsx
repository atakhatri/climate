import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// --- Import MapView and Callout ---
import * as Location from "expo-location";
import MapView, {
  Callout,
  Marker, // Import Callout here
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
// --------------------
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../../styles/theme";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../services/favoritesService";
import {
  GeoLocation,
  reverseGeocode, // Import new function
  searchCities,
} from "../services/weatherService";

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
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Easier to tap
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
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Easier to tap
      >
        <Ionicons name="trash-bin" size={24} color={COLORS.red} />
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);

// --- Default Region (Vadodara) ---
const DEFAULT_REGION = {
  latitude: 22.3072,
  longitude: 73.1812,
  latitudeDelta: 0.5, // Zoom level
  longitudeDelta: 0.5, // Zoom level
};
// --------------------------

export default function CitiesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<GeoLocation[]>([]);

  // --- Map State ---
  const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(
    null
  );
  const mapRef = useRef<MapView>(null); // Ref to control map position
  // -----------------

  // --- Tab Bar Visibility ---
  const lastOffsetY = useRef(0);

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

  // Effect to get user's initial location and center the map
  useEffect(() => {
    const getUserLocation = async () => {
      // 1. Request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied.");
        // The map will simply remain at the default location, which is a graceful fallback.
        return;
      }

      // 2. Get the user's current location
      try {
        let location = await Location.getCurrentPositionAsync({});
        const userRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.5, // Set a reasonable zoom level
          longitudeDelta: 0.5,
        };
        // 3. Animate the map to the user's location
        mapRef.current?.animateToRegion(userRegion, 1000);
      } catch (error) {
        console.error("Failed to get user location:", error);
      }
    };

    getUserLocation();
  }, []); // The empty dependency array ensures this runs only once on mount

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.trim().length < 2) {
        setResults([]);
        // Don't clear loading/error here if search is just empty
        // Only clear marker if search is explicitly cleared/short
        if (debouncedSearchQuery.trim().length === 0) {
          setSelectedLocation(null);
          setLoading(false); // Stop loading if query becomes empty
          setError(null);
        }
        return;
      }
      setLoading(true);
      setError(null);
      Keyboard.dismiss(); // Dismiss keyboard on search start
      try {
        const cities = await searchCities(debouncedSearchQuery);
        setResults(cities);
        if (cities.length === 0) {
          setError("No cities found.");
          setSelectedLocation(null);
        } else {
          // Set selected location to first result and move map
          const firstResult = cities[0];
          setSelectedLocation(firstResult);
          const newRegion = {
            latitude: firstResult.lat,
            longitude: firstResult.lon,
            latitudeDelta: 0.5, // Zoom to city level
            longitudeDelta: 0.5,
          };
          setMapRegion(newRegion); // Update region state immediately for smoother feel
          mapRef.current?.animateToRegion(newRegion, 500); // Animate map
        }
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to fetch cities. Check connection or API key.");
        setResults([]);
        setSelectedLocation(null);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  // Handle selecting a city (from list item's main press or map callout press)
  const handleSelectCity = useCallback(
    (city: GeoLocation) => {
      Keyboard.dismiss(); // Dismiss keyboard
      router.push({
        pathname: "/", // Navigate to the home tab
        params: { lat: city.lat, lon: city.lon, name: city.name },
      });
      // Reset search state after selection
      setSearchQuery("");
      setResults([]);
      setSelectedLocation(null);
    },
    [router]
  );

  // Handle tapping on the map
  const handleMapPress = async (event: any) => {
    // Ignore tap if loading
    if (loading) return;

    Keyboard.dismiss(); // Dismiss keyboard on map tap
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLoading(true); // Show loader for reverse geocoding
    setError(null);
    setResults([]); // Clear previous results

    const location = await reverseGeocode(latitude, longitude);

    if (location) {
      setSelectedLocation(location); // Place marker
      const newRegion = { ...mapRegion, latitude, longitude };
      setMapRegion(newRegion); // Center map visually
      mapRef.current?.animateToRegion(newRegion, 500); // Animate map to the tapped location
      // Update search bar to show what was found
      setSearchQuery(location.formatted || location.name);
      // Set the single result
      setResults([location]);
    } else {
      setError("Could not find location data for this point.");
      setSelectedLocation(null); // Remove marker if nothing found
    }
    setLoading(false);
  };

  // Handle tapping a search result item in the list
  const handleResultItemPress = (item: GeoLocation) => {
    Keyboard.dismiss();
    setSelectedLocation(item); // Set marker
    const newRegion = {
      // Center map on item
      latitude: item.lat,
      longitude: item.lon,
      latitudeDelta: mapRegion.latitudeDelta, // Keep current zoom level
      longitudeDelta: mapRegion.longitudeDelta,
    };
    setMapRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 500);
    // Note: We don't navigate here, just show it on the map.
    // User taps the marker bubble (callout) to navigate.
  };

  // Toggle favorite status (for search results)
  const handleToggleFavorite = async (location: GeoLocation) => {
    const isFav = favorites.some(
      (fav) => fav.lat === location.lat && fav.lon === location.lon
    );
    if (isFav) {
      await removeFavorite(location);
    } else {
      await addFavorite(location);
    }
    setFavorites(await getFavorites()); // Refresh favorites list state
  };

  // Remove favorite (for items in the favorites list)
  const handleRemoveFavorite = async (location: GeoLocation) => {
    await removeFavorite(location);
    setFavorites(await getFavorites()); // Refresh favorites list state
  };

  // Handle pressing the "Use My Current Location" button
  const handleUseCurrentLocation = async () => {
    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    setResults([]);

    // 1. Request permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError("Permission to access location was denied.");
      setLoading(false);
      return;
    }

    // 2. Get current position and reverse geocode it to get a name
    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Use balanced accuracy for speed
      });
      const geoData = await reverseGeocode(
        location.coords.latitude,
        location.coords.longitude
      );

      // 3. If successful, navigate to the weather screen
      if (geoData) {
        handleSelectCity(geoData);
      } else {
        setError("Could not determine your current location.");
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      setError("Failed to get your current location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: GeoLocation }) => {
    const isFav = favorites.some(
      (fav) => fav.lat === item.lat && fav.lon === item.lon
    );
    // If search query is active, render search results
    if (searchQuery.trim().length > 0) {
      return (
        <LocationListItem
          item={item} // When a search result is tapped, navigate directly to the weather screen.
          onPress={handleSelectCity}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isFav}
        />
      );
    } else {
      // If search query is empty, render favorites list
      return (
        <LocationListItem
          item={item}
          onPress={handleSelectCity} // Favorites list item navigates directly
          onRemoveFavorite={handleRemoveFavorite}
          isFavorite={true} // Always true for items shown in the favorites list view
        />
      );
    }
  };

  const showFavorites = searchQuery.trim().length === 0;
  const listData = showFavorites ? favorites : results;
  // Adjust empty state logic: show if not loading AND (error exists OR listData is empty)
  const showEmptyState = !loading && (!!error || listData.length === 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* MapView Component */}
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={DEFAULT_REGION}
          // region={mapRegion} // Let map handle internal region changes unless animating
          onRegionChangeComplete={setMapRegion} // Keep track of current region
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {selectedLocation && (
            <Marker
              coordinate={{
                latitude: selectedLocation.lat,
                longitude: selectedLocation.lon,
              }}
              title={selectedLocation.name}
              description={selectedLocation.formatted}
              // Tapping the marker itself focuses the map
            >
              {/* Callout defines the bubble content */}
              {/* Use Callout directly, not MapView.Callout */}
              <Callout
                tooltip={true}
                onPress={() => handleSelectCity(selectedLocation)}
              >
                <View style={styles.calloutView}>
                  <Text style={styles.calloutText}>
                    {selectedLocation.name}
                  </Text>
                  <Text style={styles.calloutSubText}>Tap to view weather</Text>
                </View>
              </Callout>
            </Marker>
          )}
        </MapView>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={24}
            color={COLORS.white}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Search for a city or tap map..."
            placeholderTextColor={COLORS.textLight}
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

        {/* List Container (Search Results / Favorites) */}
        <View style={styles.listContainer}>
          {loading && (
            <View style={styles.centeredMessage}>
              <ActivityIndicator size="small" color={COLORS.tabActiveTint} />
            </View>
          )}

          {showEmptyState &&
            !loading && ( // Only show empty state if not loading
              <View style={styles.emptyContainer}>
                <Ionicons
                  name={showFavorites ? "star-outline" : "search-outline"}
                  size={40}
                  color={COLORS.white}
                />
                <Text style={styles.emptyText}>
                  {error
                    ? error
                    : showFavorites
                    ? "No Favorite Locations"
                    : "No results"}
                </Text>
                <Text style={styles.emptySubText}>
                  {error
                    ? "Please try again later."
                    : showFavorites
                    ? "Search for a city and tap the star to add it."
                    : "Tap on the map or try a new search term."}
                </Text>
              </View>
            )}

          {showFavorites && !loading && (
            <View style={styles.currentLocationButtonContainer}>
              <TouchableOpacity
                style={styles.currentLocationButton}
                onPress={handleUseCurrentLocation}
              >
                <Ionicons name="locate" size={48} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && listData.length > 0 && (
            <FlatList
              data={listData}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`} // Add index for potential duplicates in search
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled" // Allows tapping items while keyboard is up
              scrollEventThrottle={16}
              ListHeaderComponent={
                <Text style={styles.listHeader}>
                  {showFavorites ? "Favorite Locations" : "Search Results"}
                </Text>
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  map: {
    width: "100%",
    height: "50%",
  },
  searchContainer: {
    position: "absolute",
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundDark,
    borderRadius: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    height: 45,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textLight,
    height: "100%",
  },
  clearIconContainer: {
    paddingLeft: SPACING.sm,
  },
  listContainer: {
    flex: 1,
    height: "60%",
    backgroundColor: COLORS.backgroundDark,
    paddingTop: SPACING.md, // Add padding top
    paddingHorizontal: SPACING.md,
    borderTopLeftRadius: SPACING.md,
    borderTopRightRadius: SPACING.md,
    marginTop: -SPACING.md,
    zIndex: 5,
    // Add a subtle top border
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  centeredMessage: {
    // Style for loading/error within list container
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
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
    color: COLORS.textLight,
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
    marginTop: SPACING.lg,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
  },
  listHeader: {
    // Renamed from favoritesHeader for dual use
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  calloutView: {
    // Style for the marker callout bubble
    padding: SPACING.sm,
    minWidth: 120, // Give it some width
    alignItems: "center",
  },
  calloutText: {
    fontWeight: "600",
    color: COLORS.textLight,
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  calloutSubText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  currentLocationButtonContainer: {
    position: "absolute",
    bottom: 430,
    right: 155,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.blueLight,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: 100,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

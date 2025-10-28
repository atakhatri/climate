// app/services/favoritesService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GeoLocation } from "./weatherService";

const FAVORITES_KEY = "weather_app_favorites";

/**
 * Retrieves the list of favorite locations from AsyncStorage.
 */
export const getFavorites = async (): Promise<GeoLocation[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(FAVORITES_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Failed to load favorites.", e);
        return [];
    }
};

/**
 * Saves the entire list of favorite locations to AsyncStorage.
 */
const saveFavorites = async (favorites: GeoLocation[]): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(favorites);
        await AsyncStorage.setItem(FAVORITES_KEY, jsonValue);
    } catch (e) {
        console.error("Failed to save favorites.", e);
    }
};

/**
 * Adds a new location to the favorites list, avoiding duplicates.
 */
export const addFavorite = async (location: GeoLocation): Promise<void> => {
    const favorites = await getFavorites();
    // Check if the location is already favorited based on lat/lon
    const isAlreadyFavorite = favorites.some(
        (fav) => fav.lat === location.lat && fav.lon === location.lon
    );
    if (!isAlreadyFavorite) {
        const newFavorites = [...favorites, location];
        await saveFavorites(newFavorites);
    }
};

/**
 * Removes a location from the favorites list.
 */
export const removeFavorite = async (location: GeoLocation): Promise<void> => {
    const favorites = await getFavorites();
    const newFavorites = favorites.filter(
        (fav) => fav.lat !== location.lat || fav.lon !== location.lon
    );
    await saveFavorites(newFavorites);
};
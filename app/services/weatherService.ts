// app/services/weatherService.ts
import { format } from "date-fns/format";
import { fromUnixTime } from "date-fns/fromUnixTime";
import { isToday } from "date-fns/isToday";
import { parseISO } from "date-fns/parseISO";
import Constants from 'expo-constants';
import { CurrentWeather, WeatherIcon } from '../utils/types';


// --- API Keys and URLs ---
// const OPENWEATHERMAP_API_KEY = Constants.expoConfig?.extra?.openWeatherApiKey || 'YOUR_OPENWEATHERMAP_API_KEY'; // No longer primary
const OPENCAGE_API_KEY = Constants.expoConfig?.extra?.openCageApiKey || process.env.OPENCAGE_API_KEY;
const WEATHERAPI_API_KEY = Constants.expoConfig?.extra?.weatherApiKey || process.env.WEATHERAPI_API_KEY; // NEW WeatherAPI Key

// const ONE_CALL_BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall'; // Old URL
const WEATHERAPI_FORECAST_URL = 'https://api.weatherapi.com/v1/forecast.json'; // NEW WeatherAPI URL
const OPENCAGE_GEOCODING_BASE_URL = 'https://api.opencagedata.com/geocode/v1/json';

// Interface for Geocoding API response items (OpenCage - keep as is)
export interface GeoLocation {
    name: string;
    lat: number;
    lon: number;
    country: string;
    state?: string;
    formatted: string;
}

// Define the structure for hourly forecast data points
export interface HourlyData {
    time: string;
    icon: WeatherIcon;
    isDay: boolean;
    temp: number;
}

// Define the structure for daily forecast data points
export interface DailyData {
    day: string;
    icon: WeatherIcon;
    high: number;
    low: number;
}

// --- NEW/UPDATED Icon Mapping for WeatherAPI.com ---
// WeatherAPI condition codes: https://www.weatherapi.com/docs/weather_conditions.json
// We need to map their text/code to our simple WeatherIcon type and Ionicon names
const weatherApiConditionMap: { [code: number]: WeatherIcon } = {
    1000: 'sunny', // Includes Clear night, handle day/night in component
    1003: 'partly cloudy',
    1006: 'cloudy',
    1009: 'cloudy', // Overcast
    1030: 'cloudy', // Mist
    1063: 'rainy', // Patchy rain possible
    1066: 'snowy', // Patchy snow possible
    1069: 'rainy', // Patchy sleet possible
    1072: 'rainy', // Patchy freezing drizzle possible
    1087: 'stormy', // Thundery outbreaks possible
    1114: 'snowy', // Blowing snow
    1117: 'snowy', // Blizzard
    1135: 'cloudy', // Fog
    1147: 'cloudy', // Freezing fog
    1150: 'rainy', // Patchy light drizzle
    1153: 'rainy', // Light drizzle
    1168: 'rainy', // Freezing drizzle
    1171: 'rainy', // Heavy freezing drizzle
    1180: 'rainy', // Patchy light rain
    1183: 'rainy', // Light rain
    1186: 'rainy', // Moderate rain at times
    1189: 'rainy', // Moderate rain
    1192: 'rainy', // Heavy rain at times
    1195: 'rainy', // Heavy rain
    1198: 'rainy', // Light freezing rain
    1201: 'rainy', // Moderate or heavy freezing rain
    1204: 'rainy', // Light sleet
    1207: 'rainy', // Moderate or heavy sleet
    1210: 'snowy', // Patchy light snow
    1213: 'snowy', // Light snow
    1216: 'snowy', // Patchy moderate snow
    1219: 'snowy', // Moderate snow
    1222: 'snowy', // Patchy heavy snow
    1225: 'snowy', // Heavy snow
    1237: 'snowy', // Ice pellets
    1240: 'rainy', // Light rain shower
    1243: 'rainy', // Moderate or heavy rain shower
    1246: 'rainy', // Torrential rain shower
    1249: 'rainy', // Light sleet showers
    1252: 'rainy', // Moderate or heavy sleet showers
    1255: 'snowy', // Light snow showers
    1258: 'snowy', // Moderate or heavy snow showers
    1261: 'snowy', // Light showers of ice pellets
    1264: 'snowy', // Moderate or heavy showers of ice pellets
    1273: 'stormy', // Patchy light rain with thunder
    1276: 'stormy', // Moderate or heavy rain with thunder
    1279: 'stormy', // Patchy light snow with thunder
    1282: 'stormy', // Moderate or heavy snow with thunder
};

// Function to get our general condition type from WeatherAPI code
const getConditionFromCode = (code: number, isDay: number): WeatherIcon => {
    // Special case for clear night
    if (code === 1000 && !isDay) {
        return 'clear';
    }
    return weatherApiConditionMap[code] || 'cloudy'; // Default fallback
};
// --- End Icon Mapping ---

// --- Function to fetch weather data ---
export const fetchWeatherData = async (
    lat: number,
    lon: number
): Promise<CurrentWeather | null> => {
    if (!WEATHERAPI_API_KEY || WEATHERAPI_API_KEY === "YOUR_WEATHERAPI_KEY") {
        // ... (error handling remains the same) ...
        console.error(
            "WeatherAPI Key is missing. Please add it to .env.local and app.config.js's extra section."
        );
        throw new Error("Missing WeatherAPI Key");
    }

    // --- MODIFICATION: Set aqi=yes ---
    const url = `${WEATHERAPI_FORECAST_URL}?key=${WEATHERAPI_API_KEY}&q=${lat},${lon}&days=7&aqi=yes&alerts=no`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || data.error) {
            // ... (error handling remains the same) ...
            const errorMessage = data.error?.message || `HTTP error! status: ${response.status}`;
            console.error("WeatherAPI Error:", errorMessage, data);
            if (response.status === 401 || response.status === 403) {
                throw new Error("Unauthorized for WeatherAPI: Check API key or subscription.");
            }
            throw new Error(errorMessage);
        }

        const current = data.current;
        const forecast = data.forecast.forecastday;
        const todayForecast = forecast[0];
        const tomorrowForecast = forecast[1]; // Get tomorrow's hourly data too

        // --- ADJUSTED HOURLY FORECAST LOGIC (remains the same) ---
        const nowEpoch = Math.floor(Date.now() / 1000); // Current time in seconds
        const allHours = [
            ...(todayForecast?.hour || []),
            ...(tomorrowForecast?.hour || []) // Combine today's and tomorrow's hours
        ];

        // Find index of the hour closest to or just after the current time
        let currentHourIndex = allHours.findIndex(hour => hour.time_epoch >= nowEpoch);

        // Handle edge case where current time is past the last hour available
        if (currentHourIndex === -1 && allHours.length > 0) {
            currentHourIndex = allHours.length - 1; // Default to the last available hour
        } else if (currentHourIndex === -1) {
            currentHourIndex = 0; // Or default to 0 if allHours is empty
        }

        // Calculate start index: Go back 1 hour from current, but don't go below 0
        const startIndex = Math.max(0, currentHourIndex - 1);
        // Calculate end index: startIndex + 12 hours total
        const endIndex = startIndex + 12;

        const hourlyData: HourlyData[] = allHours
            .slice(startIndex, endIndex) // Extract the 12-hour window
            .map((hour: any): HourlyData => ({
                time: format(fromUnixTime(hour.time_epoch), "h a"), // e.g., "8 PM"
                icon: getConditionFromCode(hour.condition?.code, hour.is_day),
                isDay: hour.is_day === 1,
                temp: Math.round(hour.temp_c),
            }));
        // --- END ADJUSTED HOURLY FORECAST LOGIC ---


        const weatherData: CurrentWeather = {
            location: data.location.name,
            temperature: Math.round(current.temp_c),
            condition: current.condition.text,
            icon: getConditionFromCode(current.condition.code, current.is_day),
            isDay: current.is_day === 1,
            high: Math.round(todayForecast.day.maxtemp_c),
            low: Math.round(todayForecast.day.mintemp_c),
            windSpeed: Math.round(current.wind_kph * 1000 / 3600),
            humidity: current.humidity,
            feelsLike: Math.round(current.feelslike_c),
            timezone: data.location.tz_id,
            uvIndex: current.uv,
            // --- NEW FIELDS ---
            vis_km: current.vis_km,
            airQualityIndex: current.air_quality ? current.air_quality['us-epa-index'] : null,
            // ------------------
            hourly: hourlyData,
            daily: forecast.map((dayData: any): DailyData => {
                const date = parseISO(dayData.date);
                return {
                    day: isToday(date) ? "Today" : format(date, "E"), // Use "Today" for the current day
                    icon: getConditionFromCode(dayData.day.condition.code, 1), // Assume day for forecast icon
                    high: Math.round(dayData.day.maxtemp_c),
                    low: Math.round(dayData.day.mintemp_c),
                };
            }),
        };

        return weatherData;
    } catch (error) {
        // ... (error handling remains the same) ...
        console.error("Failed to fetch weather data:", error);
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error("An unknown error occurred while fetching weather data.");
        }
    }
};
// --- End fetchWeatherData ---


// --- Function to search for cities using OpenCage (remains the same) ---
export const searchCities = async (query: string, limit: number = 5): Promise<GeoLocation[]> => {
    if (!OPENCAGE_API_KEY || OPENCAGE_API_KEY === 'YOUR_OPENCAGE_API_KEY') {
        console.error("OpenCage API Key missing!");
        return [];
    }
    if (!query || query.trim().length < 2) {
        return [];
    }
    const url = `${OPENCAGE_GEOCODING_BASE_URL}?q=${encodeURIComponent(query)}&key=${OPENCAGE_API_KEY}&limit=${limit}&no_annotations=1`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 401 || response.status === 402) {
                console.error("Unauthorized/Quota Exceeded for OpenCage Geocoding API.");
            } else {
                const errorBody = await response.text();
                console.error(`OpenCage Geocoding HTTP error ${response.status}: ${response.statusText}`, errorBody);
            }
            return [];
        }
        const data = await response.json();

        if (data.results && Array.isArray(data.results)) {
            return data.results.map((result: any): GeoLocation => ({
                name: result.components?.city || result.components?.town || result.components?.village || result.components?.county || result.formatted.split(',')[0],
                lat: result.geometry?.lat,
                lon: result.geometry?.lng,
                country: result.components?.country || '',
                state: result.components?.state,
                formatted: result.formatted || '',
            })).filter((loc: GeoLocation) => loc.lat != null && loc.lon != null);
        }
        return [];
    } catch (error) {
        console.error("Failed to search cities via OpenCage:", error);
        return [];
    }
};
// --- End searchCities ---

// --- reverseGeocode (remains the same) ---
export const reverseGeocode = async (lat: number, lon: number): Promise<GeoLocation | null> => {
    if (!OPENCAGE_API_KEY || OPENCAGE_API_KEY === 'YOUR_OPENCAGE_API_KEY') {
        console.error("OpenCage API Key missing for reverse geocoding!");
        return null;
    }

    // OpenCage uses q=lat+lon format for reverse geocoding
    const url = `${OPENCAGE_GEOCODING_BASE_URL}?q=${lat}+${lon}&key=${OPENCAGE_API_KEY}&limit=1&no_annotations=1`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 401 || response.status === 402) {
                console.error("Unauthorized/Quota Exceeded for OpenCage Geocoding API.");
            } else {
                const errorBody = await response.text();
                console.error(`OpenCage Geocoding HTTP error ${response.status}: ${response.statusText}`, errorBody);
            }
            return null;
        }
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const loc: GeoLocation = {
                name: result.components?.city || result.components?.town || result.components?.village || result.components?.county || result.formatted.split(',')[0],
                lat: result.geometry?.lat,
                lon: result.geometry?.lng,
                country: result.components?.country || '',
                state: result.components?.state,
                formatted: result.formatted || '',
            };
            // Only return if we have a valid location
            if (loc.lat != null && loc.lon != null) {
                return loc;
            }
        }
        return null;
    } catch (error) {
        console.error("Failed to reverse geocode via OpenCage:", error);
        return null;
    }
}


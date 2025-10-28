// app/services/weatherService.ts
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
export const fetchWeatherData = async (lat: number, lon: number): Promise<CurrentWeather | null> => {
    if (!WEATHERAPI_API_KEY || WEATHERAPI_API_KEY === 'YOUR_WEATHERAPI_API_KEY') {
        console.error("WeatherAPI.com API Key missing!");
        return null;
    }
    const url = `${WEATHERAPI_FORECAST_URL}?key=${WEATHERAPI_API_KEY}&q=${lat},${lon}&days=7&aqi=no&alerts=no`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            // ... (error handling as before) ...
            return null;
        }
        const data = await response.json();
        if (!data || !data.current || !data.forecast || !data.forecast.forecastday) {
            console.error("WeatherAPI response missing expected data structure");
            return null;
        }

        const currentHour = new Date().getHours();

        // Get initial condition from API code
        let iconCondition = getConditionFromCode(data.current.condition?.code, data.current.is_day);
        const windSpeedMs = Math.round(data.current.wind_kph / 3.6);

        // If wind is strong (>10 m/s), override the icon, unless there's a more severe condition.
        if (windSpeedMs > 10 && iconCondition !== 'stormy' && iconCondition !== 'rainy' && iconCondition !== 'snowy') {
            iconCondition = 'windy';
        }

        const transformedData: CurrentWeather = {
            location: data.location?.name || 'Current Location',
            temperature: Math.round(data.current.temp_c),
            condition: data.current.condition?.text || 'N/A',
            // Store the general condition type and isDay flag
            icon: iconCondition,
            isDay: data.current.is_day === 1, // Store isDay flag for current weather
            // -----
            high: data.forecast.forecastday[0]?.day ? Math.round(data.forecast.forecastday[0].day.maxtemp_c) : 0,
            timezone: data.location.tz_id, // Add the timezone
            low: data.forecast.forecastday[0]?.day ? Math.round(data.forecast.forecastday[0].day.mintemp_c) : 0,
            windSpeed: windSpeedMs,
            humidity: data.current.humidity,
            feelsLike: Math.round(data.current.feelslike_c), // Add feelsLike temperature
            uvIndex: Math.round(data.current.uv),
            hourly: data.forecast.forecastday[0]?.hour
                ?.filter((hour: any) => new Date(hour.time_epoch * 1000).getHours() >= currentHour)
                .slice(0, 9)
                .map((hour: any) => ({
                    time: new Date(hour.time_epoch * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true }),
                    // Store general condition and isDay for hourly
                    icon: getConditionFromCode(hour.condition?.code, hour.is_day),
                    isDay: hour.is_day === 1, // Store isDay flag for hourly forecast
                    // -----
                    temp: Math.round(hour.temp_c),
                })) || [],
            daily: data.forecast.forecastday.slice(0, 7).map((dayEntry: any) => ({
                day: new Date(dayEntry.date_epoch * 1000).toLocaleDateString([], { weekday: 'short' }),
                // Store general condition, assume day for daily icon choice
                icon: getConditionFromCode(dayEntry.day.condition?.code, 1),
                // -----
                high: Math.round(dayEntry.day.maxtemp_c),
                low: Math.round(dayEntry.day.mintemp_c),
            })),
        };
        return transformedData;

    } catch (error) {
        console.error("Failed to fetch weather data from WeatherAPI:", error);
        return null;
    }
};
// --- End fetchWeatherData ---


// --- Function to search for cities using OpenCage (keep as is) ---
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

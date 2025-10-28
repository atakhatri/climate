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
const weatherApiIconMap: { [code: number]: { condition: WeatherIcon, ioniconDay: any, ioniconNight: any } } = {
    1000: { condition: 'sunny', ioniconDay: 'sunny', ioniconNight: 'moon' }, // Sunny / Clear
    1003: { condition: 'partly cloudy', ioniconDay: 'partly-sunny', ioniconNight: 'cloudy-night' }, // Partly cloudy
    1006: { condition: 'cloudy', ioniconDay: 'cloudy', ioniconNight: 'cloudy' }, // Cloudy
    1009: { condition: 'cloudy', ioniconDay: 'cloudy', ioniconNight: 'cloudy' }, // Overcast
    1030: { condition: 'cloudy', ioniconDay: 'cloudy', ioniconNight: 'cloudy' }, // Mist (treat as cloudy)
    1063: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Patchy light rain
    1066: { condition: 'snowy', ioniconDay: 'snow', ioniconNight: 'snow' },    // Patchy snow
    1069: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Patchy sleet
    1072: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Patchy freezing drizzle
    1087: { condition: 'stormy', ioniconDay: 'thunderstorm', ioniconNight: 'thunderstorm' }, // Thundery outbreaks possible
    1114: { condition: 'snowy', ioniconDay: 'snow', ioniconNight: 'snow' },    // Blowing snow
    1117: { condition: 'snowy', ioniconDay: 'snow', ioniconNight: 'snow' },    // Blizzard
    1135: { condition: 'cloudy', ioniconDay: 'cloudy', ioniconNight: 'cloudy' }, // Fog
    1147: { condition: 'cloudy', ioniconDay: 'cloudy', ioniconNight: 'cloudy' }, // Freezing fog
    1150: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Patchy light drizzle
    1153: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Light drizzle
    1168: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Freezing drizzle
    1171: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Heavy freezing drizzle
    1180: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Patchy light rain
    1183: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Light rain
    1186: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Moderate rain at times
    1189: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Moderate rain
    1192: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Heavy rain at times
    1195: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Heavy rain
    1198: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Light freezing rain
    1201: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Moderate or heavy freezing rain
    1204: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Light sleet
    1207: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Moderate or heavy sleet
    1210: { condition: 'snowy', ioniconDay: 'snow', ioniconNight: 'snow' },    // Patchy light snow
    1213: { condition: 'snowy', ioniconDay: 'snow', ioniconNight: 'snow' },    // Light snow
    1216: { condition: 'snowy', ioniconDay: 'snow', ioniconNight: 'snow' },    // Patchy moderate snow
    1219: { condition: 'snowy', ioniconDay: 'snow', ioniconNight: 'snow' },    // Moderate snow
    1222: { condition: 'snowy', ioniconDay: 'snow', ioniconNight: 'snow' },    // Patchy heavy snow
    1225: { condition: 'snowy', ioniconDay: 'snow', ioniconNight: 'snow' },    // Heavy snow
    1237: { condition: 'snowy', ioniconDay: 'snow', ioniconNight: 'snow' },    // Ice pellets
    1240: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Light rain shower
    1243: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Moderate or heavy rain shower
    1246: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Torrential rain shower
    1249: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Light sleet showers
    1252: { condition: 'rainy', ioniconDay: 'rainy', ioniconNight: 'rainy' }, // Moderate or heavy sleet showers
    1255: { condition: 'snowy', ioniconDay: 'snow', ioniconNight: 'snow' },    // Light snow showers
    1258: { condition: 'snowy', ioniconDay: 'snow', ioniconNight: 'snow' },    // Moderate or heavy snow showers
    1261: { condition: 'snowy', ioniconDay: 'snow', ioniconNight: 'snow' },    // Light showers of ice pellets
    1264: { condition: 'snowy', ioniconDay: 'snow', ioniconNight: 'snow' },    // Moderate or heavy showers of ice pellets
    1273: { condition: 'stormy', ioniconDay: 'thunderstorm', ioniconNight: 'thunderstorm' }, // Patchy light rain with thunder
    1276: { condition: 'stormy', ioniconDay: 'thunderstorm', ioniconNight: 'thunderstorm' }, // Moderate or heavy rain with thunder
    1279: { condition: 'stormy', ioniconDay: 'thunderstorm', ioniconNight: 'thunderstorm' }, // Patchy light snow with thunder
    1282: { condition: 'stormy', ioniconDay: 'thunderstorm', ioniconNight: 'thunderstorm' }, // Moderate or heavy snow with thunder
};

// Function to get our condition type and ionicon based on WeatherAPI code and is_day flag
const getMappedWeatherApiIcon = (code: number, isDay: number): { condition: WeatherIcon, ionicon: any } => {
    const mapping = weatherApiIconMap[code];
    if (!mapping) {
        return { condition: 'cloudy', ionicon: 'cloud' }; // Default fallback
    }
    return {
        condition: mapping.condition,
        ionicon: isDay ? mapping.ioniconDay : mapping.ioniconNight
    };
};
// --- End Icon Mapping ---

// --- UPDATED: Function to fetch weather data using WeatherAPI.com ---
export const fetchWeatherData = async (lat: number, lon: number): Promise<CurrentWeather | null> => {
    if (!WEATHERAPI_API_KEY || WEATHERAPI_API_KEY === 'YOUR_WEATHERAPI_API_KEY') {
        console.error("WeatherAPI.com API Key missing!");
        return null;
    }
    // WeatherAPI uses q=lat,lon format and specifies forecast days (we need 7 for daily)
    const url = `${WEATHERAPI_FORECAST_URL}?key=${WEATHERAPI_API_KEY}&q=${lat},${lon}&days=7&aqi=no&alerts=no`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.json(); // WeatherAPI often returns JSON error details
            console.error(`WeatherAPI HTTP error ${response.status}: ${response.statusText}`, errorBody?.error?.message || errorBody);
            if (response.status === 401 || response.status === 403) { // 403 Forbidden also possible
                console.error("Unauthorized/Forbidden for WeatherAPI: Check your API key and plan.");
            }
            return null;
        }
        const data = await response.json();

        // --- Data Transformation for WeatherAPI.com response ---
        if (!data || !data.current || !data.forecast || !data.forecast.forecastday) {
            console.error("WeatherAPI response missing expected data structure");
            return null;
        }

        const currentHour = new Date().getHours(); // Get current hour for filtering hourly forecast

        const transformedData: CurrentWeather = {
            location: data.location?.name || 'Current Location', // Use name from location object
            temperature: Math.round(data.current.temp_c), // Use temp_c for Celsius
            condition: data.current.condition?.text || 'N/A',
            icon: getMappedWeatherApiIcon(data.current.condition?.code, data.current.is_day).condition,
            high: data.forecast.forecastday[0]?.day ? Math.round(data.forecast.forecastday[0].day.maxtemp_c) : 0,
            low: data.forecast.forecastday[0]?.day ? Math.round(data.forecast.forecastday[0].day.mintemp_c) : 0,
            windSpeed: Math.round(data.current.wind_kph / 3.6), // Convert kph to m/s approx
            humidity: data.current.humidity,
            uvIndex: Math.round(data.current.uv),
            hourly: data.forecast.forecastday[0]?.hour // Get hours for today
                ?.filter((hour: any) => new Date(hour.time_epoch * 1000).getHours() >= currentHour) // Filter from current hour onwards
                .slice(0, 9) // Take the next 9 hours max
                .map((hour: any) => ({
                    time: new Date(hour.time_epoch * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true }),
                    icon: getMappedWeatherApiIcon(hour.condition?.code, hour.is_day).condition,
                    temp: Math.round(hour.temp_c),
                })) || [], // Provide default empty array
            daily: data.forecast.forecastday.slice(0, 7).map((dayEntry: any) => ({
                day: new Date(dayEntry.date_epoch * 1000).toLocaleDateString([], { weekday: 'short' }),
                icon: getMappedWeatherApiIcon(dayEntry.day.condition?.code, 1).condition, // Assume day icon for daily forecast
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


// --- UPDATED: Function to get Ionicon name using WeatherAPI mapping ---
export const getIconNameFromCondition = (condition: WeatherIcon, isDay: number = 1): any => { // Default to day
    // Find the first matching code based on our simplified condition string
    const codeEntry = Object.entries(weatherApiIconMap).find(([code, map]) => map.condition === condition);

    if (!codeEntry) {
        return 'cloud'; // Default fallback if no match found
    }

    const mapping = codeEntry[1]; // The { condition, ioniconDay, ioniconNight } object
    return isDay ? mapping.ioniconDay : mapping.ioniconNight;
};
// --- End getIconNameFromCondition ---


// app/services/weatherService.ts
import Constants from 'expo-constants';
import { CurrentWeather, WeatherIcon } from '../utils/types';

// IMPORTANT: Replace 'YOUR_OPENWEATHERMAP_API_KEY' with your actual key
// It's best practice to store API keys in environment variables
// For Expo, you can use expo-constants: https://docs.expo.dev/guides/environment-variables/
const API_KEY = Constants.expoConfig?.extra?.openWeatherApiKey || '5f69f71a5597be4cc9672e30afb2199d'; // Replace with your key or use env var
const BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall';

// Mapping OpenWeatherMap icon codes to our WeatherIcon type and Ionicons names
// See: https://openweathermap.org/weather-conditions
const iconMap: { [key: string]: { condition: WeatherIcon, ionicon: any } } = {
    '01d': { condition: 'sunny', ionicon: 'sunny' },         // clear sky day
    '01n': { condition: 'clear', ionicon: 'moon' },          // clear sky night
    '02d': { condition: 'partly cloudy', ionicon: 'partly-sunny' }, // few clouds day
    '02n': { condition: 'partly cloudy', ionicon: 'cloudy-night' }, // few clouds night
    '03d': { condition: 'cloudy', ionicon: 'cloud' },        // scattered clouds day
    '03n': { condition: 'cloudy', ionicon: 'cloud' },        // scattered clouds night
    '04d': { condition: 'cloudy', ionicon: 'cloudy' },       // broken clouds day
    '04n': { condition: 'cloudy', ionicon: 'cloudy' },       // broken clouds night
    '09d': { condition: 'rainy', ionicon: 'rainy' },         // shower rain day
    '09n': { condition: 'rainy', ionicon: 'rainy' },         // shower rain night
    '10d': { condition: 'rainy', ionicon: 'rainy' },         // rain day
    '10n': { condition: 'rainy', ionicon: 'rainy' },         // rain night
    '11d': { condition: 'stormy', ionicon: 'thunderstorm' }, // thunderstorm day
    '11n': { condition: 'stormy', ionicon: 'thunderstorm' }, // thunderstorm night
    '13d': { condition: 'snowy', ionicon: 'snow' },          // snow day
    '13n': { condition: 'snowy', ionicon: 'snow' },          // snow night
    '50d': { condition: 'cloudy', ionicon: 'cloudy' },       // mist day (using cloudy)
    '50n': { condition: 'cloudy', ionicon: 'cloudy' },       // mist night (using cloudy)
    // Add windy based on wind speed later if needed, API doesn't have a direct windy icon
};

const getMappedIcon = (iconCode: string): { condition: WeatherIcon, ionicon: any } => {
    return iconMap[iconCode] || { condition: 'cloudy', ionicon: 'cloud' }; // Default fallback
};


// Function to fetch weather data
export const fetchWeatherData = async (lat: number, lon: number): Promise<CurrentWeather | null> => {
    // Check if the API key is still the placeholder
    if (!API_KEY || API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
        console.error("API Key missing! Please replace 'YOUR_OPENWEATHERMAP_API_KEY' in app/services/weatherService.ts with your actual OpenWeatherMap API key.");
        // Optionally, throw an error or return null to prevent API call
        // throw new Error("OpenWeatherMap API Key is not configured.");
        return null; // Prevent API call without a key
    }

    const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&exclude=minutely,alerts`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            // Log more details for debugging
            const errorBody = await response.text();
            console.error(`HTTP error ${response.status}: ${response.statusText}`, errorBody);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // --- Data Transformation ---
        const transformedData: CurrentWeather = {
            location: data.timezone || 'Current Location', // API doesn't give city name here, might need reverse geocoding
            temperature: Math.round(data.current.temp),
            condition: data.current.weather[0]?.main || 'N/A',
            icon: getMappedIcon(data.current.weather[0]?.icon).condition,
            high: data.daily[0] ? Math.round(data.daily[0].temp.max) : 0, // Today's high from daily forecast
            low: data.daily[0] ? Math.round(data.daily[0].temp.min) : 0, // Today's low from daily forecast
            windSpeed: Math.round(data.current.wind_speed),
            humidity: data.current.humidity,
            uvIndex: Math.round(data.current.uvi),
            hourly: data.hourly.slice(0, 9).map((hour: any) => ({ // Take next 9 hours
                time: new Date(hour.dt * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true }),
                icon: getMappedIcon(hour.weather[0]?.icon).condition,
                temp: Math.round(hour.temp),
            })),
            daily: data.daily.slice(0, 7).map((day: any) => ({ // Take next 7 days
                day: new Date(day.dt * 1000).toLocaleDateString([], { weekday: 'short' }),
                icon: getMappedIcon(day.weather[0]?.icon).condition,
                high: Math.round(day.temp.max),
                low: Math.round(day.temp.min),
            })),
        };

        return transformedData;

    } catch (error) {
        console.error("Failed to fetch weather data:", error);
        return null;
    }
};

// Function to get Ionicon name from our WeatherIcon type
export const getIconNameFromCondition = (condition: WeatherIcon): any => {
    // Find the entry in iconMap that matches the condition
    const entry = Object.values(iconMap).find(val => val.condition === condition);
    return entry ? entry.ionicon : 'cloud'; // Default fallback
};

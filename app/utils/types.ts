// utils/types.ts

// Keep WeatherIcon as is
export type WeatherIcon = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'stormy' | 'snowy' | 'clear' | 'partly cloudy';

export interface HourlyData {
    time: string;
    icon: WeatherIcon; // The general condition type
    isDay?: boolean;    // Add isDay flag
    temp: number;
}

export interface DailyData {
    day: string;
    icon: WeatherIcon; // The general condition type
    // isDay is not typically needed for daily, we usually show a 'day' icon
    high: number;
    low: number;
}

export interface CurrentWeather {
    location: string;
    temperature: number;
    condition: string; // The text description from API
    icon: WeatherIcon; // The general condition type
    isDay?: boolean;    // Add isDay flag
    high: number;
    low: number;
    windSpeed: number;
    humidity: number;
    uvIndex: number;
    hourly: HourlyData[];
    daily: DailyData[];
    feelsLike: number; // Add feelsLike temperature
    timezone: string; // Add timezone identifier (e.g., "America/New_York")
}

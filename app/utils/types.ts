// utils/types.ts

export type WeatherIcon = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'stormy' | 'snowy' | 'clear' | 'partly cloudy';

export interface HourlyData {
    time: string; // e.g., "1 PM"
    icon: WeatherIcon;
    temp: number;
}

export interface DailyData {
    day: string; // e.g., "Mon"
    icon: WeatherIcon;
    high: number;
    low: number;
}

export interface CurrentWeather {
    location: string;
    temperature: number;
    condition: string;
    icon: WeatherIcon;
    high: number;
    low: number;
    windSpeed: number; // m/s
    humidity: number; // %
    uvIndex: number;
    hourly: HourlyData[];
    daily: DailyData[];
}

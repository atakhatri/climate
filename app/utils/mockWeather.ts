import { CurrentWeather } from './types';

export const MOCK_WEATHER_DATA: CurrentWeather = {
    location: 'Vadodara, India',
    temperature: 29,
    condition: 'Partly Cloudy',
    icon: 'sunny', // Use the new type
    high: 34,
    low: 21,
    windSpeed: 8,
    humidity: 55,
    uvIndex: 7,
    hourly: [
        { time: '1 PM', icon: 'sunny', temp: 30 },
        { time: '2 PM', icon: 'cloudy', temp: 31 },
        { time: '3 PM', icon: 'cloudy', temp: 30 },
        { time: '4 PM', icon: 'windy', temp: 29 },
        { time: '5 PM', icon: 'windy', temp: 28 },
        { time: '6 PM', icon: 'cloudy', temp: 26 },
        { time: '7 PM', icon: 'cloudy', temp: 24 },
        { time: '8 PM', icon: 'rainy', temp: 23 },
        { time: '9 PM', icon: 'rainy', temp: 22 },
    ],
    daily: [
        { day: 'Mon', icon: 'cloudy', high: 32, low: 20 },
        { day: 'Tue', icon: 'sunny', high: 34, low: 21 },
        { day: 'Wed', icon: 'stormy', high: 28, low: 18 },
        { day: 'Thu', icon: 'rainy', high: 25, low: 17 },
        { day: 'Fri', icon: 'sunny', high: 33, low: 20 },
        { day: 'Sat', icon: 'sunny', high: 35, low: 21 },
        { day: 'Sun', icon: 'cloudy', high: 31, low: 19 },
    ],
};

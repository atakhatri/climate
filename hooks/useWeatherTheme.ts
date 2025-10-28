import { useMemo } from 'react';
import { WeatherIcon } from '../app/utils/types';
import { COLORS } from '../styles/theme';

// Define a type for the theme to ensure consistency
interface WeatherTheme {
    primaryColor: string;
    secondaryColor: string;
    iconTint: string;
    textColor: string; // Add textColor property
    backgroundGradient: [string, string]; // Array of two color strings
}

/**
 * Returns thematic colors and gradients based on the weather condition (mocked for now).
 * This abstracts the logic for dynamic and beautiful backgrounds.
 */
export const useWeatherTheme = (
    condition: WeatherIcon,
    isDay: boolean = true
): WeatherTheme => {
    return useMemo(() => {
        switch (condition) {
            case 'sunny': // Inherently day
                return {
                    primaryColor: COLORS.blueDark,
                    secondaryColor: COLORS.blueLight,
                    iconTint: COLORS.yellow, // Yellow for sun
                    textColor: COLORS.white, // White text on blue background
                    // Bright, clear day gradient
                    backgroundGradient: ['#3A84FF', '#6DD5FA'],
                };
            case 'clear': // Inherently night (based on our weatherService logic)
                return {
                    primaryColor: COLORS.indigo,
                    secondaryColor: '#26D0CE',
                    iconTint: COLORS.white, // Pale yellow for moon/stars
                    textColor: COLORS.white, // White text on dark background
                    // Deep, clear night gradient
                    backgroundGradient: ['#141E30', '#243B55'],
                };
            case 'partly cloudy':
            case 'cloudy':
                if (isDay) {
                    return {
                        primaryColor: '#5B7E9F', // Gray-Blue
                        secondaryColor: COLORS.gray,
                        iconTint: COLORS.white,
                        textColor: COLORS.textDark, // Dark text on light gray background
                        // Overcast/Partly Cloudy day gradient
                        backgroundGradient: ['#B0C4DE', '#F0F8FF'], // Light Steel Blue to Alice Blue
                    };
                } else {
                    // Cloudy Night
                    return {
                        primaryColor: '#3E5151',
                        secondaryColor: '#3E5151',
                        iconTint: COLORS.white,
                        textColor: COLORS.white,
                        // Dark, moody cloudy night
                        backgroundGradient: ['#3E5151', '#1A2929'], // Dark slate gray gradient
                    };
                }
            case 'rainy':
            case 'stormy':
                if (isDay) {
                    return {
                        primaryColor: '#617A9A', // Slate gray-blue
                        secondaryColor: COLORS.slate,
                        iconTint: COLORS.white,
                        textColor: COLORS.white,
                        // Gloomy, rainy day
                        backgroundGradient: ['#617A9A', '#A3B4C8'],
                    };
                } else {
                    // Rainy/Stormy Night
                    return {
                        primaryColor: COLORS.indigo,
                        secondaryColor: COLORS.slate,
                        iconTint: COLORS.white,
                        textColor: COLORS.white, // White text on dark background
                        // Dark rainy/stormy night gradient
                        backgroundGradient: ['#2c3e50', '#182848'],
                    };
                }
            case 'snowy':
                return {
                    primaryColor: COLORS.white,
                    secondaryColor: '#B0D9E6',
                    iconTint: COLORS.blueDark,
                    textColor: COLORS.textDark, // Dark text on light background
                    // Snowy/Winter gradient
                    backgroundGradient: ['#E6E9F0', '#B0D9E6'],
                };
            case 'windy':
                return {
                    primaryColor: '#5B7E9F',
                    secondaryColor: COLORS.gray,
                    iconTint: COLORS.white, // Keep icon white for contrast
                    textColor: COLORS.white, // White text on blue background
                    // Gray-blue gradient for windy conditions
                    backgroundGradient: ['#A7BFE8', '#6190E8'], // Lighter blue to a deeper blue
                };
            default:
                // Use a safe, guaranteed array of two colors for the default/fallback case
                return {
                    primaryColor: COLORS.blueDark,
                    secondaryColor: COLORS.blueLight,
                    iconTint: COLORS.yellow,
                    textColor: COLORS.white,
                    backgroundGradient: ['#3A84FF', '#6DD5FA'],
                };
        }
    }, [condition, isDay]);
};

import { useMemo } from 'react';
import { WeatherIcon } from '../app/utils/types';
import { COLORS } from '../styles/theme';

// Define a type for the theme to ensure consistency
interface WeatherTheme {
    primaryColor: string;
    secondaryColor: string;
    iconTint: string;
    backgroundGradient: [string, string]; // Array of two color strings
}

/**
 * Returns thematic colors and gradients based on the weather condition (mocked for now).
 * This abstracts the logic for dynamic and beautiful backgrounds.
 */
export const useWeatherTheme = (condition: WeatherIcon): WeatherTheme => {
    return useMemo(() => {
        switch (condition) {
            case 'sunny':
                return {
                    primaryColor: COLORS.blueDark,
                    secondaryColor: COLORS.blueLight,
                    iconTint: COLORS.yellow, // Yellow for sun
                    // Bright, clear day gradient
                    backgroundGradient: ['#3A84FF', '#6DD5FA'],
                };
            case 'clear': // Typically clear night (using a dark theme)
                return {
                    primaryColor: COLORS.indigo,
                    secondaryColor: '#26D0CE',
                    iconTint: COLORS.white, // Pale yellow for moon/stars
                    // Deep, clear night gradient
                    backgroundGradient: ['#141E30', '#243B55'],
                };
            case 'partly cloudy':
            case 'cloudy':
                return {
                    primaryColor: '#5B7E9F', // Gray-Blue
                    secondaryColor: COLORS.gray,
                    iconTint: COLORS.white,
                    // Overcast/Partly Cloudy gradient
                    backgroundGradient: ['#8E9EAB', '#D7D2CC'],
                };
            case 'rainy':
            case 'stormy':
                return {
                    primaryColor: COLORS.indigo,
                    secondaryColor: COLORS.slate,
                    iconTint: COLORS.white,
                    // Rainy/Stormy gradient
                    backgroundGradient: ['#4b6cb7', '#182848'],
                };
            case 'snowy':
                return {
                    primaryColor: COLORS.white,
                    secondaryColor: '#B0D9E6',
                    iconTint: COLORS.blueDark,
                    // Snowy/Winter gradient
                    backgroundGradient: ['#E6E9F0', '#B0D9E6'],
                };
            case 'windy':
                return {
                    primaryColor: '#5B7E9F',
                    secondaryColor: COLORS.gray,
                    iconTint: COLORS.white,
                    // Windy/Dusty conditions gradient
                    backgroundGradient: ['#6D6027', '#D3CBB8'],
                };
            default:
                // Use a safe, guaranteed array of two colors for the default/fallback case
                return {
                    primaryColor: COLORS.blueDark,
                    secondaryColor: COLORS.blueLight,
                    iconTint: COLORS.yellow,
                    backgroundGradient: ['#3A84FF', '#6DD5FA'],
                };
        }
    }, [condition]);
};

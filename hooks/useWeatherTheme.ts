import { useMemo } from 'react';
import { WeatherIcon } from '../app/utils/types';
import { COLORS } from '../styles/theme';

interface WeatherTheme {
    primaryColor: string;
    secondaryColor: string;
    iconTint: string;
    backgroundGradient: [string, string];
}

/**
 * Returns thematic colors based on weather condition and time of day (mocked for now).
 * This abstracts the logic for dynamic and beautiful backgrounds.
 */
export const useWeatherTheme = (condition: WeatherIcon): WeatherTheme => {
    return useMemo(() => {
        switch (condition) {
            case 'sunny':
                return {
                    primaryColor: COLORS.blueDark,
                    secondaryColor: COLORS.blueLight,
                    iconTint: '#FFC700', // Yellow
                    backgroundGradient: [COLORS.blueDark, COLORS.blueLight],
                };
            case 'clear':
                return {
                    primaryColor: '#1A2980', // Deep Night Blue
                    secondaryColor: '#26D0CE', // Teal/Cyan
                    iconTint: '#FFEE99', // Pale yellow for moon/stars
                    backgroundGradient: ['#1A2980', '#26D0CE'],
                };
            case 'partly cloudy':
            case 'cloudy':
                return {
                    primaryColor: '#5B7E9F', // Gray-Blue
                    secondaryColor: COLORS.gray,
                    iconTint: COLORS.white,
                    backgroundGradient: ['#5B7E9F', '#B3BDC8'],
                };
            case 'rainy':
            case 'stormy':
                return {
                    primaryColor: COLORS.indigo, // Dark Indigo
                    secondaryColor: COLORS.slate,
                    iconTint: COLORS.white,
                    backgroundGradient: [COLORS.indigo, COLORS.slate],
                };
            case 'snowy':
                return {
                    primaryColor: '#B0D9E6', // Light Blue
                    secondaryColor: COLORS.white,
                    iconTint: '#FFFFFF',
                    backgroundGradient: ['#B0D9E6', COLORS.white],
                };
            case 'windy':
                return {
                    primaryColor: '#5B7E9F',
                    secondaryColor: COLORS.gray,
                    iconTint: COLORS.white,
                    backgroundGradient: ['#5B7E9F', '#B3BDC8'],
                };
            default:
                return {
                    primaryColor: COLORS.blueDark,
                    secondaryColor: COLORS.blueLight,
                    iconTint: '#FFC700',
                    backgroundGradient: [COLORS.blueDark, COLORS.blueLight],
                };
        }
    }, [condition]);
};

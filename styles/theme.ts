// styles/theme.ts

import { DarkTheme, DefaultTheme } from '@react-navigation/native';

// --- Color Palette ---
export const COLORS = {
    blueDark: '#4A90E2',
    blueLight: '#50E3C2',
    indigo: '#424874',
    slate: '#7D9D9C',
    gray: '#B3BDC8',
    white: '#FFFFFF',
    black: '#000000',
    textLight: '#FFFFFF',
    textDark: '#000000',
    yellow: '#FFFF00',
    // Navigation Tabs
    tabActiveTint: '#0A84FF', // A vibrant blue for active elements
    tabInactiveTint: '#8E8E93',
    tabBackgroundLight: '#F0F0F0',
    tabBackgroundDark: '#1E1E1E',
};

// --- Spacing Constants ---
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
};

// --- Custom Theme Objects (Optional for React Navigation integration) ---
export const LightAppTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: COLORS.white,
        text: COLORS.black,
        primary: COLORS.tabActiveTint,
    }
}

export const DarkAppTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: COLORS.black,
        text: COLORS.white,
        primary: COLORS.tabActiveTint,
    }
}

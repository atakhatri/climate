import React, { createContext, useContext } from "react";
import { SharedValue, useSharedValue } from "react-native-reanimated";

/**
 * This context provides a shared value for the scroll position (scrollY)
 * so that components outside of the scroll view (like the tab bar) can react to scrolling.
 */
interface ScrollContextType {
  scrollY: SharedValue<number>;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

/**
 * Hook to easily access the scroll context.
 */
export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScroll must be used within a ScrollProvider");
  }
  return context;
};

/**
 * Provider component that holds the shared scrollY value.
 * Wrap your layout (e.g., Tabs) with this provider.
 */
export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const scrollY = useSharedValue(0);

  return (
    <ScrollContext.Provider value={{ scrollY }}>
      {children}
    </ScrollContext.Provider>
  );
};

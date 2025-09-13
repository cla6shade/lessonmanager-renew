"use client";

import { Location } from "@/generated/prisma";
import { createContext, useState, ReactNode, use } from "react";

interface NavigationContextType {
  locations: Location[];
  selectedLocation: Location;
  setSelectedLocation: (location: Location) => void;
  isAdmin: boolean;
  userId?: number;
  teacherId?: number;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

interface NavigationProviderProps {
  children: ReactNode;
  locations: Location[];
  isAdmin: boolean;
  initialLocation: Location;
  userId?: number;
  teacherId?: number;
}

export function NavigationProvider({
  children,
  locations,
  isAdmin,
  initialLocation,
  userId,
  teacherId,
}: NavigationProviderProps) {
  const [selectedLocation, setSelectedLocation] =
    useState<Location>(initialLocation);

  const handleSetSelectedLocation = (location: Location) => {
    if (!isAdmin) {
      console.warn("Location selection is only available for admin users");
      return;
    }
    setSelectedLocation(location);
  };

  const value: NavigationContextType = {
    locations,
    selectedLocation,
    setSelectedLocation: handleSetSelectedLocation,
    isAdmin,
    userId,
    teacherId,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext() {
  const context = use(NavigationContext);
  if (context === undefined) {
    throw new Error(
      "useNavigationContext must be used within a NavigationProvider"
    );
  }
  return context;
}

export function useNavigation() {
  const {
    locations,
    selectedLocation,
    setSelectedLocation,
    isAdmin,
    userId,
    teacherId,
  } = useNavigationContext();
  return {
    locations,
    selectedLocation,
    setSelectedLocation,
    isAdmin,
    userId,
    teacherId,
  };
}

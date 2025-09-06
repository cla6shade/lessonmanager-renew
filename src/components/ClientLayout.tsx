"use client";

import { NavigationProvider } from "@/features/navigation/location/NavigationContext";
import Navbar from "@/features/navigation/Navbar";
import { Location } from "@/generated/prisma";
import { Box, ChakraProvider, defaultSystem } from "@chakra-ui/react";

interface ClientLayoutProps {
  children: React.ReactNode;
  locations: Location[];
  isAdmin: boolean;
  locationId: number;
}

export default function ClientLayout({
  children,
  locations,
  isAdmin,
  locationId,
}: ClientLayoutProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <NavigationProvider
        locations={locations}
        isAdmin={isAdmin}
        initialLocation={locations.find(
          (location) => location.id === locationId
        )}
      >
        <Box display="flex">
          <Navbar />
          <Box flex={1} h="100dvh" boxSizing="border-box">
            {children}
          </Box>
        </Box>
      </NavigationProvider>
    </ChakraProvider>
  );
}

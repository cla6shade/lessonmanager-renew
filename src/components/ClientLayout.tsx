"use client";

import { NavigationProvider } from "@/features/navigation/provider/NavigationContext";
import Navbar from "@/features/navigation/navbar/Navbar";
import { Location, Major } from "@/generated/prisma";
import { Box, ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from 'react';

interface ClientLayoutProps {
  children: ReactNode;
  locations: Location[];
  majors: Major[];
  isAdmin: boolean;
  locationId: number;
  userId?: number;
  teacherId?: number;
}

export default function ClientLayout({
  children,
  locations,
  majors,
  isAdmin,
  locationId,
  userId,
  teacherId,
}: ClientLayoutProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <NavigationProvider
        locations={locations}
        majors={majors}
        isAdmin={isAdmin}
        initialLocation={
          locations.find((location) => location.id === locationId)!
        }
        userId={userId}
        teacherId={teacherId}
      >
        <Box display="flex">
          <Navbar />
          <Box flex={1} h="100dvh" boxSizing="border-box">
            {children}
          </Box>
        </Box>
      </NavigationProvider>
      <Toaster />
    </ChakraProvider>
  );
}

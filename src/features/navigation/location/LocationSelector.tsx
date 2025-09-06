import { Button, Separator, Stack, Text } from "@chakra-ui/react";
import { useNavigation } from "./NavigationContext";
import colors from "@/brand/colors";

export default function LocationSelector() {
  const { isAdmin, setSelectedLocation, locations, selectedLocation } =
    useNavigation();
  const handleLocationChange = (location: any) => {
    if (isAdmin) {
      setSelectedLocation(location);
    }
  };
  return (
    isAdmin &&
    locations.length > 0 && (
      <>
        <Stack gap={2}>
          {locations.map((location) => (
            <Button
              key={location.id}
              variant="ghost"
              justifyContent="flex-start"
              onClick={() => handleLocationChange(location)}
              size="sm"
              fontWeight={
                selectedLocation?.id === location.id ? "bold" : "normal"
              }
              color={
                selectedLocation?.id === location.id ? colors.brand : "gray.300"
              }
              _hover={{ bg: colors.brandPanelDark }}
            >
              {location.name}
            </Button>
          ))}
        </Stack>
        <Separator opacity={0.3} />
      </>
    )
  );
}

import { Button, Separator, Stack } from '@chakra-ui/react';
import { useNavigation } from '../provider/NavigationContext';
import colors from '@/brand/colors';
import { Location } from '@/generated/prisma';

export default function LocationSelector() {
  const { isAdmin, setSelectedLocation, locations, selectedLocation } = useNavigation();
  const handleLocationChange = (location: Location) => {
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
              fontWeight={selectedLocation?.id === location.id ? 'bold' : 'normal'}
              color={selectedLocation?.id === location.id ? colors.brand : 'gray.300'}
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

import { Text, Box, Popover, Portal, Flex, Button, VStack } from '@chakra-ui/react';
import { ChevronDown, MapPin } from 'lucide-react';
import { useState } from 'react';

interface Location {
  id: number;
  name: string;
}

interface LocationSelectorProps {
  locations: Location[];
  selectedLocationId: number;
  onLocationSelect: (locationId: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function LocationSelector({
  locations,
  selectedLocationId,
  onLocationSelect,
  placeholder = '지점을 선택하세요',
  disabled = false,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLocation = locations.find((loc) => loc.id === selectedLocationId);
  const displayLocationName = selectedLocation?.name || placeholder;

  const handleLocationSelect = (locationId: number) => {
    onLocationSelect(locationId);
    setIsOpen(false);
  };

  return (
    <Box bg="white" borderRadius="md" border="1px" borderColor="gray.200" width="100%">
      <Popover.Root
        open={isOpen}
        onOpenChange={({ open }) => setIsOpen(open)}
        positioning={{ placement: 'bottom' }}
      >
        <Popover.Trigger>
          <Box
            border="1px solid"
            borderColor="gray.300"
            px={3}
            py={2}
            rounded="md"
            cursor={disabled ? 'not-allowed' : 'pointer'}
            _hover={disabled ? {} : { bg: 'gray.50' }}
            minWidth="200px"
            width="100%"
            opacity={disabled ? 0.6 : 1}
          >
            <Flex
              align="center"
              justify="space-between"
              gap={2}
              color="gray.900"
              fontSize="sm"
              fontWeight="medium"
              width="100%"
            >
              <Flex align="center" gap={2}>
                <MapPin size={16} />
                <Text>{displayLocationName}</Text>
              </Flex>
              <ChevronDown size={16} />
            </Flex>
          </Box>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content width="auto" minWidth="200px">
              <Popover.Body p={2}>
                <VStack gap={1} align="stretch">
                  {locations.map((location) => (
                    <Button
                      key={location.id}
                      variant="ghost"
                      size="sm"
                      justifyContent="flex-start"
                      onClick={() => handleLocationSelect(location.id)}
                      bg={selectedLocationId === location.id ? 'brand.50' : 'transparent'}
                      color={selectedLocationId === location.id ? 'brand.600' : 'gray.700'}
                      _hover={{ bg: 'brand.100' }}
                    >
                      {location.name}
                    </Button>
                  ))}
                </VStack>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </Box>
  );
}

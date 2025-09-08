import brand from "@/brand/baseInfo";
import { Text, Box } from "@chakra-ui/react";
import Image from "next/image";
import { useNavigation } from "./location/NavigationContext";

export default function NavbarHeader() {
  const { selectedLocation } = useNavigation();

  return (
    <Box pt="32px" display="flex" alignItems="end" gap={3}>
      <Image src={brand.logo.src} alt={brand.name} width={128} height={56} />
      {selectedLocation && (
        <Text opacity={0.8} fontSize="sm" mt={1} fontWeight="normal">
          {selectedLocation.name}
        </Text>
      )}
    </Box>
  );
}

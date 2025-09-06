import { Text, Stack } from "@chakra-ui/react";
import LocationSelector from "./location/LocationSelector";
import MenuSelector from "./menu/MenuSelector";

export default function NavbarBody() {
  return (
    <Stack gap={4}>
      <Text opacity={0.9} fontSize="sm" fontWeight="medium">
        지점 선택
      </Text>
      <LocationSelector />

      <Text opacity={0.9} fontSize="sm" fontWeight="medium">
        메뉴
      </Text>
      <Stack gap={2}>
        <MenuSelector />
      </Stack>
    </Stack>
  );
}

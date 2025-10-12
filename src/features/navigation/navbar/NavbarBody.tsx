import { Stack } from "@chakra-ui/react";
import LocationSelector from "../location/LocationSelector";
import MenuSelector from "../menu/MenuSelector";

export default function NavbarBody() {
  return (
    <Stack gap={4}>
      <LocationSelector />
      <Stack gap={2}>
        <MenuSelector />
      </Stack>
    </Stack>
  );
}

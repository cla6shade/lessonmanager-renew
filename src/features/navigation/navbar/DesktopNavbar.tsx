import colors from "@/brand/colors";
import { Box } from "@chakra-ui/react";
import NavbarHeader from "./NavbarHeader";
import NavbarBody from "./NavbarBody";
import NavbarFooter from "./NavbarFooter";

export default function DesktopNavbar() {
  return (
    <Box
      left={0}
      top={0}
      bottom={0}
      w="280px"
      bg={colors.brandPanel}
      color="white"
      zIndex={1000}
      display={{ base: "none", lg: "flex" }}
      flexDirection="column"
      p="24px"
    >
      <NavbarHeader />

      <Box flex={1} overflowY="auto" pt={6}>
        <NavbarBody />
      </Box>
      <NavbarFooter />
    </Box>
  );
}

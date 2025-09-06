import colors from "@/brand/colors";
import { Drawer, Box } from "@chakra-ui/react";
import { useState } from "react";
import NavbarOpenButton from "./NavbarOpenButton";
import NavbarHeader from "./NavbarHeader";
import NavbarBody from "./NavbarBody";

export default function MobileNavbar() {
  const [open, setOpen] = useState(false);

  const onOpenChange = (e: any) => setOpen(e.open);

  return (
    <Box display={{ base: "block", md: "none" }}>
      {!open && <NavbarOpenButton onOpen={() => setOpen(true)} />}

      <Drawer.Root open={open} onOpenChange={onOpenChange} placement="start">
        <Drawer.Positioner>
          <Drawer.Content bg={colors.brandPanel} w="280px" color="white">
            <Drawer.Header>
              <NavbarHeader />
            </Drawer.Header>

            <Drawer.Body>
              <NavbarBody />
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </Box>
  );
}

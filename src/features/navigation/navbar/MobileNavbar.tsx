import colors from '@/brand/colors';
import { Drawer, Box } from '@chakra-ui/react';
import { useState } from 'react';
import PageHeader from '../PageHeader';
import NavbarHeader from './NavbarHeader';
import NavbarBody from './NavbarBody';

export default function MobileNavbar() {
  const [open, setOpen] = useState(false);

  const onOpenChange = (e: { open: boolean }) => setOpen(e.open);

  return (
    <>
      <PageHeader onOpen={() => setOpen(true)} />
      <Box display={{ base: 'block', lg: 'none' }}>
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
    </>
  );
}

import brand from '@/brand/baseInfo';
import colors from '@/brand/colors';
import { Box, Button, Text } from '@chakra-ui/react';

interface PageHeaderProps {
  onOpen: () => void;
}

export default function PageHeader({ onOpen }: PageHeaderProps) {
  return (
    <Box
      position="fixed"
      w="full"
      h="48px"
      bg={colors.brandPanel}
      top={0}
      left={0}
      display={{ base: 'flex', lg: 'none' }}
      alignItems="center"
    >
      <Button
        onClick={onOpen}
        zIndex={1000}
        variant="solid"
        color={colors.brand}
        bg={colors.brandPanel}
        size="sm"
      >
        ☰
      </Button>
      <Text color="white">{brand.name}</Text>
    </Box>
  );
}

import colors from "@/brand/colors";
import { Button } from "@chakra-ui/react";

interface NavbarOpenButtonProps {
  onOpen: () => void;
}

export default function NavbarOpenButton({ onOpen }: NavbarOpenButtonProps) {
  return (
    <Button
      onClick={onOpen}
      position="fixed"
      top={4}
      left={4}
      zIndex={1000}
      variant="solid"
      color={colors.brand}
      size="sm"
    >
      ☰
    </Button>
  );
}

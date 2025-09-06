import colors from "@/brand/colors";
import { Button } from "@chakra-ui/react";
import useMenu from "./useMenu";
import { useRouter } from "next/navigation";

export default function MenuSelector() {
  const router = useRouter();
  const { menus, currentMenu } = useMenu();
  const handleMenuClick = (href: string) => {
    router.push(href);
  };
  return menus.map((menu) => (
    <Button
      key={menu.href}
      variant="ghost"
      justifyContent="flex-start"
      onClick={() => handleMenuClick(menu.href)}
      fontWeight={currentMenu?.href === menu.href ? "bold" : "normal"}
      color={currentMenu?.href === menu.href ? colors.brand : "gray.300"}
      _hover={{ bg: colors.brandPanelDark }}
    >
      {menu.name}
    </Button>
  ));
}

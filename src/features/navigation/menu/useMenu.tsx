import { usePathname } from "next/navigation";
import { adminMenus, userMenus } from "./menus";
import { useNavigation } from "../provider/NavigationContext";

export default function useMenu() {
  const { isAdmin } = useNavigation();
  const currentPath = usePathname();
  const currentMenu =
    adminMenus.find((menu) => menu.href === currentPath) ||
    userMenus.find((menu) => menu.href === currentPath);
  return {
    menus: isAdmin ? adminMenus : userMenus,
    currentMenu,
  };
}

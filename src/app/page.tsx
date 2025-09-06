import {
  DEFAULT_ADMIN_MENU,
  DEFAULT_USER_MENU,
} from "@/features/navigation/menu/menus";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();
  const href = session.isAdmin
    ? DEFAULT_ADMIN_MENU.href
    : DEFAULT_USER_MENU.href;
  return redirect(href);
}

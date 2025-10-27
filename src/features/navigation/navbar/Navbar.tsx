import useMenu from '../menu/useMenu';
import MobileNavbar from './MobileNavbar';
import DesktopNavbar from './DesktopNavbar';

export default function Navbar() {
  const { currentMenu } = useMenu();

  if (!currentMenu) {
    return null;
  }

  return (
    <>
      <MobileNavbar />
      <DesktopNavbar />
    </>
  );
}

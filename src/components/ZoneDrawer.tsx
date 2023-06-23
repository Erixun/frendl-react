import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, List } from "@chakra-ui/react";
import isLandscape from "../utils/isLandscape";

const ZoneDrawer = ({
  title,
  isOpen,
  onClose,
  children,
}: {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  return (
    <Drawer
      isOpen={isOpen}
      placement="left"
      onClose={onClose}
      isFullHeight={false}
      size={isLandscape() ? 'xs' : 'sm'}
      closeOnOverlayClick={false}
    >
      <DrawerContent className="zone-drawer-content">
        <DrawerCloseButton />
        <DrawerHeader>{title}</DrawerHeader>

        <DrawerBody>
          <List spacing={3} paddingLeft={'0'} fontSize={'1.2rem'}>
            {children}
          </List>
        </DrawerBody>

        <DrawerFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ZoneDrawer;
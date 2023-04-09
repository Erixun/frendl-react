import { CloseIcon, HamburgerIcon, PhoneIcon } from '@chakra-ui/icons';
import {
  IconButton,
  SlideFade,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';

const GridMapOverlay = () => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

  return (
    <div className="grid-map-overlay">
      <IconButton
        onClick={onToggle}
        colorScheme={!isOpen? 'teal' : 'gray'}
        aria-label="Toggle DrawerMenu"
        size="lg"
        margin={'10px'}
        border={isOpen? '1px solid black' : 'none'}
        gridArea={'control-menu'}
        zIndex={100}
        icon={!isOpen? <HamburgerIcon /> : <CloseIcon />}
      />
      <SlideFade in={isOpen} offsetY="20px" style={{gridArea: 'menu'}}>
        <VStack>
          <IconButton
            colorScheme="teal"
            aria-label="Toggle DrawerMenu"
            size="lg"
            marginTop={'10px'}
            icon={<PhoneIcon />}
          />
          <IconButton
            colorScheme="teal"
            aria-label="Toggle DrawerMenu"
            size="lg"
            marginTop={'10px'}
            icon={<PhoneIcon />}
          />
          <IconButton
            colorScheme="teal"
            aria-label="Toggle DrawerMenu"
            size="lg"
            marginTop={'10px'}
            icon={<PhoneIcon />}
          />
        </VStack>
      </SlideFade>
    </div>
  );
};
export default GridMapOverlay;

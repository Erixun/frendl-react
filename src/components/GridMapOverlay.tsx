import { ChatIcon, CloseIcon, HamburgerIcon } from '@chakra-ui/icons';
import { Button, Icon } from '@chakra-ui/react';
import { IoPeople } from 'react-icons/io5';
import { AiOutlineNotification } from 'react-icons/ai';
import { BiLogOutCircle, BiTargetLock } from 'react-icons/bi';
import { BsJournalText } from 'react-icons/bs';
import { IconButton, SlideFade, VStack, useDisclosure } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { MapStore } from '../store/mapStore';
import { useState } from 'react';

const GridMapOverlay = observer(
  ({
    mapStore,
    onOpenDrawer,
  }: {
    mapStore: MapStore;
    onOpenDrawer: () => void;
  }) => {
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

    const findMe = () => {
      mapStore.findMyLocation();
      console.log(mapStore.isMyLocationLoading);
    };

    const exitZone = () => {
      onOpenDrawer();
      console.log('exitZone');
      //TODO: clear zone data etc
    };

    const [canSubmitStatus, setCanSubmitStatus] = useState(false);

    const [status, setStatus] = useState('');
    const submitStatus = (e: any) => {
      e.preventDefault();
      console.log('submitStatus');
      console.log(status);
      mapStore.displayStatus(status);
      //TODO: add to status log
      setStatus('');
    };

    return (
      <div className="grid-map-overlay">
        <IconButton
          onClick={onToggle}
          colorScheme={!isOpen ? 'teal' : 'gray'}
          aria-label="Toggle DrawerMenu"
          size="lg"
          margin={'10px'}
          border={isOpen ? '1px solid black' : 'none'}
          gridArea={'control-menu'}
          zIndex={100}
          icon={!isOpen ? <HamburgerIcon /> : <CloseIcon />}
        />
        <SlideFade in={isOpen} offsetY="20px" style={{ gridArea: 'menu' }}>
          <VStack>
            <IconButton
              colorScheme="teal"
              aria-label="Toggle Members"
              size="lg"
              marginTop={'10px'}
              icon={<Icon as={IoPeople} boxSize={7} />}
            />
            <IconButton
              colorScheme="teal"
              aria-label="Toggle Status Log"
              size="lg"
              marginTop={'10px'}
              icon={<Icon as={BsJournalText} boxSize={6} />}
            />
            <IconButton
              onClick={() => setCanSubmitStatus(!canSubmitStatus)}
              isActive={canSubmitStatus}
              colorScheme="teal"
              aria-label="Toggle Notify Status"
              size="lg"
              marginTop={'10px'}
              icon={<Icon as={AiOutlineNotification} boxSize={6} />}
            />
            <IconButton
              colorScheme="teal"
              aria-label="Toggle Chat"
              size="lg"
              marginTop={'10px'}
              icon={<ChatIcon boxSize={5} />}
            />
            <IconButton
              onClick={findMe}
              isLoading={mapStore.isMyLocationLoading}
              colorScheme="teal"
              aria-label="Find my location"
              size="lg"
              marginTop={'10px'}
              icon={<Icon as={BiTargetLock} boxSize={7} />}
            />
            <IconButton
              onClick={exitZone}
              colorScheme="teal"
              aria-label="Toggle DrawerMenu"
              size="lg"
              marginTop={'10px'}
              icon={<Icon as={BiLogOutCircle} boxSize={7} />}
            />
          </VStack>
        </SlideFade>
        <SlideFade in={canSubmitStatus} offsetY="40px" style={{ gridArea: 'messenger' }}>
          {/* TODO: Create component */}
          <div className="status-messenger">
            <form onSubmit={submitStatus}>
              <div className="input-wrapper">
                <input
                  className="input-status"
                  type="text"
                  placeholder="Enter your status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                />
                <Button type={"submit"} colorScheme='blue' size={"sm"}>Submit</Button>
              </div>
            </form>
          </div>
        </SlideFade>
      </div>
    );
  }
);
export default GridMapOverlay;

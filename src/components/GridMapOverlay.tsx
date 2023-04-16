import { ChatIcon, CloseIcon, HamburgerIcon } from '@chakra-ui/icons';
import { Button, Icon } from '@chakra-ui/react';
import { IoPeople } from 'react-icons/io5';
import { AiOutlineNotification } from 'react-icons/ai';
import { BiLogOutCircle, BiTargetLock } from 'react-icons/bi';
import { BsJournalText } from 'react-icons/bs';
import { IconButton, SlideFade, VStack, useDisclosure } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { MapStore } from '../store/mapStore';
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { toast } from 'react-toastify';

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

    Pusher.logToConsole = true;
    const pusher = new Pusher('1810da9709de2631e7bc', {
      authEndpoint: 'http://localhost:3000/api/pusher/auth',
      cluster: 'eu',
    });

    const [zoneState, setZoneState] = useState({
      users_online: {},
      center: {},
      //make the locations object indexable by string
      locations: {} as { [key: string]: Object },
      current_user: '',
    });

    useEffect(() => {
      console.log('useEffect mapStore.zoneId', mapStore.zoneId);

      mapStore.zoneChannel = pusher.subscribe(
        `zone-channel-${mapStore.zoneId}`
      );

      mapStore.zoneChannel.bind(
        'pusher:subscription_succeeded',
        (members: any) => {
          let location = {};
          if (mapStore.myLocation) {
            const { lat, lng } = mapStore.myLocation as google.maps.LatLng;
            location = { lat: lat(), lng: lng() };
          } else {
            location = { lat: 0, lng: 0 };
          }
          const newState = {
            ...zoneState,
            users_online: members.members,
            current_user: members.myID || 'unknown',
            center: location,
          };
          newState.locations[`${members.myID}`] = location;
          setZoneState(newState);

          console.log(zoneState);
          notify(zoneState);
        }
      );

      mapStore.zoneChannel.bind('location-update', (body: any) => {
   
        const newState = {
          ...zoneState,
          locations: {
            ...zoneState.locations,
            [`${body.username}`]: body.location,
          },
        };
        setZoneState(newState);
      });

      // mapStore.zoneChannel.bind('pusher:member_removed', (member) => {
      //   this.setState((prevState, props) => {
      //     const newState = { ...prevState };
      //     // remove member location once they go offline
      //     delete newState.locations[`${member.id}`];
      //     // delete member from the list of online users
      //     delete newState.users_online[`${member.id}`];
      //     return newState;
      //   });
      //   notify(state);
      // });

      // mapStore.zoneChannel.bind('pusher:member_added', (member) => {
      //   notify(state);
      // });
    }, [mapStore.zoneId]);

    useEffect(() => {
      console.log('myLocation changed');
      fetch('http://localhost:3000/api/update-location', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              zoneId: mapStore.zoneId,
              username: zoneState.current_user || 'unknown',
              location: mapStore.getLocation(),
            }),
          }).then((res) => {
            if (res.status === 200) {
              console.log('new location updated successfully');
            }
          });
    }, [mapStore.myLocation]);


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
        <SlideFade
          in={canSubmitStatus}
          offsetY="40px"
          style={{ gridArea: 'messenger' }}
        >
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
                <Button type={'submit'} colorScheme="blue" size={'sm'}>
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </SlideFade>
      </div>
    );
  }
);

export const notify = (state: any) => {
  // Object.keys(state.users_online).length;
  toast(`Users online : ${1}`, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    type: 'info',
  });
};

export default GridMapOverlay;

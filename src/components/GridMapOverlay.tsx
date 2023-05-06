import { ChatIcon, CloseIcon, HamburgerIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Icon,
  List,
  ListIcon,
  ListItem,
} from '@chakra-ui/react';
import { IoPeople, IoPersonCircle } from 'react-icons/io5';
import { AiOutlineNotification } from 'react-icons/ai';
import { BiLogOutCircle, BiTargetLock } from 'react-icons/bi';
import { TfiTarget } from 'react-icons/tfi';
import { BsJournalText } from 'react-icons/bs';
import { IconButton, SlideFade, VStack, useDisclosure } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { MapStore } from '../store/mapStore';
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './GridMapOverlay.css';
import { ZoneMember, ZoneMenuOption } from '../store/zoneStore';
import { currentUser, members } from '../testData';
import { runInAction, set } from 'mobx';

const GridMapOverlay = observer(
  ({ map, onOpenDrawer }: { map: MapStore; onOpenDrawer: () => void }) => {
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

    const findMe = () => {
      map.findMyLocation();
    };

    const exitZone = () => {
      onOpenDrawer();
      closeZoneDrawer();
      map.clearZone();
    };

    const [canSubmitStatus, setCanSubmitStatus] = useState(false);

    const [status, setStatus] = useState('');
    const submitStatus = (e: any) => {
      runInAction(() => {
        if (!map.zone) return;
        map.zone.toggledMenuOption === ZoneMenuOption.STATUS
          ? (map.zone.toggledMenuOption = ZoneMenuOption.NONE)
          : (map.zone.toggledMenuOption = ZoneMenuOption.STATUS);
      });

      e.preventDefault();
      console.log('submitStatus');
      console.log(status);
      map.displayStatus(status);
      if (status) map.zone?.makeLogEntry(currentUser.username, status);
      //TODO: add to status log
      setStatus('');
      setCanSubmitStatus(false);
    };

    // Pusher.logToConsole = true;
    //TODO: move to env
    // const pusher = new Pusher('1810da9709de2631e7bc', {
    //   authEndpoint: 'http://localhost:3000/api/pusher/auth',
    //   cluster: 'eu',
    // });

    const [zoneState, setZoneState] = useState({
      users_online: {},
      center: {},
      //make the locations object indexable by string
      locations: {} as { [key: string]: Object },
      current_user: '',
      members: map.zone?.members || [],
    });

    useEffect(() => {
      console.log('useEffect map.zoneId', map.zoneId);
      console.log(
        'Pusher subscription & channel binds commented out to prevent reaching quota'
      );

      if (!map.zoneId) return exitZone();

      //set map zoom level and center so that all markers are visible
      map.displayMemberLocations();

      // map.zoneChannel = pusher.subscribe(
      //   `zone-channel-${map.zoneId}`
      // );

      // map.zoneChannel.bind(
      //   'pusher:subscription_succeeded',
      //   (members: any) => {
      //     let location = {};
      //     if (map.myLocation) {
      //       const { lat, lng } = map.myLocation as google.maps.LatLng;
      //       location = { lat: lat(), lng: lng() };
      //     } else {
      //       location = { lat: 0, lng: 0 };
      //     }
      //     const newState = {
      //       ...zoneState,
      //       users_online: members.members,
      //       current_user: members.myID || 'unknown',
      //       center: location,
      //     };
      //     newState.locations[`${members.myID}`] = location;
      //     setZoneState(newState);

      //     console.log(zoneState);
      //     notify(zoneState);
      //   }
      // );

      // map.zoneChannel.bind('location-update', (body: any) => {

      //   const newState = {
      //     ...zoneState,
      //     locations: {
      //       ...zoneState.locations,
      //       [`${body.username}`]: body.location,
      //     },
      //   };
      //   setZoneState(newState);
      // });

      // map.zoneChannel.bind('pusher:member_removed', (member) => {
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

      // map.zoneChannel.bind('pusher:member_added', (member) => {
      //   notify(state);
      // });
    }, [map.zoneId]);

    useEffect(() => {
      console.log('myLocation changed');
      fetch('http://localhost:3000/api/update-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zoneId: map.zoneId,
          username: zoneState.current_user || 'unknown',
          location: map.userLocation,
        }),
      }).then((res) => {
        if (res.status === 200) {
          console.log('new location updated successfully');
        }
      });
    }, [map.myLocation]);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleZoneDrawer = (menuOption: string) => {
      runInAction(() => {
        const { zone } = map;
        if (zone) {
          const isOpen = zone.toggledMenuOption === menuOption;
          isOpen
            ? (zone.toggledMenuOption = '')
            : (zone.toggledMenuOption = menuOption);
            setIsDrawerOpen(!isOpen);
        }
        //  zone.toggledMenuOption === menuOption?  zone.toggledMenuOption = '';
        // zone.toggledMenuOption = menuOption;
      });
      setCanSubmitStatus(false);
    };

    const closeZoneDrawer = () => {
      setIsDrawerOpen(false);
    };

    const showLocation = (member: ZoneMember) => {
      return () => {
        map.zone?.showLocation(member);
      };
    };

    const [target, setTarget] = useState('');

    const lockTarget = (member: ZoneMember) => {
      return () => {
        const { username } = member;
        const isCurrentTarget = target === username;
        const newTarget = isCurrentTarget ? '' : username;
        setTarget(newTarget);
        if (isCurrentTarget) return map.zone?.setFocus(null);

        map.zone?.setFocus(member);
      };
    };

    const getMembers = () => {
      return map.zone?.members || members;
    };

    return (
      <div className="grid-map-overlay">
        <ToastContainer />
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
              // isActive={isDrawerOpen}
              isActive={map.zone?.toggledMenuOption === ZoneMenuOption.MEMBERS}
              onClick={() => toggleZoneDrawer(ZoneMenuOption.MEMBERS)}
              size="lg"
              marginTop={'10px'}
              icon={<Icon as={IoPeople} boxSize={7} />}
            />
            <IconButton
              colorScheme="teal"
              aria-label="Toggle Status Log"
              // onClick={notify}
              isActive={map.zone?.toggledMenuOption === ZoneMenuOption.LOGS}
              onClick={() => toggleZoneDrawer(ZoneMenuOption.LOGS)}
              size="lg"
              marginTop={'10px'}
              icon={<Icon as={BsJournalText} boxSize={6} />}
            />
            <IconButton
              onClick={() => {
                runInAction(() => {
                  if (!map.zone) return;
                  const isToggled =
                    map.zone.toggledMenuOption === ZoneMenuOption.STATUS;
                  setCanSubmitStatus(!isToggled);
                  if (isToggled) return (map.zone.toggledMenuOption = '');

                  map.zone.toggledMenuOption = ZoneMenuOption.STATUS;
                  // setCanSubmitStatus(!canSubmitStatus);
                });
                setIsDrawerOpen(false);
              }}
              // isActive={canSubmitStatus}
              isActive={map.zone?.toggledMenuOption === ZoneMenuOption.STATUS}
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
            {/* TODO: enable find & track marked member */}
            <IconButton
              onClick={findMe}
              isLoading={map.isMyLocationLoading}
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
          unmountOnExit={true}
          offsetY="40px"
          style={{
            gridArea: 'messenger',
            pointerEvents: 'none',
          }}
        >
          {/* TODO: Create component */}
          <div className="status-messenger">
            <form onSubmit={submitStatus}>
              <div className="input-wrapper">
                <input
                  autoFocus
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

        {/* TODO: create reusable component */}
        <ZoneDrawer
          title="Zone Members"
          // data={getMembers()}
          isOpen={isDrawerOpen}
          onClose={closeZoneDrawer}
        >
          {/* <List spacing={3} paddingLeft={'0'} fontSize={'1.2rem'}> */}
          {/* TODO: if is Members toggled */}
          {map.zone?.toggledMenuOption === ZoneMenuOption.MEMBERS &&
            getMembers().map((member, i) => (
              <ZoneMemberItem
                key={i}
                member={member}
                onShowLocation={showLocation}
                onLockTarget={lockTarget}
                currentTarget={target}
              />
            ))}
          {map.zone?.toggledMenuOption === ZoneMenuOption.LOGS &&
            // <ZoneLogs />
            map.zone.statusLogs.map((log, i) => (
              // <ZoneLogItem key={i} log={log} />
              <div key={i}>
                <div>{log.username}:</div>
                <div>{log.createdAt.toDateString()}</div>
                <div>{log.statusMessage}</div>
              </div>
            ))}
          {/* </List> */}
        </ZoneDrawer>
        {/* <Drawer
          isOpen={isDrawerOpen}
          placement="left"
          onClose={closeZoneDrawer}
          isFullHeight={false}
          size={isLandscape() ? 'xs' : 'sm'}
          closeOnOverlayClick={false}
        >
          <DrawerContent className="zone-drawer-content">
            <DrawerCloseButton />
            <DrawerHeader>Zone Members</DrawerHeader>

            <DrawerBody>
              <List spacing={3} paddingLeft={'0'} fontSize={'1.2rem'}>
                {getMembers().map((member, i) => (
                  <ListItem
                    className="zone-member"
                    key={i}
                    onClick={showLocation(member)}
                  >
                    <IconButton
                      sx={{
                        '&:hover': { color: 'red' },
                        backgroundColor: 'transparent',
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                        padding: '0',
                      }}
                      aria-label="Target"
                      onClick={lockTarget(member)}
                      icon={
                        target === member.username ? (
                          <BiTargetLock size={20} />
                        ) : (
                          <TfiTarget />
                        )
                      }
                    />

                    <ListIcon
                      className="person-circle"
                      as={IoPersonCircle}
                      color={member.status === 'online' ? 'green.500' : 'grey'}
                    />
                    <span className="name">{member.username}</span>
                  </ListItem>
                ))}
              </List>
            </DrawerBody>

            <DrawerFooter>
              <Button variant="outline" mr={3} onClick={closeZoneDrawer}>
                Close
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer> */}
      </div>
    );
  }
);

export const ZoneDrawer = ({
  title,
  // data,
  isOpen,
  onClose,
  children,
}: {
  title: string;
  // data: Array<any>;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  return (
    <Drawer
      // trapFocus={false}
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
            {/* {data.map((member, i) => (
          <ListItem
            className="zone-member"
            key={i}
            onClick={showLocation(member)}
          >
            <IconButton
              sx={{
                '&:hover': { color: 'red' },
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                padding: '0',
              }}
              aria-label="Target"
              onClick={lockTarget(member)}
              icon={
                target === member.username ? (
                  <BiTargetLock size={20} />
                ) : (
                  <TfiTarget />
                )
              }
            />

            <ListIcon
              className="person-circle"
              as={IoPersonCircle}
              color={member.status === 'online' ? 'green.500' : 'grey'}
            />
            <span className="name">{member.username}</span>
          </ListItem>
        ))} */}
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

const ZoneMemberItem = ({
  member,
  currentTarget,
  onLockTarget,
  onShowLocation,
}: {
  member: any;
  currentTarget: string;
  onLockTarget: (member: any) => () => void;
  onShowLocation: (member: any) => () => void;
}) => {
  return (
    <ListItem className="zone-member" onClick={onShowLocation(member)}>
      <IconButton
        sx={{
          '&:hover': { color: 'red' },
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          padding: '0',
        }}
        aria-label="Target"
        onClick={onLockTarget(member)}
        icon={
          currentTarget === member.username ? (
            <BiTargetLock size={20} />
          ) : (
            <TfiTarget />
          )
        }
      />

      <ListIcon
        className="person-circle"
        as={IoPersonCircle}
        color={member.status === 'online' ? 'green.500' : 'grey'}
      />
      <span className="name">{member.username}</span>
    </ListItem>
  );
};

function isLandscape() {
  const doc = document.documentElement;
  return doc.scrollWidth > doc.scrollHeight;
}

export const notify = () => {
  return toast(`User Malva entered the zone`, {
    position: 'bottom-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    type: 'success',
  });
};

export default GridMapOverlay;

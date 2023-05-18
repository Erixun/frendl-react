import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons';
import {
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
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
} from '@chakra-ui/react';
import { IoPeople, IoPersonCircle } from 'react-icons/io5';
import { AiOutlineNotification } from 'react-icons/ai';
import { BiCopy, BiHash, BiLogOutCircle, BiTargetLock } from 'react-icons/bi';
import { TfiTarget } from 'react-icons/tfi';
import { BsJournalText } from 'react-icons/bs';
import { IconButton, SlideFade, VStack, useDisclosure } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { MapStore } from '../store/mapStore';
import { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { ZoneMember, ZoneMenuOption, ZoneStore } from '../store/zoneStore';
import { currentUser, members } from '../testData';
import { runInAction } from 'mobx';
import pusherClient from '../service/pusher';
import { postToUpdateLocation } from '../service/ws';
import 'react-toastify/dist/ReactToastify.css';
import './GridMapOverlay.css';

const GridMapOverlay = observer(
  ({ map, onOpenDrawer }: { map: MapStore; onOpenDrawer: () => void }) => {
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

    const exitZone = () => {
      onOpenDrawer();
      closeZoneDrawer();
      map.clearZone();
    };

    const [canSubmitStatus, setCanSubmitStatus] = useState(false);

    const [status, setStatus] = useState('');
    const submitStatus = (e: any) => {
      e.preventDefault();
      console.log('submitStatus');
      console.log(status);
      map.displayStatus(status);
      if (status) map.zone?.makeLogEntry(currentUser.username, status);

      setStatus('');
    };

    useEffect(() => {
      console.log('useEffect map.zoneId', map.zoneId);
      console.log(
        'Pusher subscription & channel binds commented out to prevent reaching quota'
      );

      if (!map.zoneId) return exitZone();

      //set map zoom level and center so that all markers are visible
      map.displayMemberLocations();

      map.zoneChannel = pusherClient.subscribe(`zone-channel-${map.zoneId}`);

      map.zoneChannel.bind('pusher:subscription_succeeded', () => {
        console.log('pusher:subscription_succeeded');
      });

      map.zoneChannel.bind('location-update', (body: any) => {
        //TODO: update ZoneStore
        console.log('location-update');
        console.log(body);

        const { userId, location } = body;

        map.zone?.updateLocation(userId, location);
      });

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
      postToUpdateLocation();
    }, [map.myLocation]);

    const toggleZoneDrawer = (menuOption: string) => () => {
      runInAction(() => {
        const { zone } = map;
        if (zone) {
          const isToggledOption = zone.toggledMenuOption === menuOption;
          zone.toggledMenuOption = isToggledOption ? '' : menuOption;
        }
      });
      setCanSubmitStatus(false);
    };

    const closeZoneDrawer = () => {
      if (map.zone) map.zone.toggledMenuOption = ZoneMenuOption.NONE;
    };

    const showLocation = (member: ZoneMember) => {
      return () => {
        map.zone?.showLocation(member);
      };
    };

    const [target, setTarget] = useState('');
    const toggleTargetLock = () => {
      if (!map.zone) return;

      const memberInFocus = map.zone.focusedMember;
      if (memberInFocus) {
        map.zone.setFocus(null);
        setTarget(NONE);
        return (map.zone.toggledMenuOption = NONE);
      }

      map.zone.setFocus(map.currentUser);
      setTarget(map.currentUser.username);
      map.zone.toggledMenuOption = LOCATE;
    };

    const lockTarget = (member: ZoneMember | null) => {
      const { zone } = map;
      const targetable =
        typeof member === 'string' ? zone?.getMember(member) : member;
      const { username } = targetable ?? {};

      return () => {
        console.log('lockTarget', targetable, username);
        const isToggledOption = zone?.toggledMenuOption === LOCATE;
        const hasTargetLock = Boolean(target);
        const canLockTarget = zone && targetable && username;

        if (hasTargetLock) {
          zone!.toggledMenuOption = '';
          console.log('isToggledOption', isToggledOption);
          setTarget('');
        } else if (canLockTarget) {
          zone.toggledMenuOption = LOCATE;

          const isCurrentTarget = target === username;
          const newTarget = isCurrentTarget ? '' : username;
          setTarget(newTarget);
          if (isCurrentTarget) return zone.setFocus(null);

          return zone.setFocus(targetable);
        }
        zone!.toggledMenuOption = LOCATE;
        const user = map.currentUser;
        setTarget(user.username);
        if (isCurrentTarget(user.username)) return zone?.setFocus(null);
        zone?.setFocus(user);

        function isCurrentTarget(username: string) {
          return target === username;
        }
      };
    };

    const getMembers = () => {
      return map.zone?.members || members;
    };

    const isOptionToggled = (option: string) => {
      return map.zone?.toggledMenuOption === option;
    };

    const { ZONE_CODE, MEMBERS, LOGS, STATUS, LOCATE, NONE } = ZoneMenuOption;

    const toggleZoneCode = () => {
      runInAction(() => {
        const { zone } = map;
        if (zone) {
          const isToggledOption = zone.toggledMenuOption === ZONE_CODE;
          zone.toggledMenuOption = isToggledOption ? '' : ZONE_CODE;
        }
      });
    };

    const copyZoneCode = () => {
      const { zoneId } = map.zone!;
      //copy zone code to clipBoard
      navigator.clipboard.writeText(zoneId);
      notify('Code Copied to Clipboard');
      btnZoneCodeRef.current?.click();
    };

    const btnZoneCodeRef = useRef<HTMLButtonElement>(null);

    return (
      <div className="grid-map-overlay">
        <ToastContainer />
        <IconButton
          onClick={onToggle}
          colorScheme={!isOpen ? 'teal' : 'gray'}
          aria-label="Toggle Menu Options"
          size="lg"
          margin={'10px'}
          border={isOpen ? '1px solid black' : 'none'}
          gridArea={'control-menu'}
          zIndex={100}
          icon={!isOpen ? <HamburgerIcon /> : <CloseIcon />}
        />
        <SlideFade in={isOpen} offsetY="20px" style={{ gridArea: 'menu' }}>
          <VStack>
            {/* TODO: separate component */}
            <Popover placement="left-start">
              <PopoverTrigger>
                <IconButton
                  ref={btnZoneCodeRef}
                  colorScheme="teal"
                  aria-label="Copy Zone Code"
                  isActive={isOptionToggled(ZONE_CODE)}
                  onClick={toggleZoneCode}
                  size="lg"
                  marginTop={'10px'}
                  icon={<Icon as={BiHash} boxSize={7} />}
                />
              </PopoverTrigger>
              <Portal>
                <PopoverContent width={'max-content'}>
                  <PopoverArrow />
                  <PopoverBody
                    style={{
                      display: 'flex',
                      gap: '5px',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong>Zone Code:</strong> {map.zone?.zoneId}
                    </div>
                    <IconButton
                      style={{ backgroundColor: 'transparent', border: 'none' }}
                      aria-label="Copy Zone Code"
                      size="sm"
                      onClick={copyZoneCode}
                      icon={<Icon as={BiCopy} boxSize={7} />}
                    />
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </Popover>
            <IconButton
              colorScheme="teal"
              aria-label="Toggle Members"
              isActive={isOptionToggled(MEMBERS)}
              onClick={toggleZoneDrawer(MEMBERS)}
              size="lg"
              marginTop={'10px'}
              icon={<Icon as={IoPeople} boxSize={7} />}
            />
            <IconButton
              colorScheme="teal"
              aria-label="Toggle Chat"
              isActive={isOptionToggled(LOGS)}
              onClick={toggleZoneDrawer(LOGS)}
              size="lg"
              marginTop={'10px'}
              icon={<Icon as={BsJournalText} boxSize={6} />}
            />
            <IconButton
              onClick={() => {
                runInAction(() => {
                  if (!map.zone) return;
                  const isToggled = isOptionToggled(STATUS);
                  setCanSubmitStatus(!isToggled);
                  if (isToggled) return (map.zone.toggledMenuOption = '');

                  map.zone.toggledMenuOption = STATUS;
                });
              }}
              isActive={isOptionToggled(STATUS)}
              colorScheme="teal"
              aria-label="Toggle Messenger"
              size="lg"
              marginTop={'10px'}
              icon={<Icon as={AiOutlineNotification} boxSize={6} />}
            />
            <IconButton
              onClick={toggleTargetLock}
              isActive={!!target}
              isLoading={map.isMyLocationLoading}
              colorScheme="teal"
              aria-label="Find target location"
              size="lg"
              marginTop={'10px'}
              icon={<Icon as={BiTargetLock} boxSize={7} />}
            />
            <IconButton
              onClick={exitZone}
              colorScheme="teal"
              aria-label="Exit Zone"
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
                  placeholder="Enter a message..."
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

        <ZoneDrawer
          title={isOptionToggled(MEMBERS) ? 'Zone Members' : 'Zone Chat'}
          isOpen={map.zone?.isDrawerOpen ?? false}
          onClose={closeZoneDrawer}
        >
          {isOptionToggled(MEMBERS) &&
            //TODO: <ZoneMembers />
            getMembers().map((member, i) => (
              <ZoneMemberItem
                key={i}
                member={member}
                onShowLocation={showLocation}
                onLockTarget={lockTarget}
                currentTarget={target}
              />
            ))}
          {isOptionToggled(LOGS) && <ChatLogObserver zone={map.zone} />}
        </ZoneDrawer>
      </div>
    );
  }
);
//TODO: move to separate file
export const ChatLog = ({ zone }: { zone?: ZoneStore }) => {
  if (!zone) return null;

  useEffect(() => {
    console.log('ChatLog mounted');
    const chatLog = document.getElementById('chat-log');
    chatLog?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [zone.statusLogs]);

  if (!zone.statusLogs.length)
    return (
      <p style={{ textAlign: 'center', fontStyle: 'italic' }}>
        No messages yet
      </p>
    );

  return (
    <div
      id="chat-log"
      style={{
        display: 'grid',
        gridTemplateColumns: '100%',
        gap: '1rem',
        fontSize: '1rem',
      }}
    >
      {zone.statusLogs.map((log, i, arr) => (
        //TODO: if current user, show on right side
        //TODO: if not current user, show on left side
        //TODO: if current user, do not show username
        //TODO: if not current user, show username
        //TODO: if previous message is from same user, do not show username
        <div
          key={i}
          className="chat-log-entry"
          style={{
            boxShadow: '0px 0px 1px 1px gray',
            borderRadius: '4px',
            padding: '4px 8px',
            background: '#deffde',
            position: 'relative',
          }}
        >
          <div
            className="username"
            style={{ fontWeight: 'bold', color: '#5a4cff' }}
          >
            {log.username}
          </div>
          <div className="msg-body">
            {log.statusMessage}
            <div
              className="timestamp"
              style={{
                fontSize: '10px',
                position: 'absolute',
                bottom: '2px',
                right: '6px',
                float: 'right',
                clear: 'right',
              }}
            >
              {log.createdAt.toLocaleTimeString('sv', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
//TODO: move to separate file
export const ChatLogObserver = observer(ChatLog);
//TODO: move to separate file
export const ZoneDrawer = ({
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

//TODO: move to own file
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

export const notify = (msg: string) => {
  return toast(msg, {
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

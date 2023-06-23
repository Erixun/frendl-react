import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons';
import {
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
} from '@chakra-ui/react';
import { IoPeople } from 'react-icons/io5';
import { AiOutlineNotification } from 'react-icons/ai';
import { BiCopy, BiHash, BiLogOutCircle, BiTargetLock } from 'react-icons/bi';
import { BsJournalText } from 'react-icons/bs';
import { IconButton, SlideFade, VStack, useDisclosure } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { MapStore } from '../store/mapStore';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { ZoneMember, ZoneMenuOption } from '../store/zoneStore';
import { runInAction } from 'mobx';
import { deleteZoneMember, postToUpdateLocation } from '../service/ws';
import { ChatLogObserver } from './ChatLog';
import ZoneDrawer from './ZoneDrawer';
import ZoneMemberItem from './ZoneMemberItem';
import { notify } from '../utils';
import { KeyboardEvent } from 'react';
import ZoneMessenger from './ZoneMessenger';
import 'react-toastify/dist/ReactToastify.css';
import './GridMapOverlay.css';

const GridMapOverlay = observer(
  ({ map, onOpenDrawer }: { map: MapStore; onOpenDrawer: () => void }) => {
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

    const exitZone = () => {
      onOpenDrawer();
      closeZoneDrawer();
      deleteZoneMember();
      map.clearZone();
    };

    const [canSubmitStatus, setCanSubmitStatus] = useState(false);

    const [message, setMessage] = useState('');
    const submitStatus = (e: any) => {
      e.preventDefault();
      const message = e.target.message.value;
      map.displayMessage(message);
      if (message) map.zone?.makeLogEntry(map.currentUser.username, message);

      setMessage('');
    };

    useEffect(postToUpdateLocation, [map.myLocation]);

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
      return map.zone?.membersArray;
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
          setCanSubmitStatus(false);
        }
      });
    };

    const copyZoneCode = () => {
      const { zoneId } = map.zone!;
      navigator.clipboard.writeText(zoneId);
      notify('Code Copied to Clipboard');
      btnZoneCodeRef.current?.click();
    };

    const btnZoneCodeRef = useRef<HTMLButtonElement>(null);

    const dismissOnEsc = (e: KeyboardEvent<HTMLFormElement>) => {
      if (e.key === 'Escape') {
        setCanSubmitStatus(false);
        runInAction(() => {
          if (map.zone) map.zone.toggledMenuOption = NONE;
        });
      }
    };

    const changeMessage = (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setMessage(value);
    };

    useEffect(() => {
      notifyNewMember();
    }, [map.zone?.latestMemberName]);

    const notifyNewMember = async () => {
      const latestMember = map.zone?.latestMemberName;
      if (latestMember) notify(`${latestMember} entered the zone`);
    };

    useEffect(() => {
      notifyMemberLeft();
    }, [map.zone?.memberJustLeft]);

    const notifyMemberLeft = async () => {
      if (!map.zone?.memberJustLeft) return;

      const formerMember = map.zone.memberJustLeft;
      if (formerMember) notify(`${formerMember} left the zone`, 'info');
    };

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
                <PopoverContent width={'max-content'} sx={{filter: "drop-shadow(0px 0px 1px)"}} borderWidth={0}>
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
          <ZoneMessenger
            value={message}
            handleChange={changeMessage}
            submitStatus={submitStatus}
            dismissOnEsc={dismissOnEsc}
          />
        </SlideFade>

        <ZoneDrawer
          title={isOptionToggled(MEMBERS) ? 'Zone Members' : 'Zone Chat'}
          isOpen={map.zone?.isDrawerOpen ?? false}
          onClose={closeZoneDrawer}
        >
          {isOptionToggled(MEMBERS) &&
            //TODO: <ZoneMembers />
            getMembers()?.map((member, i) => (
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

export default GridMapOverlay;

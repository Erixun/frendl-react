import { IconButton, ListIcon, ListItem } from "@chakra-ui/react";
import { BiTargetLock } from "react-icons/bi";
import { IoPersonCircle } from "react-icons/io5";
import { TfiTarget } from "react-icons/tfi";

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

export default ZoneMemberItem;
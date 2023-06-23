import { CURRENT_USER_COLOR } from '../constant/colors';
import { ZoneMember } from '../store/zoneStore';

const writeContent = (member: ZoneMember, isCurrentUser: boolean) => {
  return `<b style="color: ${
    isCurrentUser ? CURRENT_USER_COLOR : member.userColor
  };">${member.username}</b><br>${member.message || ''}`;
};

export default writeContent;

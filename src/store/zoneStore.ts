import { makeAutoObservable, runInAction } from 'mobx';
import { MapStore } from './mapStore';
import { postToUpdateChatLog } from '../service/ws';

export const ZoneMenuOption = {
  ZONE_CODE: 'ZONE_CODE',
  MEMBERS: 'MEMBERS',
  LOGS: 'LOGS',
  STATUS: 'STATUS',
  CHAT: 'CHAT',
  LOCATE: 'LOCATE',
  LEAVE: 'LEAVE',
  NONE: '',
};

export class ZoneStore implements Zone {
  map: MapStore;
  zoneId: string;
  zoneName?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  members: ZoneMember[] = [];
  memberMap = new Map<string, ZoneMember>();
  chatLog: ZoneChatLogEntry[] = [];
  chatLogLastEntry: ZoneChatLogEntry | undefined;
  focusedMember?: ZoneMember | null;
  focusIntervalId: NodeJS.Timeout | undefined;

  _toggledMenuOption: string | undefined;
  isDrawerOpen = false;

  constructor(map: MapStore, zone: Zone) {
    makeAutoObservable(this);

    this.map = map;
    this.zoneId = zone.zoneId;
    this.zoneName = zone.zoneName;
    this.createdAt = zone.createdAt;
    this.updatedAt = zone.updatedAt;
    this.createdBy = zone.createdBy;
    this.members = zone.members;
    this.chatLog = zone.chatLog || [];

    this.members.forEach((member) => {
      this.memberMap.set(member.userId, member);

      const marker = new google.maps.Marker({
        position: member.location,
        map: map.map,
        title: member.username,
      });

      member.marker = marker;
      const infoWindow = new google.maps.InfoWindow({
        content: `<b>${member.username}</b><br>${member.message || ''}`,
      });

      infoWindow.open(map.map, marker);
      member.infoWindow = infoWindow;

      member.hasInfoWindowOpen = true;
      marker.addListener('click', () => {
        if (member.hasInfoWindowOpen) {
          infoWindow.close();
          return (member.hasInfoWindowOpen = false);
        }
        infoWindow.open(map.map, marker);
        member.hasInfoWindowOpen = true;
      });
    });

    this.map.displayMemberLocations();
  }

  get currentUser() {
    return this.map.currentUser;
  }

  updateLocation(userId: string, location: ZoneLocation) {
    const validMember = this.memberMap.get(userId);
    console.log('validMember', validMember);
    console.log(
      'attempting to update location for user',
      userId,
      'to',
      location
    );
    if (validMember) {
      validMember.location = location;
      validMember.marker?.setPosition(location);
      validMember.infoWindow?.setPosition(location);

      this.memberMap.set(userId, validMember);
    }
  }

  clear() {
    this.members.forEach((member) => {
      member.marker?.setMap(null);
      member.infoWindow?.close();
    });
  }

  setFocus(member: ZoneMember | null) {
    clearInterval(this.focusIntervalId);
    this.focusedMember = member;

    if (!member) return console.log('no member in focus');
    runInAction(() => {
      this.focusIntervalId = setInterval(() => {
        console.log('showing location of focused member');
        this.showLocation(member);
      }, 1000);
    });
  }

  showLocation(member: ZoneMember) {
    const location = this.getLocation(member);
    if (!location) return console.log('location not found');

    const latLng = new google.maps.LatLng(location);
    return this.map.panTo(latLng);
  }

  getLocation({ username }: { username: string }) {
    return this.members.find((member) => member.username === username)
      ?.location;
  }

  getMember(username: string) {
    return this.members.find((member) => member.username === username);
  }

  get toggledMenuOption() {
    return this._toggledMenuOption ?? '';
  }
  set toggledMenuOption(option: string) {
    const isDrawerOption = ['MEMBERS', 'LOGS'].includes(option);
    this.isDrawerOpen = isDrawerOption;
    this._toggledMenuOption = option;
  }

  appendChatLog(entry: ZoneChatLogEntry) {
    runInAction(() => {
      this.chatLog = [...this.chatLog, entry];
      this.chatLogLastEntry = entry;
    });
  }

  makeLogEntry(username: string, message: string) {
    const entry = {
      userId: this.currentUser?.userId,
      username,
      message,
      createdAt: new Date(),
    };

    postToUpdateChatLog(this.zoneId, entry);
  }
}

export const createZone = (map: MapStore, zone: Zone) =>
  new ZoneStore(map, zone);

export interface Zone {
  message?: string;
  zoneId: string;
  zoneName?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  members: ZoneMember[];
  memberMap?: Map<string, ZoneMember>;
  chatLog: ZoneChatLogEntry[];
}

export interface ZoneChatLogEntry {
  userId?: string;
  username: string;
  message: string;
  createdAt: Date;
}

export interface ZoneMember {
  userId: string;
  username: string;
  status?: string;
  message?: string;
  location: ZoneLocation;
  marker?: google.maps.Marker;
  infoWindow?: google.maps.InfoWindow;
  hasInfoWindowOpen?: boolean;
}

export interface ZoneLocation {
  lat: number;
  lng: number;
}

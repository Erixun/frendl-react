import { makeAutoObservable, runInAction } from 'mobx';
import { MapStore } from './mapStore';
import { postToUpdateChatLog } from '../service/ws';
import { writeContent } from '../utils';

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
  latestMemberName: string | undefined;
  memberJustLeft: string | undefined;
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
    this.chatLog = zone.chatLog || [];

    this.initMembers(zone.members);

    this.map.displayMemberLocations();
  }

  initMembers(members: ZoneMember[]) {
    for (const member of members) this.addMember(member);
  }

  get membersArray() {
    return Array.from(this.memberMap.values());
  }

  removeMember(userId: string) {
    const member = this.memberMap.get(userId);
    if (!member) return;

    member.marker?.setMap(null);
    member.infoWindow?.close();
    this.memberMap.delete(userId);
    this.memberJustLeft = member.username
  }

  addMember(member: ZoneMember, hasJustJoined = false) {
    member.message = this.getLastMessage(member);
    const markedMember = this.showOnMap(member);
    this.memberMap.set(member.userId, markedMember);
    if (hasJustJoined) this.latestMemberName = markedMember.username;
  }

  getLastMessage(member: ZoneMember) {
    return this.chatLog
      .reverse()
      .find((entry) => entry.userId === member.userId)?.message;
  }

  showOnMap = (member: ZoneMember) => {
    const marker = new google.maps.Marker({
      position: member.location,
      map: this.map.map,
      title: member.username,
    });

    member.marker = marker;

    const isCurrentUser = member.userId === this.currentUser?.userId;
    const infoWindow = new google.maps.InfoWindow({
      content: writeContent(member, isCurrentUser),
    });

    infoWindow.open(this.map.map, marker);
    member.infoWindow = infoWindow;

    member.hasInfoWindowOpen = true;
    marker.addListener('click', () => {
      if (member.hasInfoWindowOpen) {
        infoWindow.close();
        return (member.hasInfoWindowOpen = false);
      }
      infoWindow.open(this.map.map, marker);
      member.hasInfoWindowOpen = true;
    });

    return member;
  };

  get currentUser() {
    return this.map.currentUser;
  }

  updateLocation(userId: string, location: ZoneLocation) {
    const validMember = this.memberMap.get(userId);
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
    this.memberMap.forEach((member) => {
      member.marker?.setMap(null);
      member.infoWindow?.close();
    });

    this.memberMap.clear();
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

  getLocation({ userId }: { userId: string }) {
    const member = this.memberMap.get(userId);
    if (!member) return console.log('member not found');
    return member.location;
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
  userId: string;
  username: string;
  message: string;
  createdAt: Date;
}

export interface ZoneMember {
  userId: string;
  username: string;
  userColor: string;
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

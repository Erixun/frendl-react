import { makeAutoObservable, runInAction } from 'mobx';
import { MapStore } from './mapStore';

export const ZoneMenuOption = {
  MEMBERS: 'MEMBERS',
  LOGS: 'LOGS',
  STATUS: 'STATUS',
  CHAT: 'CHAT',
  LOCATE: 'LOCATE',
  LEAVE: 'LEAVE',
  NONE: 'NONE',
};

// export type ZoneMenuOptions = {
//   [key in ZoneMenuOption]: ZoneMenuOption;
// };

// export type ZoneMenuValue =
//   (typeof ZoneMenuOption)[keyof typeof ZoneMenuOption];

// export type ZoneMenuOption = keyof typeof ZoneMenuOption;

export class ZoneStore implements Zone {
  map: MapStore;
  zoneId: string;
  zoneName?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  members: ZoneMember[] = [];
  statusLogs: ZoneStatusLog[] = [];
  focusedMember?: ZoneMember | null;
  focusIntervalId: NodeJS.Timeout | undefined;

  toggledMenuOption: string | undefined;

  constructor(map: MapStore, zone: Zone) {
    makeAutoObservable(this);

    this.map = map;
    this.zoneId = zone.zoneId;
    this.zoneName = zone.zoneName;
    this.createdAt = zone.createdAt;
    this.updatedAt = zone.updatedAt;
    this.createdBy = zone.createdBy;
    this.members = zone.members;
    this.statusLogs = zone.statusLogs || [];

    this.members.forEach((member) => {
      const marker = new google.maps.Marker({
        position: member.location,
        map: map.map,
        title: member.username,
      });

      member.marker = marker;
      const infoWindow = new google.maps.InfoWindow({
        content: `<b>${member.username}</b><br>${member.statusMessage || ''}`,
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

  clear() {
    this.members.forEach((member) => {
      member.marker?.setMap(null);
      member.infoWindow?.close();
    });
  }

  setFocus(member: ZoneMember | null) {
    clearInterval(this.focusIntervalId);
    this.focusedMember = member;
    //Continuously show the location of the focused member
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

  makeLogEntry(username: string, statusMessage: string) {
    this.statusLogs.push({
      username,
      statusMessage,
      createdAt: new Date(),
    });

    console.log('statusLogs', this.statusLogs);
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
  statusLogs: ZoneStatusLog[];
}

export interface ZoneStatusLog {
  username: string;
  statusMessage: string;
  createdAt: Date;
}

export interface ZoneMember {
  username: string;
  status: string;
  statusMessage: string;
  location: ZoneLocation;
  marker?: google.maps.Marker;
  infoWindow?: google.maps.InfoWindow;
  hasInfoWindowOpen?: boolean;
}

export interface ZoneLocation {
  lat: number;
  lng: number;
}

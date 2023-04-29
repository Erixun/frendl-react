import { makeAutoObservable } from 'mobx';

const ZoneMenuOption = {
  MEMBERS: 'members',
  LOGS: 'logs',
  STATUS: 'status',
  CHAT: 'chat',
  LOCATE: 'locate',
  LEAVE: 'leave',
};

type ZoneMenuOption = keyof typeof ZoneMenuOption;

export class ZoneStore implements Zone {
  zoneId: string;
  zoneName?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  members: Member[] = [];

  toggledMenuOption: ZoneMenuOption | undefined;

  constructor(zone: Zone) {
    makeAutoObservable(this);

    this.zoneId = zone.zoneId;
    this.zoneName = zone.zoneName;
    this.createdAt = zone.createdAt;
    this.updatedAt = zone.updatedAt;
    this.createdBy = zone.createdBy;
    this.members = zone.members;
  }
}

export const createZone = (zone: Zone) => new ZoneStore(zone);

export interface Zone {
  message?: string;
  zoneId: string;
  zoneName?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  members: Member[];
}

export interface Member {
  username: string;
  status: string;
  location: Location;
}

export interface Location {
  lat: number;
  lng: number;
}

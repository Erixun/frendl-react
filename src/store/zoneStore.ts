//create mobx store to store zone data

import { makeAutoObservable } from 'mobx';

export class ZoneStore {
  zone: Zone | undefined;
  zoneId: string | undefined;
  zoneName: string | undefined;
  zoneDescription: string | undefined;
  zoneMembers: string[] | undefined;
  zoneOwner: string | undefined;
  zoneCreatedAt: Date | undefined;
  zoneUpdatedAt: Date | undefined;
  zoneCreatedBy: string | undefined;

  constructor() {
    makeAutoObservable(this);
  }
}

export type Zone = {
  zoneId: string;
  zoneName: string;
  zoneDescription: string;
  zoneMembers: string[];
  zoneOwner: string;
  zoneCreatedAt: Date;
  zoneUpdatedAt: Date;
  zoneCreatedBy: string;
};

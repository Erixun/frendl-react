export interface ZoneDto {
  message: string;
  zoneId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  members: Member[];
  chatLog: ChatLogEntry[];
}

export interface Member {
  userId: string;
  username: string;
  status?: string;
  location: Location;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface ChatLogEntry {
  userId: string;
  username: string;
  message: string;
  createdAt: string;
}

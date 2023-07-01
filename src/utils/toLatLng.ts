import { ZoneLocation } from '../store/zoneStore';

export const toLatLng = (location: ZoneLocation): LatLng => ({
  lat: location.latitude,
  lng: location.longitude,
});

export interface LatLng {
  lat: number;
  lng: number;
}

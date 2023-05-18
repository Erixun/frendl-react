import { Loader } from '@googlemaps/js-api-loader';
import { makeAutoObservable, runInAction } from 'mobx';
import { Channel } from 'pusher-js';
import { ZoneMember, ZoneStore } from './zoneStore';

export class MapStore {
  map: google.maps.Map | undefined;
  myLocation: google.maps.LatLng | null = null;
  myLocationMarker: google.maps.Marker | null = null;
  infoWindow: google.maps.InfoWindow | null = null;
  hasInfoWindowOpen = false;
  isMyLocationLoading = false;
  currentUser: ZoneMember;
  currentUserStatus = '';
  zone: ZoneStore | undefined;
  zoneId: string | undefined;
  zoneChannel: Channel | undefined;
  watchId: number | undefined;
  markers: google.maps.Marker[] = [];

  constructor(currentUser: ZoneMember) {
    this.currentUser = currentUser;
    makeAutoObservable(this);
    this.startMap();
  }

  get userLocation() {
    if (!this.myLocation) return this.currentUser.location;

    return {
      lat: this.myLocation.lat(),
      lng: this.myLocation.lng(),
    };
  }

  displayMemberLocations() {
    if (!this.map || !this.zone) return;
    const bounds = new google.maps.LatLngBounds();
    this.zone.members.forEach((member) => {
      if (!member.location)
        return console.log('Location undefined for', member.username);
      const location = new google.maps.LatLng(member.location);
      bounds.extend(location);
    });
    this.map.fitBounds(bounds);
    this.map.panTo(bounds.getCenter());
  }

  clearZone() {
    runInAction(() => {
      if (!this.zone) return;
      this.zone.clear();
      this.zone = undefined;
      this.zoneId = undefined;
      this.zoneChannel = undefined;
      this.markers.forEach((marker) => marker.setMap(null));
      this.markers = [];
    });
  }

  panTo(location: google.maps.LatLng) {
    this.map?.panTo(location);
  }

  addInfoWindowToMarkers(timeout: number = 0) {
    this.markers.forEach((marker) => {
      const infoWindow = new google.maps.InfoWindow({
        content: `<b>${marker.getTitle()}</b>` || 'Unknown',
      });

      const window = { isOpen: false };

      infoWindow.close = new Proxy(infoWindow.close, {
        apply: (target, thisArg, argumentsList) => {
          window.isOpen = false;
          return target.apply(thisArg, argumentsList as []);
        },
      });
      infoWindow.open = new Proxy(infoWindow.open, {
        apply: (target, thisArg, argumentsList) => {
          window.isOpen = true;
          return target.apply(thisArg, argumentsList as []);
        },
      });

      infoWindow.open(this.map, marker);

      if (timeout) setTimeout(() => infoWindow.close(), timeout);

      marker.addListener('click', () => {
        if (window.isOpen) return infoWindow.close();

        infoWindow.open(this.map, marker);
      });
    });
  }

  displayStatus(status: string) {
    if (!status) {
      this.currentUserStatus = '';
      console.error('No status provided');
    }
    this.currentUserStatus = `<p>${status}</p>`;
    const my = this.zone?.members.find(
      (member) => member.username === this.currentUser.username
    );
    if (!my) return console.error('No member found for current user');

    const content = `<b>${my.username}</b><br>${status}`;
    my.infoWindow?.setContent(content);
  }

  findMyLocation() {
    if (this.myLocation) {
      this.showMyLocation(this.myLocation);
      return;
    }

    runInAction(() => {
      this.isMyLocationLoading = true;
    });
    if (navigator.geolocation) {
      if (this.watchId) navigator.geolocation.clearWatch(this.watchId);

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          // if (this.myLocation) {
          //   runInAction(() => {
          //     console.log('incrementing my location');
          //     this.myLocation = new google.maps.LatLng(
          //       this.myLocation!.lat() + 0.10002,
          //       this.myLocation!.lng() + 0.10002
          //     );
          //   });
          //   return;
          // }

          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const newLocation = new google.maps.LatLng(
            location.lat,
            location.lng
          );
          // TODO: uncomment this to prevent unnecessary updates:
          if (!hasMoved(this.myLocation, newLocation)) {
            console.log('No need to update location as it has not changed');

            cancelLoading(this);
            return;
          }

          runInAction(() => {
            this.myLocation = newLocation;
          });

          //pusher event gets triggered in a useEffect
        },
        (error) => {
          console.error(error.message);
          cancelLoading(this);
        }
      );
    }

    cancelLoading(this);

    function cancelLoading(store: MapStore) {
      runInAction(() => {
        store.isMyLocationLoading = false;
      });
    }
  }

  showMyLocation(location: google.maps.LatLng | null = null) {
    if (!location) return console.error('No location provided');
    if (!this.map) return console.error('No map found');

    runInAction(() => {
      this.isMyLocationLoading = true;
    });

    this.map.setZoom(16);
    this.map.panTo(location);

    runInAction(() => {
      this.isMyLocationLoading = false;
    });
  }

  async startMap() {
    const map = await initGoogleMap();
    console.log(map);
    this.map = map;
  }
}

//TODO: move functions to a separate file

/**
 * Check if the location has moved by more than 0.0001 degrees (roughly 10m).
 * @param previousLocation The previous location (if any).
 * @param newLocation The new location.
 * @returns True or false.
 */
function hasMoved(
  previousLocation: google.maps.LatLng | null,
  newLocation: google.maps.LatLng
) {
  return previousLocation
    ? Math.abs(previousLocation.lat() - newLocation.lat()) > 0.0001 ||
        Math.abs(previousLocation.lng() - newLocation.lng()) > 0.0001
    : true;
}

async function initGoogleMap() {
  const loader = new Loader({
    apiKey: 'AIzaSyB5rk666lWxXOOS9MyAJy2dj--Eis4C5KY',
    version: 'weekly',
  });

  return loader.load().then(() => {
    const map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      MapConfig
    );

    return map;
  });
}

//TODO: move to a separate file
const MapConfig = {
  center: { lat: 59.3293, lng: 18.0686 },
  zoom: 7,
  disableDefaultUI: true,
  styles: [
    {
      featureType: 'poi.park',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

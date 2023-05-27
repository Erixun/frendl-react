import { Loader } from '@googlemaps/js-api-loader';
import { makeAutoObservable, runInAction, reaction } from 'mobx';
import { Channel } from 'pusher-js';
import { ZoneMember, ZoneStore } from './zoneStore';
import pusherClient from '../service/pusher';

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
  prevZoneId: string | undefined;
  zoneChannel: Channel | undefined;
  watchId: number | undefined;
  markers: google.maps.Marker[] = [];

  constructor(currentUser: ZoneMember) {
    this.currentUser = currentUser;
    makeAutoObservable(this);
    this.startMap();
    reaction(
      () => this.zoneId,
      (zoneId) => {
        if (!zoneId) return;
        // this.clearZone();
        this.initZone();
      }
    );
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

  initZone() {
    this.displayMemberLocations();
    pusherClient.unsubscribe(`zone-channel-${this.prevZoneId}`);

    this.zoneChannel = pusherClient.subscribe(`zone-channel-${this.zoneId}`);

    this.zoneChannel.bind('pusher:subscription_succeeded', () => {
      console.log('pusher:subscription_succeeded');
      runInAction(() => {
        this.prevZoneId = this.zoneId;
      });
    });

    this.zoneChannel.bind('location-update', (body: any) => {
      const { userId, location } = body;

      this.zone?.updateLocation(userId, location);
    });

    this.zoneChannel.bind('chat-log-update', (body: any) => {
      const { userId, entry } = body;

      console.log('chat-log-update entry', entry);
      this.zone?.appendChatLog(entry);
      this.displayMessage(entry.message, userId);
    });

    this.zoneChannel.bind('member_added', (body: any) => {
      console.log('member_added', body);
      this.zone?.addMember(body.user, true);
    });

    // this.zoneChannel.bind('pusher:member_removed', (member) => {
    //   this.setState((prevState, props) => {
    //     const newState = { ...prevState };
    //     // remove member location once they go offline
    //     delete newState.locations[`${member.id}`];
    //     // delete member from the list of online users
    //     delete newState.users_online[`${member.id}`];
    //     return newState;
    //   });
    //   notify(state);
    // });
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
        maxWidth: 300,
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

  displayMessage(message: string, userId = this.currentUser.userId) {
    const user = this.zone?.memberMap.get(userId); //.find((member) => member.userId === userId);
    if (!user) return console.error('No user found for id', userId);
    const content = `<b>${user.username}</b><br>${message}`;
    const infoWindow = user.infoWindow;
    if (!infoWindow) return console.error('No infoWindow found for user', user);

    infoWindow.setContent(content);
    infoWindow.setOptions({ maxWidth: 300 });
    infoWindow.open(this.map, user.marker);
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

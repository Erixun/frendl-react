import { Loader } from '@googlemaps/js-api-loader';
import { makeAutoObservable, runInAction } from 'mobx';
import { Channel } from 'pusher-js';

export class MapStore {
  map: google.maps.Map | undefined;
  myLocation: google.maps.LatLng | null = null;
  myLocationMarker: google.maps.Marker | null = null;
  infoWindow: google.maps.InfoWindow | null = null;
  hasInfoWindowOpen = false;
  isMyLocationLoading = false;
  myStatus = ''; //TODO: remove/move this?
  zoneId: string | undefined;
  zoneChannel: Channel | undefined;
  watchId: number | undefined;
  markers: google.maps.Marker[] = [];

  constructor() {
    makeAutoObservable(this);
    this.startMap();
  }

  //for each marker, add a google maps info window with the title of the marker
  addInfoWindowToMarkers() {
    this.markers.forEach((marker) => {
      const infoWindow = new google.maps.InfoWindow({
        content: `<b>${marker.getTitle()}</b>` || 'Unknown',
      });

      const window = { isOpen: false };

      //proxy the infoWindow close and open methods
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

      // const toggleInfoWindow = () => {
      //   if (window.isOpen) {
      //     infoWindow.close();
      //     window.isOpen = false;
      //   } else {
      //     infoWindow.open(this.map, marker);
      //     window.isOpen = true;
      //   }
      // };

      marker.addListener('click', () => {
        if (window.isOpen) {
          infoWindow.close();
          // window.isOpen = false;
        } else {
          infoWindow.open(this.map, marker);
          // window.isOpen = true;
        }
      });
    });
  }

  getLocation = () => {
    return {
      lat: this.myLocation?.lat(),
      lng: this.myLocation?.lng(),
    };
  };

  displayStatus(status: string) {
    if (!status) {
      this.myStatus = '';
      this.infoWindow?.close();
      return console.error('No status provided');
    }
    this.myStatus = `<p>${status}</p>`;
    this.infoWindow?.close();
    this.infoWindow = null;
    this.infoWindow = new google.maps.InfoWindow({
      content: status,
    });
    this.infoWindow?.open(this.map, this.myLocationMarker);
  }

  findMyLocation() {
    if (this.myLocation) {
      this.showMyLocation(this.myLocation);
      return;
    }

    this.isMyLocationLoading = true;
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
          if (!hasMoved(this.myLocation, newLocation)) {
            console.log('No need to update location as it has not changed');
            cancelLoading(this);
            return;
          }

          runInAction(() => {
            this.myLocation = newLocation;
          });
          this.showMyLocation(newLocation);

          //TODO: trigger pusher event to update location
        },
        (error) => {
          console.error(error.message);
          cancelLoading(this);
        }
      );
    }

    cancelLoading(this);
    console.error('Geolocation is not supported by this browser.');

    function cancelLoading(store: MapStore) {
      runInAction(() => {
        store.isMyLocationLoading = false;
      });
    }
  }

  showMyLocation(location: google.maps.LatLng | null = null) {
    if (!location) return console.error('No location provided');
    if (!this.map) return console.error('No map found');

    this.map.setZoom(16);
    this.map.panTo(location);
    this.myLocationMarker = new google.maps.Marker({
      position: location,
      map: this.map,
      title: 'You are here',
    });

    const contentString = `
      <div class="info-window">
        <p>Here I am!</p>
      </div>
      `;

    this.infoWindow?.close();
    this.infoWindow = null;

    this.infoWindow = new google.maps.InfoWindow({
      content: contentString,
    });

    setTimeout(() => {
      this.infoWindow?.close();
    }, 3000);

    this.infoWindow?.open(this.map, this.myLocationMarker);
    this.myLocationMarker.addListener('click', () => {
      if (this.hasInfoWindowOpen) {
        this.infoWindow?.close();
        this.hasInfoWindowOpen = false;
        return;
      }

      this.infoWindow?.open(this.map, this.myLocationMarker);
      this.hasInfoWindowOpen = true;
    });

    this.isMyLocationLoading = false;
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

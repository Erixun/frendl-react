import { Loader } from '@googlemaps/js-api-loader';
import { makeAutoObservable, runInAction } from 'mobx';

export class MapStore {
  map: google.maps.Map | undefined;
  myLocation: google.maps.LatLng | null = null;
  myLocationMarker: google.maps.Marker | null = null;
  infoWindow: google.maps.InfoWindow | null = null;
  hasInfoWindowOpen = false;
  isMyLocationLoading = false;
  myStatus = ''; //TODO: remove/move this?

  constructor() {
    makeAutoObservable(this);
    this.startMap();
  }

  displayStatus(status: string) {
    if (!status) {
      this.myStatus = '';
      this.infoWindow?.close();
      return console.error('No status provided');
    }
    this.myStatus = `<p>${status}</p>`;
    console.log('this.infoWindow', this.infoWindow);
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
      return navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('position', position);
          const myLocation = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          this.myLocation = myLocation;
          this.showMyLocation(myLocation);
        },
        (error) => {
          console.error(error.message);
          runInAction(() => {
            this.isMyLocationLoading = false;
          });
        }
      );
    }

    this.isMyLocationLoading = false;
    console.error('Geolocation is not supported by this browser.');
  }

  showMyLocation(location: google.maps.LatLng | null = null) {
    if (!location) return console.error('No location provided');
    console.log('showMyLocation()', location);
    console.log('this.map', this.map);
    this.map?.setCenter(location);
    this.map?.setZoom(13);
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

async function initGoogleMap() {
  const loader = new Loader({
    apiKey: 'AIzaSyB5rk666lWxXOOS9MyAJy2dj--Eis4C5KY',
    version: 'weekly',
  });

  return loader.load().then(() => {
    const map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
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
      }
    );

    return map;
  });
}

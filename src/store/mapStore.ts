import { Loader } from '@googlemaps/js-api-loader';
import { makeAutoObservable } from 'mobx';

export class MapStore {
  map: google.maps.Map | undefined;
  myLocation: google.maps.LatLng | null = null;
  myLocationMarker: google.maps.Marker | null = null;
  infoWindow: google.maps.InfoWindow | null = null;
  hasInfoWindowOpen = false;
  isMyLocationLoading = false;
  myStatus = '';

  constructor() {
    makeAutoObservable(this);

    this.startMap();
  }

  displayStatus(status: string) {
    if (!status) return console.error('No status provided');
    this.myStatus = `<p>${status}</p>`;
    console.log('this.infoWindow', this.infoWindow);
    this.infoWindow?.close();
    this.infoWindow = null;
    this.infoWindow = new google.maps.InfoWindow({
      content: status,
      // minWidth: 200,
    });
    this.infoWindow?.open(this.map, this.myLocationMarker);
  }

  findMyLocation() {
    if (this.myLocation) {
      this.showMyLocation(this.myLocation);
      return;
    }
    console.log('findMyLocation()');
    this.isMyLocationLoading = true;
    if (navigator.geolocation) {
      return navigator.geolocation.getCurrentPosition((position) => {
        console.log('position', position);
        const myLocation = new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );
        this.myLocation = myLocation;
        this.showMyLocation(myLocation);
      });
    }

    console.error('Geolocation is not supported by this browser.');

    // this.showMyLocation();
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
        <h1>My Location</h1>
        <p>My location is here</p>
      </div>
      `;

    this.infoWindow?.close();
    this.infoWindow = null;

    this.infoWindow = new google.maps.InfoWindow({
      content: contentString,
      minWidth: 200,
    });

    this.infoWindow?.close();
    // this.infoWindow?.open(this.map, this.myLocationMarker);
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
    // }
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
        // center: { lat: -34.397, lng: 150.644 },
        //center on Stockholm
        center: { lat: 59.3293, lng: 18.0686 },
        zoom: 7,
        // streetViewControl: false,
        // mapTypeControl: false,
        // fullscreenControl: false,
        // zoomControl: false,
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

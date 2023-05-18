import { useMapStore } from '../hooks/useMapStore';
import { MapStore } from '../store/mapStore';

const API_URL = import.meta.env.API_URL || 'http://localhost:3000/api';
const ZONE_API_URL = `${API_URL}/zone`;

export const postToEnterZone = (zoneCode: string) => {
  const map = useMapStore();
  return fetch(
    `${ZONE_API_URL}/${zoneCode}/enter`,
    provideZoneFetchOptions(map)
  ).then(handleResponse);
};

export const postToCreateZone = () => {
  const map = useMapStore();
  return fetch(ZONE_API_URL, provideZoneFetchOptions(map)).then(handleResponse);
};

//TODO: correct this
export const postToUpdateLocation = () => {
  const map = useMapStore();
  fetch(`${API_URL}/update-location`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      zoneId: map.zone?.zoneId,
      userId: map.currentUser.userId,
      location: map.userLocation,
    }),
  }).then((res) => {
    if (res.status === 200) {
      console.log('new location updated successfully');
    }
  });
};

//TODO: correct this
// export const postToExitZone = () => {
//   const map = useMapStore();
//   return fetch(
//     `${ZONE_API_URL}/${map.zoneId}/exit`,
//     provideZoneFetchOptions(map)
//   ).then(handleResponse);
// };

//TODO: implement this
// export const postToUpdateChatLog = (message: string) => {

const provideZoneFetchOptions = (map: MapStore) => {
  return {
    method: 'POST',
    body: JSON.stringify({
      userId: map.currentUser.userId,
      location: map.userLocation,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

const handleResponse = (response: Response) => {
  if (response.ok) return response.json();

  throw new Error(response.statusText);
};

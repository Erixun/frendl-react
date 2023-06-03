import { runInAction } from 'mobx';
import { useMapStore } from '../hooks/useMapStore';
import { MapStore } from '../store/mapStore';
import { ZoneChatLogEntry } from '../store/zoneStore';

const API_URL = import.meta.env.API_URL || 'http://localhost:3000/api';
const ZONE_API_URL = `${API_URL}/zone`;

export const postToEnterZone = async (zoneCode: string) => {
  const map = useMapStore();
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      zoneId: zoneCode,
      userId: map.currentUser.userId,
      location: map.userLocation,
    }),
  };
  const data = await fetch(`${API_URL}/add-zone-member`, options).then(
    handleResponse
  );

  runInAction(() => {
    map.currentUser = data.user;
    console.log('map.currentUser', map.currentUser);
  });

  const zone = await fetch(`${ZONE_API_URL}/${zoneCode}`)
    .then(handleResponse)
    .catch((error) => console.log('error', error));

  return zone;
};

export const postToCreateZone = () => {
  const map = useMapStore();
  return fetch(ZONE_API_URL, provideInitZoneOptions(map)).then(handleResponse);
};

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
  })
    .then((res) => {
      if (res.status === 200) {
        console.log('new location updated successfully');
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

export const deleteZoneMember = () => {
  const map = useMapStore();
  fetch(`${API_URL}/delete-zone-member`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      zoneId: map.zone?.zoneId,
      userId: map.currentUser.userId,
    }),
  })
    .then(handleResponse)
    .catch((err) => {
      console.log(err);
    });
};

//TODO: implement this
// export const postToExitZone = () => {
//   const map = useMapStore();
//   return fetch(
//     `${ZONE_API_URL}/${map.zoneId}/exit`,
//     provideInitZoneOptions(map)
//   ).then(handleResponse);
// };

export const postToUpdateChatLog = (
  zoneId: string,
  entry: ZoneChatLogEntry
) => {
  fetch(`${API_URL}/update-chat-log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      zoneId: zoneId,
      userId: entry.userId,
      entry: entry,
    }),
  })
    .then((res) => {
      if (res.status === 200) {
        console.log('new chat log entry posted successfully');
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const provideInitZoneOptions = (map: MapStore) => {
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

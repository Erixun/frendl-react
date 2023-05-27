import { ZoneLocation } from './store/zoneStore';

const currentUser = {
  userId: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  username: 'Erik Emanuel',
  status: 'online',
  message: '',
  location: {
    lat: 59.35,
    lng: 18.04,
  },
};

const members = [
  currentUser,
  {
    userId: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bef',
    username: 'Melvin Moore',
    status: 'offline',
    statusMessage: '',
    location: {
      lat: 59.36,
      lng: 18.05,
    },
  },
  {
    userId: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bee',
    username: 'Malva Melin',
    status: 'online',
    statusMessage: '',
    location: {
      lat: 59.365,
      lng: 18.07,
    },
  },
];

const Stockholm = {
  lat: 59.3293,
  lng: 18.0686,
};

//Write a function to return a random location within a given radius of a given location
//https://stackoverflow.com/questions/5837572/generate-a-random-point-within-a-circle-uniformly
//https://stackoverflow.com/questions/1253499/simple-calculations-for-working-with-lat-lon-and-km-distance
const getRandomLocation = (center: ZoneLocation, radius: number) => {
  const y0 = center.lat;
  const x0 = center.lng;
  const rd = radius / 111300; //about 111300 meters in one degree

  const u = Math.random();
  const v = Math.random();

  const w = rd * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  const xp = x / Math.cos(y0);

  return {
    lat: y + y0,
    lng: xp + x0,
  };
};

export { currentUser, members };

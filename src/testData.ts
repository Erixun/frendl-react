const currentUser = {
  //generate a real uuid:
  //https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  userId: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  username: 'Erik Emanuel',
  status: 'online',
  statusMessage: '',
  location: {
    lat: 59.35,
    lng: 18.04,
  },
};

const members = [
  // {
  //   username: 'Erik Emanuel',
  //   status: 'online',
  //   location: {
  //     lat: 59.35,
  //     lng: 18.04,
  //   },
  // },
  currentUser,
  {
    userId: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bee',
    username: 'Melvin Moore',
    status: 'offline',
    statusMessage: '',
    location: {
      lat: 59.36,
      lng: 18.05,
    },
  },
  {
    userId: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bef',
    username: 'Malva Melin',
    status: 'online',
    statusMessage: '',
    location: {
      lat: 59.365,
      lng: 18.07,
    },
  },
];

export { currentUser, members };

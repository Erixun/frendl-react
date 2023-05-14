import Pusher from 'pusher-js';

const pusherClient = new Pusher('1810da9709de2631e7bc', {
  authEndpoint: 'http://localhost:3000/api/pusher/auth',
  cluster: 'eu',
});

export default pusherClient;

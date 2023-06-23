import Pusher from 'pusher-js';
const API_URL = import.meta.env.VITE_API_URL

const pusherClient = new Pusher('1810da9709de2631e7bc', {
  authEndpoint: `${API_URL}/pusher/auth}`,
  //'http://localhost:3000/api/pusher/auth',
  cluster: 'eu',
});

export default pusherClient;

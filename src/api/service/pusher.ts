import Pusher from 'pusher';
import pusherOptions from '../config/pusherOptions';

let pusher = new Pusher(pusherOptions);

export default pusher;

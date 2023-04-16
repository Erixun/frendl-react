import { Router } from 'express';
import zoneRouter from './zoneRouter';
import pusher from '../service/pusher';

const router = Router();

router.use('/zone', zoneRouter);

router.post('/pusher/auth', (req, res) => {
  let socketId = req.body.socket_id;
  let channel = req.body.channel_name;
  let random_string = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substring(0, 5);
  let presenceData = {
    user_id: random_string,
    user_info: {
      username: '@' + random_string,
    },
  };
  let auth = pusher.authorizeChannel(socketId, channel, presenceData);
  res.send(auth);
});

router.post('/update-location', (req, res) => {
  // trigger a new post event via pusher
  pusher.trigger('presence-channel', 'location-update', {
    username: req.body.username,
    location: req.body.location,
  });
  res.json({ status: 200 });
});

export default router;

import { Router } from 'express';
import zoneRouter from './zoneRouter';
import pusher from '../service/pusher';

const router = Router();

router.use('/zone', zoneRouter);

router.post('/pusher/auth', (req, res) => {
  console.log('pusher/auth', req.body);
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
  return res.json({
    status: 200,
    message: 'Not triggering pusher event right now...',
  });
  const { zoneId, username, location } = req.body;
  console.log('/update-location', req.body);
  // trigger a new post event via pusher
  // pusher
  //   .trigger(`zone-channel-${zoneId}`, 'location-update', {
  //     username: username,
  //     location: location,
  //   })
  //   .then(() => {
  //     console.log('pusher.trigger success');
  //     res.json({ status: 200 });
  //   })
  //   .catch((err) => {
  //     console.log('pusher.trigger error', err);
  //     res.json({ status: 500 });
  //   });
});

export default router;

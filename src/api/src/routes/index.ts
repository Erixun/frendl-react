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
  const { zoneId, userId, location } = req.body;

  pusher
    .trigger(`zone-channel-${zoneId}`, 'location-update', {
      userId: userId,
      location: location,
    })
    .then(() => {
      console.log('pusher.trigger success');
      res.json({ status: 200 });
    })
    .catch((err) => {
      console.log('pusher.trigger error', err);
      res.json({ status: 500 });
    });
});

router.post('/update-chat-log', (req, res) => {
  const { zoneId, userId, entry } = req.body;

  pusher
    .trigger(`zone-channel-${zoneId}`, 'chat-log-update', {
      userId: userId,
      entry: entry,
    })
    .then(() => {
      console.log('pusher.trigger success for chat-log-update');
      res.json({ status: 200 });
    })
    .catch((err) => {
      console.log('pusher.trigger error', err);
      res.json({ status: 500 });
    });
});

router.post('/add-zone-member', (req, res) => {
  const { zoneId, userId, user } = req.body;
  console.log(req.body);

  pusher
    .trigger(`zone-channel-${zoneId}`, 'member_added', {
      userId: userId,
      user: user,
    })
    .then(() => {
      console.log('pusher.trigger success for member_added');
      res.json({ status: 200 });
    })
    .catch((err) => {
      console.log('pusher.trigger error', err);
      res.json({ status: 500 });
    });
});

export default router;

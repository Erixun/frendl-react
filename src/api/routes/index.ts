import { Router } from 'express';
import zoneRouter from './zoneRouter';
import pusher from '../service/pusher';
import { generateUser } from '../utils/generateUsername';
import ZoneDB from '../ZoneDB';

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
      ZoneDB.get(zoneId)?.chatLog.push(entry);
      res.json({ status: 200 });
    })
    .catch((err) => {
      console.log('pusher.trigger error', err);
      res.json({ status: 500 });
    });
});

router.post('/add-zone-member', (req, res) => {
  const { zoneId, location } = req.body;
  const user = generateUser(location);

  pusher
    .trigger(`zone-channel-${zoneId}`, 'member_added', {
      userId: user.userId,
      user: user,
    })
    .then(() => {
      console.log('pusher.trigger success for member_added');
      //TODO: add user to real db
      // ZoneDB.addUserToZone(zoneId, user);
      ZoneDB.get(zoneId)?.members.push(user);
      res.json({ status: 200, user: user });
    })
    .catch((err) => {
      console.log('pusher.trigger error', err);
      res.json({ status: 500 });
    });
});

router.delete('/delete-zone-member', (req, res) => {
  const { zoneId, userId } = req.body;
  console.log('delete-zone-member', req.body)
  // const user = generateUser(location);

  pusher
    .trigger(`zone-channel-${zoneId}`, 'member_deleted', {
      userId: userId,
    })
    .then(() => {
      console.log('pusher.trigger success for member_deleted');
      //Remove user from ZoneDB
      const zone = ZoneDB.get(zoneId);
      if (!zone) return res.json({ status: 400, message: 'Zone not found' });

      const isZoneMember = zone.members.some(
        (member) => member.userId === userId
      );
      if (!isZoneMember)
        return res.json({ status: 400, message: 'User not in zone' });

      zone.members = zone.members.filter((member) => member.userId !== userId);
    
      res.json({ status: 200, userId: userId });
    })
    .catch((err) => {
      console.log('pusher.trigger error', err);
      res.json({ status: 500 });
    });
});

export default router;

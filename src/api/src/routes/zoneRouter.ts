import { Router } from 'express';
import { isValidZoneId } from '../middleware/isValidZoneId';

const zoneRouter = Router();

//Create a new zone
zoneRouter.post('/', (req, res) => {
  //Generate a new zone id with 7 characters, digits and uppercase letters
  const zoneId = Math.random().toString(36).substring(2, 9).toUpperCase();
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  const createdBy = 'user1';
  //TODO: create a new zone in the database
  const responseObject = {
    message: 'Zone created successfully',
    zoneId,
    createdAt,
    updatedAt,
    createdBy,
  };
  res.send(responseObject);
});

//Retrieve zone by id
zoneRouter.get('/:id', isValidZoneId, (req, res) => {
  //TODO: validate zone id
  const zoneId = req.params.id;
  // if (!validateZoneId(zoneId)) {
  //   res.status(400).send('Invalid zone id');
  //   return;
  // }
  //TODO: retrieve zone from database

  res.send(`Zone ID ${zoneId} is valid! But does it exist...?`);
});

//Invite user(s) to zone
zoneRouter.post('/:id/invite', isValidZoneId, (req, res) => {
  console.log('req.body', req.body);
  const invitees = req.body.invitees;
  const zoneId = req.params.id;

  //TODO:
  const emailAddresses = invitees.map((invitee: any) => invitee.emailAddress);

  const messageToSend = `You have been invited to join zone ${zoneId} by user1. Please click the link below to join the zone.`;

  res.send('Invitation sent!');
});

zoneRouter.get('/:id/member', isValidZoneId, (req, res) => {
  const zoneId = req.params.id;
  //TODO: retrieve members from database
  res.send(`Members of zone ${zoneId}: ...`);
});

export default zoneRouter;

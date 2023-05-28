import { Router } from 'express';
import { isValidZoneId } from '../middleware/isValidZoneId';
import {
  generateUserColor,
  generateUserId,
  generateUsername,
} from '../utils/generateUsername';
import ZoneDB from '../ZoneDB';

const zoneRouter = Router();

export interface ZoneDto {
  message: string;
  zoneId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  members: Member[];
}

export interface Member {
  userId: string;
  username: string;
  status: string;
  location: Location;
}

export interface Location {
  lat: number;
  lng: number;
}

//Create a new zone
zoneRouter.post('/', (req, res) => {
  //Generate a new zone id with 7 characters, digits and uppercase letters
  const zoneId = generateZoneId(); //Math.random().toString(36).substring(2, 9).toUpperCase();

  //TODO: check if zone id already exists in database
  //if it does, generate a new one

  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  const createdBy = 'Erik Emanuel';
  console.log('req.body', req.body);

  console.log('user location: ', req.body.location ?? 'undefined');

  const members = [
    {
      userId: req.body.userId || '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
      username: createdBy,
      userColor: generateUserColor(0),
      status: 'online',
      location: req.body.location,
    },
    {
      userId: generateUserId(), //'1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bef',
      username: generateUsername(),
      userColor: generateUserColor(1),
      status: 'offline',
      location: {
        lat: 59.36,
        lng: 18.05,
      },
    },
    {
      userId: generateUserId(), //'1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bee',
      username: generateUsername(),
      userColor: generateUserColor(2),
      status: 'offline',
      location: {
        lat: 59.365,
        lng: 18.1,
      },
    },
  ];

  //TODO: create a new zone in the database
  const responseObject = {
    message: 'Zone created successfully',
    zoneId,
    createdAt,
    updatedAt,
    createdBy,
    members,
    chatLog: [],
  };

  ZoneDB.set(zoneId, responseObject);

  res.send(responseObject);
});

//Retrieve zone by id
zoneRouter.get('/:id', isValidZoneId, (req, res) => {
  const zoneId = req.params.id;
  //TODO: retrieve zone from REAL database
  const zone = ZoneDB.get(zoneId);
  //The zone should contain the following properties:
  //zoneId, createdAt, updatedAt, createdBy, members, invitees
  //as well as positions of all members, status of all members, chat history, etc.
  //(online, offline, in zone, not in zone, etc.)
  //
  //if zone does not exist, send 404

  if (zone) return res.send(zone);

  res.status(404).send(`Zone ID ${zoneId} is valid! But does it exist...?`);
});

//Invite user(s) to zone
//TODO: determine if necessary
zoneRouter.post('/:id/invite', isValidZoneId, (req, res) => {
  console.log('req.body', req.body);
  const invitees = req.body.invitees;
  const zoneId = req.params.id;

  //TODO:
  const emailAddresses = invitees.map((invitee: any) => invitee.emailAddress);

  const messageToSend = `You have been invited to join zone ${zoneId} by user1. Please click the link below to join the zone.`;

  res.send('Invitation sent!');
});

zoneRouter.get('/:id/members', isValidZoneId, (req, res) => {
  const zoneId = req.params.id;
  //TODO: retrieve members from database
  res.send(`Members of zone ${zoneId}: ...`);
});

//Request to enter zone
zoneRouter.post('/:id/enter', isValidZoneId, (req, res) => {
  const zoneId = req.params.id;

  //if is member, enter zone
  //if not member, send request to zone owner

  res.send({ message: `Request to enter zone ${zoneId} sent!` });
});

//Request to exit zone
zoneRouter.post('/:id/exit', isValidZoneId, (req, res) => {
  const zoneId = req.params.id;

  //if is member, exit zone
  //if not member, send bad request

  res.send({ message: `Request to exit zone ${zoneId} sent!` });
});

/**
 * Generates a random zone id with 7 characters,
 * digits and uppercase letters.
 * @returns A random zone id.
 */
export function generateZoneId() {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
}

export default zoneRouter;

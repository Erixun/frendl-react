import { NextFunction, Request, Response } from 'express';
// import { validateZoneId } from '../routes/zoneRouter';

//TODO: use middleware to validate zone id?

export function isValidZoneId(req: Request, res: Response, next: NextFunction) {
  const zoneId = req.params.id;
  if (!validateZoneId(zoneId)) {
    res.status(400).send('Invalid zone ID');
    return;
  }
  next();
}

//function to validate zone id with 7 characters including digits and uppercase letters
const ZONE_ID_REGEX = /^[A-Z0-9]{7}$/;

export const validateZoneId = (zoneId: string) => {
  return ZONE_ID_REGEX.test(zoneId);
};

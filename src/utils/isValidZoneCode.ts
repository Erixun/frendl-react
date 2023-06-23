/**
 * Validate zone code as consisting of 7 alphanumeric characters.
 */
const isValidZoneCode = (id: string) => {
  return /^[A-Z0-9]{7}$/.test(id);
};

export default isValidZoneCode;

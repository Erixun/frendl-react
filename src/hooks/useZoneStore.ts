import { useMapStore } from './useMapStore';

const useZoneStore = () => {
  const zone = useMapStore().zone;
  if (zone) return zone;

  throw new Error('Zone is not defined');
};

export { useZoneStore };

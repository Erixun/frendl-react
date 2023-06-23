import { MapStore } from '../store/mapStore';
import { currentUser } from '../testData';

const Store = {
  mapStore: undefined as MapStore | undefined,
};

const useMapStore = () => {
  return Store.mapStore ?? (Store.mapStore = new MapStore(currentUser));
};

export { useMapStore };

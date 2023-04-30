import { MapStore } from './store/mapStore';
import { observer } from 'mobx-react-lite';
import DrawerWelcome from './components/DrawerWelcome';
import { useDisclosure } from '@chakra-ui/react';
import GridMapOverlay from './components/GridMapOverlay';
import { currentUser } from './testData';
import './App.css';

const mapStore = new MapStore(currentUser);
mapStore.findMyLocation();
const App = observer(() => {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  return (
    <div className="App">
      <DrawerWelcome map={mapStore} isOpen={isOpen} onClose={onClose} />
      {/* TODO: Create ViewZone component? */}
      <div id="map" className="map"></div>
      {!isOpen && <GridMapOverlay map={mapStore} onOpenDrawer={onOpen} />}
    </div>
  );
});

export default App;

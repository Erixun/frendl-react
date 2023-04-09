import { useState } from 'react';
import { MapStore } from './store/mapStore';
import { observer } from 'mobx-react-lite';
import DrawerWelcome from './components/DrawerWelcome';
import { useDisclosure } from '@chakra-ui/react';
import GridMapOverlay from './components/GridMapOverlay';
import './App.css';

const mapStore = new MapStore();
mapStore.findMyLocation();
const App = observer(() => {
  const [status, setStatus] = useState('');

  const findMe = () => {
    mapStore.findMyLocation();
    console.log(mapStore.isMyLocationLoading);
  };

  const submitStatus = (e: any) => {
    e.preventDefault();
    console.log('submitStatus');
    console.log(status);
    mapStore.displayStatus(status);
    setStatus('');
  };

  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const toggleDrawer = () => {
    console.log('toggleDrawer');
    console.log(isOpen);
    isOpen ? onClose() : onOpen();
  };

return (
    <div className="App">
      <div className="btn-gang">
        <button className="btn-drawer" onClick={toggleDrawer}>
          Toggle Drawer
        </button>
        <button className="btn-findme" onClick={findMe}>
          {mapStore.isMyLocationLoading ? 'Searching...' : 'Find Me'}
        </button>
      </div>
      <DrawerWelcome isOpen={isOpen} onClose={onClose} />
      {/* TODO: Create ViewZone component? */}
      <div id="map" className="map"></div>
      <GridMapOverlay />

      {/* TODO: Create component */}
      <div className="status-messenger">
        <form onSubmit={submitStatus}>
          <div className="input-wrapper">
            <input
              className="input-status"
              type="text"
              placeholder="Enter your status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default App;

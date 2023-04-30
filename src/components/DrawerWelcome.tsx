import { ArrowForwardIcon } from '@chakra-ui/icons';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from '@chakra-ui/react';

import {
  Input,
  Button,
  FormControl,
  FormLabel,
  HStack,
  VStack,
  Container,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useState } from 'react';
import { MapStore } from '../store/mapStore';
import { runInAction } from 'mobx';
import { ZoneLocation, createZone } from '../store/zoneStore';
import { members as fakeMembers } from '../testData';

const DrawerWelcome = ({
  map,
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  map: MapStore;
}) => {
  const [zoneCode, setZoneCode] = useState('');
  const [isAboutToEnter, setIsAboutToEnter] = useState(false);
  const [errorEnterZone, setErrorEnterZone] = useState('');
  const [successEnterZone, setSuccessEnterZone] = useState('');
  const [isAboutToCreate, setIsAboutToCreate] = useState(false);
  const [errorCreateZone, setErrorCreateZone] = useState('');
  const [successCreateZone, setSuccessCreateZone] = useState('');

  const onClickToEnter = () => {
    console.log('onClickToEnter');
    setIsAboutToEnter(true);
    fetch(
      `http://localhost:3000/api/zone/${zoneCode}/enter`,
      provideZoneFetchOptions(map.userLocation)
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        runInAction(() => {
          map.zone = createZone(map, data);
          map.zoneId = data.zoneId;
        });
        setSuccessEnterZone(`Request approved! Entering Zone...`);
        setTimeout(() => {
          onClose();
          setSuccessEnterZone('');
        }, 2000);
      })
      .catch((error) => {
        setErrorEnterZone('Could not enter that Zone');
        setTimeout(() => {
          setErrorEnterZone('');
        }, 3000);
        console.log(error);
      })
      .finally(() => {
        setIsAboutToEnter(false);
      });
  };

  const onClickToCreate = () => {
    setIsAboutToCreate(true);
    fetch(
      'http://localhost:3000/api/zone',
      provideZoneFetchOptions(map.userLocation)
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        runInAction(() => {
          map.zone = createZone(map, data);
          map.zoneId = data.zoneId;
          // const members = data.members || fakeMembers;
          // //create a google maps marker for each member location
          // members.forEach((member: any) => {
          //   const marker = new google.maps.Marker({
          //     position: member.location,
          //     map: map.map,
          //     title: member.username,
          //   });
          //   map.markers.push(marker);
          // });
          // map.placeMarkers();
          // map.addInfoWindowToMarkers();
        });
        setSuccessCreateZone('Zone created! Entering now...');
        setTimeout(() => {
          onClose();
          setSuccessCreateZone('');
        }, 2000);
      })
      .catch((error) => {
        setErrorCreateZone('Unable to create Zone');
        setTimeout(() => {
          setErrorCreateZone('');
        }, 3000);
        console.log(error);
      })
      .finally(() => {
        setIsAboutToCreate(false);
      });
  };

  const handleZoneCode = (e: any) => {
    setZoneCode(e.target.value.toUpperCase());
  };

  /**
   * Validate zone code as consisting of 7 alphanumeric characters
   */
  const isValidZoneCode = () => {
    return /^[A-Z0-9]{7}$/.test(zoneCode);
  };

  return (
    <Drawer
      isFullHeight={true}
      isOpen={isOpen}
      placement="left"
      size={'full'}
      onClose={onClose}
    >
      <DrawerOverlay>
        <DrawerContent>
          <Container centerContent minH={'full'}>
            <DrawerHeader fontSize={30}>Welcome to Frendl</DrawerHeader>
            <DrawerBody position={'relative'} display={'flex'}>
              <VStack gap={5} position={'relative'} margin={'auto'}>
                <div
                  style={{
                    position: 'absolute',
                    top: '-40%',
                    left: 0,
                    right: 0,
                  }}
                >
                  {errorEnterZone && (
                    <Alert status="error">
                      <AlertIcon />
                      {errorEnterZone}
                    </Alert>
                  )}
                  {successEnterZone && (
                    <Alert status="success">
                      <AlertIcon />
                      {successEnterZone}
                    </Alert>
                  )}
                </div>
                <FormControl>
                  <FormLabel fontWeight={'bold'}>Enter a Zone</FormLabel>
                  <HStack>
                    <Input
                      placeholder="Zone Code, e.g. X7YBF32"
                      maxLength={7}
                      value={zoneCode}
                      onChange={handleZoneCode}
                    />
                    <Button
                      isDisabled={!isValidZoneCode()}
                      isLoading={isAboutToEnter}
                      onClick={onClickToEnter}
                      colorScheme="teal"
                      rightIcon={<ArrowForwardIcon />}
                      flexShrink={0}
                    >
                      ENTER
                    </Button>
                  </HStack>
                </FormControl>
                <p>OR</p>
                <Button
                  isLoading={isAboutToCreate}
                  loadingText={'Creating Zone...'}
                  onClick={onClickToCreate}
                  colorScheme="blue"
                  width={'180px'}
                >
                  Create your own
                </Button>
                {errorCreateZone && (
                  <Alert status="error" position={'absolute'} top={'105%'}>
                    <AlertIcon />
                    {errorCreateZone}
                  </Alert>
                )}
                {successCreateZone && (
                  <Alert status="success" position={'absolute'} top={'105%'}>
                    <AlertIcon />
                    {successCreateZone}
                  </Alert>
                )}
              </VStack>
            </DrawerBody>
          </Container>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

const provideZoneFetchOptions = (location?: ZoneLocation) => {
  return {
    method: 'POST',
    body: JSON.stringify({
      location,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

export default DrawerWelcome;

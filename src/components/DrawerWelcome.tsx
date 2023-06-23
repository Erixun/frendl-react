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
} from '@chakra-ui/react';
import { SetStateAction, useState } from 'react';
import { MapStore } from '../store/mapStore';
import { runInAction } from 'mobx';
import { Zone, createZone } from '../store/zoneStore';
import AlertZone from './AlertZone';
import { postToCreateZone, postToEnterZone } from '../service/ws';
import isValidZoneCode from '../utils/isValidZoneCode';

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

  const handleZoneError =
    (setError: (value: SetStateAction<string>) => void, action: string) =>
    (err: Error) => {
      setError(`Unable to ${action} Zone`);
      setTimeout(() => {
        setError('');
      }, 3000);
      console.log(err);
    };

    const initZone = (data: Zone) => {
      runInAction(() => {
        map.zone = createZone(map, data);
        map.zoneId = data.zoneId;
      });
    };

  const onClickToEnter = () => {
    setIsAboutToEnter(true);
    postToEnterZone(zoneCode)
      .then((data) => {
        initZone(data);
        setSuccessEnterZone(`Request approved! Entering Zone...`);
        setTimeout(() => {
          onClose();
          setSuccessEnterZone('');
        }, 2000);
      })
      .catch(handleZoneError(setErrorEnterZone, 'enter'))
      .finally(() => {
        setIsAboutToEnter(false);
      });
  };

  const onClickToCreate = () => {
    setIsAboutToCreate(true);
    postToCreateZone()
      .then((data) => {
        initZone(data);
        setSuccessCreateZone('Zone created! Entering now...');
        setTimeout(() => {
          onClose();
          setSuccessCreateZone('');
        }, 2000);
      })
      .catch(handleZoneError(setErrorCreateZone, 'create'))
      .finally(() => {
        setIsAboutToCreate(false);
      });
  };

  const handleZoneCode = (e: any) => {
    setZoneCode(e.target.value.toUpperCase());
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
            <DrawerHeader fontSize={30} textAlign={'center'}>
              <h1 style={{ fontSize: 'inherit' }}>Welcome to Frendl</h1>
              <em style={{ fontSize: '0.5em' }}>Where friends come to zone</em>
            </DrawerHeader>
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
                    <AlertZone message={errorEnterZone} status={'error'} />
                  )}
                  {successEnterZone && (
                    <AlertZone message={successEnterZone} status={'success'} />
                  )}
                </div>
                <FormControl>
                  <FormLabel fontWeight={'bold'}>Enter a Zone</FormLabel>
                  <HStack>
                    <Input
                      placeholder="E.g. X7YBF32"
                      maxLength={7}
                      value={zoneCode}
                      onChange={handleZoneCode}
                    />
                    <Button
                      isDisabled={!isValidZoneCode(zoneCode) || Boolean(successEnterZone)}
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
                  isDisabled={Boolean(successCreateZone)}
                  loadingText={'Creating Zone...'}
                  onClick={onClickToCreate}
                  colorScheme="blue"
                  width={'180px'}
                >
                  {successCreateZone? 'Success!' : 'Create your own'}
                </Button>
                {errorCreateZone && (
                  <AlertZone
                    message={errorCreateZone}
                    status={'error'}
                    style={{ position: 'absolute', top: '105%' }}
                  />
                )}
                {successCreateZone && (
                  <AlertZone
                    message={successCreateZone}
                    status={'success'}
                    style={{ position: 'absolute', top: '105%' }}
                  />
                )}
              </VStack>
            </DrawerBody>
          </Container>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

export default DrawerWelcome;

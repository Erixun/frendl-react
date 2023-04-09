//import Drawer from Chakra
import { ArrowForwardIcon, SunIcon, AddIcon } from '@chakra-ui/icons';
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  SlideFade,
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
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useState } from 'react';

const DrawerWelcome = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [zoneCode, setZoneCode] = useState('');
  const [isAboutToEnter, setIsAboutToEnter] = useState(false);
  const [errorEnterZone, setErrorEnterZone] = useState('');
  const [isAboutToCreate, setIsAboutToCreate] = useState(false);
  const [errorCreateZone, setErrorCreateZone] = useState('');
  const onClickToEnter = () => {
    console.log('onClickToEnter');
    setIsAboutToEnter(true);
    fetch('http://localhost:3000/api/zone/enter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zoneCode: zoneCode,
      }),
    })
      .then((response) => {
        console.log(response);
        return response.json();
      })
      .then((data) => {
        console.log(data);
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
    console.log('onClickToCreate');
    setIsAboutToCreate(true);
    fetch('http://localhost:3000/api/zone/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zoneCode: zoneCode,
      }),
    })
      .then((response) => {
        console.log(response);
        return response.json();
      })
      .then((data) => {
        console.log(data);
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
    console.log(e.target.value);
    setZoneCode(e.target.value.toUpperCase());
  };

  const isValidZoneCode = () => {
    return zoneCode.length === 7;
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
                <div style={{ position: 'absolute', top: '-30%', left: 0, right: 0 }}>
                  {errorEnterZone && (
                    <Alert status="error">
                      <AlertIcon />
                      {/* <AlertTitle>
                  </AlertTitle> */}
                      {errorEnterZone}
                      {/* <AlertDescription>
                    Your Chakra experience may be degraded.
                  </AlertDescription> */}
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
                  {/* leftIcon={<AddIcon/>}> */}
                  Create your own
                </Button>
                {errorCreateZone && (
                  <Alert status="error" position={'absolute'} top={'105%'}>
                    <AlertIcon />
                    {errorCreateZone}
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

export default DrawerWelcome;

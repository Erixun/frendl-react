import { Alert, AlertIcon, AlertStatus } from '@chakra-ui/react';
import { CSSProperties } from 'react';

const AlertZone = ({
  message,
  status,
  style,
}: {
  message: string;
  status: AlertStatus;
  style?: CSSProperties;
}) => {
  return (
    <Alert status={status} borderRadius={4} style={style}>
      <AlertIcon />
      {message}
    </Alert>
  );
};

export default AlertZone;

import { Button } from '@chakra-ui/react';
import { ChangeEvent, KeyboardEvent, useEffect, useRef } from 'react';

const ZoneMessenger = ({
  submitStatus,
  dismissOnEsc,
  handleChange,
  value,
}: ZoneMessengerProps) => {
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="status-messenger">
      <form onSubmit={submitStatus} onKeyDown={dismissOnEsc}>
        <div className="input-wrapper">
          <input
            name="message"
            ref={inputRef}
            autoFocus
            className="input-status"
            type="text"
            placeholder="Enter a message..."
            value={value}
            onChange={handleChange}
          />
          <Button type={'submit'} colorScheme="blue" size={'sm'}>
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

type ZoneMessengerProps = {
  submitStatus: (e: any) => void;
  dismissOnEsc: (e: KeyboardEvent<HTMLFormElement>) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  value: string;
};

export default ZoneMessenger;

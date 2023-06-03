import { TypeOptions, toast } from 'react-toastify';

export const notify = (msg: string, type: TypeOptions = 'success') => {
  return toast(msg, {
    position: 'bottom-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    type: type,
  });
};

export default notify;

import { toast } from 'react-toastify';

export const notify = (msg: string) => {
  return toast(msg, {
    position: 'bottom-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    type: 'success',
  });
};

export default notify;

import { ReactNode } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export const notice = {
  info: (message: ReactNode) =>
    notifications.show({
      message,
      autoClose: 8000,
    }),
  success: (message: ReactNode) =>
    notifications.show({
      message,
      autoClose: 5000,
      icon: <IconCheck size="1.125rem" />,
      color: 'teal',
    }),
  error: (message: ReactNode) =>
    notifications.show({
      message,
      autoClose: 20000,
      icon: <IconX size="1.125rem" />,
      color: 'red',
    }),
};

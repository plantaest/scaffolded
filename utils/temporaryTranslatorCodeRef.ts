import { appConfig } from '@/utils/appConfig';

export const temporaryTranslatorCodeRef = { current: appConfig.DEFAULT_EDITOR_VALUE } as {
  current: string;
};

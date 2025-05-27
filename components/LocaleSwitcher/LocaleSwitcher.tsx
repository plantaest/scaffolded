import { IconWorld } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
import { ActionIcon, Menu, MenuDropdown, MenuItem, MenuTarget, Tooltip } from '@mantine/core';
import { Locale } from '@/i18n/config';
import { setUserLocale } from '@/services/locale';

interface LocaleOption {
  value: Locale;
  label: string;
}

const locales: LocaleOption[] = [
  {
    value: 'en',
    label: 'English',
  },
  {
    value: 'vi',
    label: 'Tiếng Việt',
  },
];

export function LocaleSwitcher() {
  const t = useTranslations();
  const currentLocale = useLocale();

  const handleSelect = async (value: Locale) => {
    await setUserLocale(value);
  };

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <MenuTarget>
        <Tooltip label={t('ui.languages')}>
          <ActionIcon variant="default">
            <IconWorld style={{ width: '70%', height: '70%' }} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      </MenuTarget>
      <MenuDropdown>
        {locales.map((locale) => (
          <MenuItem
            key={locale.value}
            color={currentLocale === locale.value ? 'blue' : undefined}
            fw={currentLocale === locale.value ? 600 : undefined}
            onClick={() => handleSelect(locale.value)}
          >
            {locale.label}
          </MenuItem>
        ))}
      </MenuDropdown>
    </Menu>
  );
}

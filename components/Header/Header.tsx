'use client';

import { IconInfoCircle, IconSlash } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import {
  ActionIcon,
  Box,
  Card,
  Group,
  Kbd,
  SimpleGrid,
  Text,
  Tooltip,
  TooltipGroup,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import { LocaleSwitcher } from '@/components/LocaleSwitcher/LocaleSwitcher';
import { Logo } from '@/components/Logo/Logo';

export function Header() {
  const t = useTranslations();

  const handleClickHotkeysButton = () => {
    modals.open({
      title: <Text fw={600}>{t('ui.hotkeys')}</Text>,
      size: 'xs',
      children: (
        <SimpleGrid cols={2}>
          <Box>
            <Kbd>Ctrl/Cmd</Kbd> + <Kbd>U</Kbd>
          </Box>
          <Text>{t('ui.save')}</Text>
          <Box>
            <Kbd>Ctrl/Cmd</Kbd> + <Kbd>I</Kbd>
          </Box>
          <Text>{t('ui.focusUrlInput')}</Text>
          <Box>
            <Kbd>Ctrl/Cmd</Kbd> + <Kbd>J</Kbd>
          </Box>
          <Text>{t('ui.run')}</Text>
          <Box>
            <Kbd>Ctrl/Cmd</Kbd> + <Kbd>K</Kbd>
          </Box>
          <Text>{t('ui.test')}</Text>
        </SimpleGrid>
      ),
    });
  };

  return (
    <Card withBorder radius="md" mih="fit-content">
      <Group justify="space-between">
        <Logo size={150} />

        <Group gap="xs">
          <TooltipGroup openDelay={500} closeDelay={100}>
            <LocaleSwitcher />
            <ColorSchemeToggle />
            <Tooltip label={t('ui.hotkeys')}>
              <ActionIcon variant="default" onClick={handleClickHotkeysButton}>
                <IconSlash style={{ width: '70%', height: '70%' }} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t('ui.about')}>
              <ActionIcon variant="default">
                <IconInfoCircle style={{ width: '70%', height: '70%' }} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
          </TooltipGroup>
        </Group>
      </Group>
    </Card>
  );
}

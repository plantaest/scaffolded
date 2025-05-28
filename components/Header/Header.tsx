import { IconInfoCircle, IconSlash } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { ActionIcon, Card, Group, Tooltip, TooltipGroup } from '@mantine/core';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import { LocaleSwitcher } from '@/components/LocaleSwitcher/LocaleSwitcher';
import { Logo } from '@/components/Logo/Logo';

export function Header() {
  const t = useTranslations();

  return (
    <Card withBorder radius="md" mih="fit-content">
      <Group justify="space-between">
        <Logo size={150} />

        <Group gap="xs">
          <TooltipGroup openDelay={500} closeDelay={100}>
            <LocaleSwitcher />
            <ColorSchemeToggle />
            <Tooltip label={t('ui.hotkeys')}>
              <ActionIcon variant="default">
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

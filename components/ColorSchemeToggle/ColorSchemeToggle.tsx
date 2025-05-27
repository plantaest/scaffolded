'use client';

import { useState } from 'react';
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';
import { ActionIcon, Tooltip, useMantineColorScheme } from '@mantine/core';
import { useMounted } from '@mantine/hooks';

const colorSchemeValues = ['auto', 'light', 'dark'] as const;

export function ColorSchemeToggle() {
  const mounted = useMounted();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const initialColorSchemeValueIndex = colorSchemeValues.findIndex(
    (value) => value === colorScheme
  );
  const [colorSchemeValueIndex, setColorSchemeValueIndex] = useState(initialColorSchemeValueIndex);

  const handleToggleColorSchemeButton = () => {
    const properColorSchemeValueIndex = colorSchemeValueIndex >= 2 ? 0 : colorSchemeValueIndex + 1;
    setColorSchemeValueIndex(properColorSchemeValueIndex);
    setColorScheme(colorSchemeValues[properColorSchemeValueIndex]);
  };

  const Icon = !mounted
    ? IconSun
    : colorScheme === 'auto'
      ? IconDeviceDesktop
      : colorScheme === 'dark'
        ? IconMoon
        : IconSun;

  return (
    <Tooltip label="Themes">
      <ActionIcon variant="default" onClick={handleToggleColorSchemeButton}>
        <Icon style={{ width: '70%', height: '70%' }} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  );
}

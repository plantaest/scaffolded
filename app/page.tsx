'use client';

import { useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import {
  Icon123,
  IconBracketsAngle,
  IconCode,
  IconHistory,
  IconInfoCircle,
  IconRestore,
  IconSlash,
  IconWand,
  IconWorld,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Loader,
  Menu,
  MenuDivider,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  SimpleGrid,
  Text,
  TextInput,
  Tooltip,
  TooltipGroup,
  useComputedColorScheme,
} from '@mantine/core';
import { basicTranslator } from '@/app/basic-translator';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import { Logo } from '@/components/Logo/Logo';
import classes from './page.module.css';

const defaultEditorValue = '// Write your own translator or choose a template...';

export default function HomePage() {
  const computedColorScheme = useComputedColorScheme('light');
  const [theme, setTheme] = useState<'light' | 'vs-dark'>(
    computedColorScheme === 'light' ? 'light' : 'vs-dark'
  );
  const [code, setCode] = useState(defaultEditorValue);

  useEffect(() => {
    setTheme(computedColorScheme === 'light' ? 'light' : 'vs-dark');
  }, [computedColorScheme]);

  const handleClickBasicTranslatorMenu = () => {
    setCode(basicTranslator);
  };

  const handleClickResetMenu = () => {
    setCode(defaultEditorValue);
  };

  return (
    <Flex className={classes.wrapper} direction="column" h="100vh" p="md" gap="md">
      <Card withBorder radius="md" mih="fit-content">
        <Group justify="space-between">
          <Logo size={150} />

          <Group gap="xs">
            <TooltipGroup openDelay={500} closeDelay={100}>
              <Tooltip label="Languages">
                <ActionIcon variant="default">
                  <IconWorld style={{ width: '70%', height: '70%' }} stroke={1.5} />
                </ActionIcon>
              </Tooltip>
              <ColorSchemeToggle />
              <Tooltip label="Hotkeys">
                <ActionIcon variant="default">
                  <IconSlash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="About">
                <ActionIcon variant="default">
                  <IconInfoCircle style={{ width: '70%', height: '70%' }} stroke={1.5} />
                </ActionIcon>
              </Tooltip>
            </TooltipGroup>
          </Group>
        </Group>
      </Card>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" verticalSpacing="md" h="100%" mih={0}>
        <Card withBorder radius="md" p={0}>
          <Flex direction="column" h="100%">
            <Group justify="space-between" p="md">
              <Group gap="xs">
                <Tooltip label="History" openDelay={500}>
                  <ActionIcon variant="default">
                    <IconHistory style={{ width: '70%', height: '70%' }} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
                <Text fw="600" c="blue">
                  Translator (5738)
                  <Text component="span" c="dimmed">
                    .js
                  </Text>
                </Text>
              </Group>

              <Group gap="xs">
                <TooltipGroup openDelay={500} closeDelay={100}>
                  <Menu shadow="md" width={200} position="bottom-end">
                    <MenuTarget>
                      <Tooltip label="Templates">
                        <ActionIcon variant="default">
                          <IconBracketsAngle style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon>
                      </Tooltip>
                    </MenuTarget>
                    <MenuDropdown>
                      <MenuItem
                        leftSection={<IconCode size={14} />}
                        onClick={handleClickBasicTranslatorMenu}
                      >
                        Basic Translator
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem
                        color="red"
                        leftSection={<IconRestore size={14} />}
                        onClick={handleClickResetMenu}
                      >
                        Reset
                      </MenuItem>
                    </MenuDropdown>
                  </Menu>
                  <Tooltip label="Generate translatorID">
                    <ActionIcon variant="default">
                      <Icon123 style={{ width: '70%', height: '70%' }} stroke={1.5} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Beautify">
                    <ActionIcon variant="default">
                      <IconWand style={{ width: '70%', height: '70%' }} stroke={1.5} />
                    </ActionIcon>
                  </Tooltip>
                </TooltipGroup>
                <Divider orientation="vertical" />
                <Button size="compact-sm" color="green">
                  Save
                </Button>
              </Group>
            </Group>

            <Divider />

            <Editor
              defaultLanguage="javascript"
              value={code}
              theme={theme}
              options={{
                fontFamily: "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
                fontSize: 14,
                minimap: { enabled: false },
                wordWrap: 'on',
              }}
              onMount={(_editor, monaco) => {
                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                  noSyntaxValidation: true,
                });
              }}
              loading={<Loader color="blue" />}
            />
          </Flex>
        </Card>

        <Card withBorder radius="md" p={0}>
          <Flex direction="column">
            <Group justify="space-between" p="md">
              <Group gap="xs" wrap="nowrap" w="100%">
                <TextInput
                  variant="filled"
                  size="xs"
                  placeholder="Type URL..."
                  w="100%"
                  flex={1}
                  styles={{ input: { height: 28, minHeight: 28 } }}
                />
                <Button size="compact-sm">Run</Button>
                <Divider orientation="vertical" />
                <Button size="compact-sm">Test</Button>
              </Group>
            </Group>

            <Divider />
          </Flex>
        </Card>
      </SimpleGrid>
    </Flex>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import {
  Icon123,
  IconBracketsAngle,
  IconCode,
  IconHistory,
  IconRestore,
  IconWand,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
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
  Text,
  Tooltip,
  TooltipGroup,
  useComputedColorScheme,
} from '@mantine/core';
import { basicTranslator } from '@/app/basic-translator';

const defaultEditorValue = '// (EN) Write your own translator or choose a template...';

interface EditorProps {
  translatorId: string;
}

export function Editor({ translatorId }: EditorProps) {
  const t = useTranslations();
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
    <Card withBorder radius="md" p={0}>
      <Flex direction="column" h="100%">
        <Group justify="space-between" p="md">
          <Group gap="xs">
            <Tooltip label={t('ui.history')} openDelay={500}>
              <ActionIcon variant="default">
                <IconHistory style={{ width: '70%', height: '70%' }} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
            <Text fw="600" c="blue">
              Translator ({translatorId})
              <Text component="span" c="dimmed">
                .js
              </Text>
            </Text>
          </Group>

          <Group gap="xs">
            <TooltipGroup openDelay={500} closeDelay={100}>
              <Menu shadow="md" width={200} position="bottom-end">
                <MenuTarget>
                  <Tooltip label={t('ui.templates')}>
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
                    {t('ui.basic')}
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem
                    color="red"
                    leftSection={<IconRestore size={14} />}
                    onClick={handleClickResetMenu}
                  >
                    {t('ui.reset')}
                  </MenuItem>
                </MenuDropdown>
              </Menu>
              <Tooltip label={t('ui.generateTranslatorId')}>
                <ActionIcon variant="default">
                  <Icon123 style={{ width: '70%', height: '70%' }} stroke={1.5} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={t('ui.beautify')}>
                <ActionIcon variant="default">
                  <IconWand style={{ width: '70%', height: '70%' }} stroke={1.5} />
                </ActionIcon>
              </Tooltip>
            </TooltipGroup>
            <Divider orientation="vertical" />
            <Button size="compact-sm" color="green">
              {t('ui.save')}
            </Button>
          </Group>
        </Group>

        <Divider />

        <MonacoEditor
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
  );
}

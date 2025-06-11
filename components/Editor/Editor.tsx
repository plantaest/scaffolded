'use client';

import dayjs from 'dayjs';
import { Fragment, useEffect, useRef, useState } from 'react';
import { BeforeMount, Editor as MonacoEditor, OnChange, OnMount } from '@monaco-editor/react';
import {
  Icon123,
  IconBracketsAngle,
  IconCode,
  IconHistory,
  IconRestore,
  IconWand,
  IconX,
} from '@tabler/icons-react';
import { nanoid } from 'nanoid';
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
  MenuLabel,
  MenuTarget,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  Stack,
  Text,
  Tooltip,
  TooltipGroup,
  UnstyledButton,
  useComputedColorScheme,
} from '@mantine/core';
import { useForceUpdate, useHotkeys } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { basicTranslator } from '@/app/basic-translator';
import { Translator } from '@/types/Translator';
import { appConfig } from '@/utils/appConfig';
import { currentTranslatorIdRef } from '@/utils/currentTranslatorIdRef';
import {
  getTranslatorById,
  loadAllTranslators,
  persistTranslator,
  updateTranslatorContent,
} from '@/utils/db';
import { notice } from '@/utils/notice';
import { temporaryTranslatorCodeRef } from '@/utils/temporaryTranslatorCodeRef';

interface EditorProps {
  generatedTranslatorId: string;
}

export function Editor({ generatedTranslatorId }: EditorProps) {
  const t = useTranslations();
  const computedColorScheme = useComputedColorScheme('light');
  const theme = computedColorScheme === 'light' ? 'light' : 'vs-dark';

  const editorRef = useRef<Parameters<OnMount>[0]>(null);
  const temporaryRef = useRef(true);
  const translatorIdRef = useRef(generatedTranslatorId);
  const translatorRef = useRef<Translator>(null);
  const translatorNameRef = useRef<HTMLButtonElement>(null);

  const [translators, setTranslators] = useState<Translator[]>([]);
  const [triggerLoadAllTranslators, setTriggerLoadAllTranslators] = useState(0);
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    currentTranslatorIdRef.current = translatorIdRef.current;
  }, [translatorIdRef.current]);

  useEffect(() => {
    loadAllTranslators().then(setTranslators);
  }, [triggerLoadAllTranslators]);

  const handleMouseEnterHistoryButton = () => {
    setTriggerLoadAllTranslators((trigger) => trigger + 1);
  };

  const handleClickHistoryMenuItem = async (selectedTranslatorId: string) => {
    if (selectedTranslatorId === translatorIdRef.current) {
      return;
    }

    const translator = await getTranslatorById(selectedTranslatorId);

    if (translator) {
      temporaryRef.current = false;
      translatorIdRef.current = translator.id;
      translatorRef.current = translator;
      editorRef.current?.setValue(translator.content);
      forceUpdate();
    }
  };

  const handleClickCloseTranslatorButton = () => {
    temporaryRef.current = true;
    translatorIdRef.current = nanoid(6);
    translatorRef.current = null;
    editorRef.current?.setValue(appConfig.DEFAULT_EDITOR_VALUE);
    forceUpdate();
  };

  const handleClickBasicTranslatorMenu = () => {
    editorRef.current?.setValue(basicTranslator);
  };

  const handleClickResetMenu = () => {
    editorRef.current?.setValue(appConfig.DEFAULT_EDITOR_VALUE);
  };

  const handleClickGenerateTranslatorIdButton = async () => {
    await navigator.clipboard.writeText(crypto.randomUUID());
    notice.success(t('ui.notification.translatorId'));
  };

  const handleClickSaveButton = () => {
    modals.openConfirmModal({
      title: <Text fw={600}>{t('ui.saveConfirmationModal.title')}</Text>,
      children: (
        <Stack gap="xs">
          <Text size="sm">
            {t.rich('ui.saveConfirmationModal.message', {
              translatorFileName: `${translatorIdRef.current}.js`,
              blue: (chunks) => (
                <Text component="span" c="blue" fw={600}>
                  {chunks}
                </Text>
              ),
            })}
          </Text>
          {translators.length >= appConfig.MAX_TRANSLATORS && (
            <Text size="sm" c="red">
              {t('ui.saveConfirmationModal.note', { maxTranslators: appConfig.MAX_TRANSLATORS })}
            </Text>
          )}
        </Stack>
      ),
      labels: { confirm: t('ui.confirm'), cancel: t('ui.cancel') },
      onConfirm: async () => {
        const now = Date.now();
        const translator: Translator = {
          id: translatorIdRef.current,
          createdAt: now,
          updatedAt: now,
          name: translatorIdRef.current,
          content: editorRef.current?.getValue() ?? '',
        };
        await persistTranslator(translator);
        temporaryRef.current = false;
        translatorRef.current = translator;
        forceUpdate();
      },
    });
  };

  const handleMonacoEditorWillMount: BeforeMount = (monaco) => {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSyntaxValidation: true,
    });
  };

  const handleMonacoEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.addCommand(monaco.KeyCode.Escape, () => {
      translatorNameRef.current?.focus();
    });
  };

  const handleMonacoEditorChange: OnChange = async (value) => {
    if (!temporaryRef.current) {
      await updateTranslatorContent(translatorIdRef.current, value ?? '');
    } else {
      temporaryTranslatorCodeRef.current = value ?? '';
    }
  };

  const dates = new Set();

  useHotkeys([['mod + U', () => handleClickSaveButton()]]);

  return (
    <Card withBorder radius="md" p={0}>
      <Flex direction="column" h="100%">
        <Group justify="space-between" p="md">
          <Group gap="xs">
            <Menu shadow="md" width={225} position="bottom-start">
              <MenuTarget>
                <Tooltip label={t('ui.history')} openDelay={500}>
                  <ActionIcon variant="default" onMouseEnter={handleMouseEnterHistoryButton}>
                    <IconHistory style={{ width: '70%', height: '70%' }} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
              </MenuTarget>
              <MenuDropdown>
                {translators.length > 0 ? (
                  translators
                    .sort((a, b) => b.updatedAt - a.updatedAt)
                    .map((translator) => {
                      const date = dayjs(translator.updatedAt).format('DD-MM-YYYY');
                      const showDate = !dates.has(date);
                      dates.add(date);

                      return (
                        <Fragment key={translator.id}>
                          {showDate && <MenuLabel ff="monospace">{date}</MenuLabel>}
                          <MenuItem
                            color={translator.id === translatorIdRef.current ? 'green' : undefined}
                            rightSection={
                              <Text size="xs" c="dimmed" ff="monospace">
                                {dayjs(translator.updatedAt).format('HH:mm:ss')}
                              </Text>
                            }
                            onClick={() => handleClickHistoryMenuItem(translator.id)}
                          >
                            {translator.name}.js
                          </MenuItem>
                        </Fragment>
                      );
                    })
                ) : (
                  <MenuLabel>{t('ui.noData')}</MenuLabel>
                )}
              </MenuDropdown>
            </Menu>
            <Popover
              width={250}
              position="bottom-start"
              withArrow
              shadow="md"
              disabled={temporaryRef.current}
            >
              <PopoverTarget>
                <UnstyledButton ref={translatorNameRef}>
                  <Text fw="600" c={temporaryRef.current ? 'blue' : 'green'}>
                    {translatorIdRef.current}
                    <Text component="span" c="dimmed">
                      .js
                    </Text>
                  </Text>
                </UnstyledButton>
              </PopoverTarget>
              <PopoverDropdown>
                <Stack gap="xs">
                  <Flex direction="column">
                    <Text fz="sm" c="dimmed">
                      ID
                    </Text>
                    <Text fz="sm">{translatorRef.current?.id}</Text>
                  </Flex>
                  <Flex direction="column">
                    <Text fz="sm" c="dimmed">
                      {t('ui.createdAt')}
                    </Text>
                    <Text fz="sm">
                      {dayjs(translatorRef.current?.createdAt).format('HH:mm:ss DD-MM-YYYY')}
                    </Text>
                  </Flex>
                  <Flex direction="column">
                    <Text fz="sm" c="dimmed">
                      {t('ui.updatedAt')}
                    </Text>
                    <Text fz="sm">
                      {dayjs(translatorRef.current?.updatedAt).format('HH:mm:ss DD-MM-YYYY')}
                    </Text>
                  </Flex>
                  <Flex direction="column">
                    <Text fz="sm" c="dimmed">
                      {t('ui.name')}
                    </Text>
                    <Text fz="sm" c="green">
                      {translatorRef.current?.name}
                      <Text component="span" fz="sm" c="dimmed">
                        .js
                      </Text>
                    </Text>
                  </Flex>
                </Stack>
              </PopoverDropdown>
            </Popover>
            {!temporaryRef.current && (
              <ActionIcon
                variant="subtle"
                size="xs"
                color="red"
                onClick={handleClickCloseTranslatorButton}
              >
                <IconX
                  style={{ width: '70%', height: '70%' }}
                  color="var(--mantine-color-red-5)"
                  stroke={1.5}
                />
              </ActionIcon>
            )}
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
                <ActionIcon variant="default" onClick={handleClickGenerateTranslatorIdButton}>
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
            <Button
              size="compact-sm"
              color="green"
              onClick={handleClickSaveButton}
              disabled={!temporaryRef.current}
            >
              {t(temporaryRef.current ? 'ui.save' : 'ui.saved')}
            </Button>
          </Group>
        </Group>

        <Divider />

        <MonacoEditor
          defaultLanguage="javascript"
          defaultValue={appConfig.DEFAULT_EDITOR_VALUE}
          theme={theme}
          options={{
            fontFamily: "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
            fontSize: 14,
            minimap: { enabled: false },
          }}
          loading={<Loader color="blue" />}
          beforeMount={handleMonacoEditorWillMount}
          onMount={handleMonacoEditorDidMount}
          onChange={handleMonacoEditorChange}
        />
      </Flex>
    </Card>
  );
}

'use client';

import dayjs from 'dayjs';
import { useState } from 'react';
import { IconInfoCircle } from '@tabler/icons-react';
import { valibotResolver } from 'mantine-form-valibot-resolver';
import { useTranslations } from 'next-intl';
import * as v from 'valibot';
import {
  CodeHighlight,
  CodeHighlightAdapterProvider,
  createShikiAdapter,
} from '@mantine/code-highlight';
import {
  Alert,
  Anchor,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { TestCase } from '@/types/TestCase';
import { TestCaseResult } from '@/types/TestCaseResult';
import { currentTranslatorIdRef } from '@/utils/currentTranslatorIdRef';
import { getTranslatorById } from '@/utils/db';
import { errorMessage } from '@/utils/errorMessage';
import { temporaryTranslatorCodeRef } from '@/utils/temporaryTranslatorCodeRef';

async function loadShiki() {
  const { createHighlighter } = await import('shiki');
  return await createHighlighter({
    langs: ['json'],
    themes: [],
  });
}

const shikiAdapter = createShikiAdapter(loadShiki);

const formSchema = v.object({
  url: v.pipe(v.string(), v.url(), v.trim(), v.minLength(1, errorMessage.notEmpty)),
});

type FormValues = v.InferInput<typeof formSchema>;

const formInitialValues: FormValues = {
  url: '',
};

interface RunApiResult {
  date: string;
  response: string;
}

export function Console() {
  const t = useTranslations();
  const [mode, setMode] = useState<'run' | 'test'>('run');
  const [runApiResult, setRunApiResult] = useState<RunApiResult | null>(null);
  const [testCaseResults, setTestCaseResults] = useState<TestCaseResult[]>([]);
  const [runApiLoading, setRunApiLoading] = useState(false);
  const [testApiLoading, setTestApiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: formInitialValues,
    validate: valibotResolver(formSchema),
  });

  const handleFormSubmit = form.onSubmit(async (formValues) => {
    const translator = await getTranslatorById(currentTranslatorIdRef.current!);
    const translatorCode = translator ? translator.content : temporaryTranslatorCodeRef.current;
    const testUrl = formValues.url;

    setMode('run');
    setRunApiLoading(true);

    try {
      const response = await fetch('/api/run-translator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translatorCode, testUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRunApiResult(null);
        setError(data.error || 'Unknown error');
      } else {
        setRunApiResult({ date: new Date().toISOString(), response: data.result });
        setError(null);
      }
    } catch (err: any) {
      setRunApiResult(null);
      setError(err.message || 'Something went wrong');
    } finally {
      setRunApiLoading(false);
    }
  });

  const handleClickTestButton = async () => {
    const translator = await getTranslatorById(currentTranslatorIdRef.current!);
    const translatorCode = translator ? translator.content : temporaryTranslatorCodeRef.current;

    setMode('test');
    setTestApiLoading(true);

    try {
      // Ref: https://github.com/zotero/translation-server/blob/master/test/import_test.js#L88
      const marker = translatorCode.indexOf('/** BEGIN TEST CASES **/');
      if (marker === -1) {
        setError('Cannot find the string "/** BEGIN TEST CASES **/"');
      }

      const start = translatorCode.indexOf('[', marker);
      const end = translatorCode.lastIndexOf(']') + 1;
      const testCases: TestCase[] = JSON.parse(
        translatorCode.substring(Math.max(start, marker), Math.max(end, start, marker))
      );

      const response = await fetch('/api/test-translator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translatorCode, testCases }),
      });

      const data = await response.json();

      if (!response.ok) {
        setTestCaseResults([]);
        setError(data.error || 'Unknown error');
      } else {
        setTestCaseResults(data.cases);
        setError(null);
      }
    } catch (err: any) {
      setTestCaseResults([]);
      setError(err.message || 'Something went wrong');
    } finally {
      setTestApiLoading(false);
    }
  };

  return (
    <CodeHighlightAdapterProvider adapter={shikiAdapter}>
      <Card withBorder radius="md" p={0}>
        <Flex direction="column" style={{ overflow: 'hidden' }}>
          <Group justify="space-between" p="md">
            <Group gap="xs" wrap="nowrap" w="100%" align="start">
              <form onSubmit={handleFormSubmit} style={{ flex: 1 }}>
                <Group gap="xs" wrap="nowrap" align="start">
                  <TextInput
                    variant="filled"
                    size="xs"
                    placeholder={t('ui.typeUrl')}
                    w="100%"
                    flex={1}
                    styles={{ input: { height: 28, minHeight: 28 } }}
                    key={form.key('url')}
                    {...form.getInputProps('url')}
                  />
                  <Button type="submit" size="compact-sm" loading={runApiLoading}>
                    {t('ui.run')}
                  </Button>
                </Group>
              </form>
              <Divider orientation="vertical" />
              <Button size="compact-sm" onClick={handleClickTestButton} loading={testApiLoading}>
                {t('ui.test')}
              </Button>
            </Group>
          </Group>

          <Divider />

          {error && (
            <Alert
              m="md"
              variant="light"
              color="red"
              radius="md"
              title="ERROR"
              icon={<IconInfoCircle />}
            >
              ({dayjs().format('HH:mm:ss DD-MM-YYYY')}) {error}
            </Alert>
          )}

          {mode === 'run' && runApiResult && (
            <CodeHighlight
              code={JSON.stringify(
                Array.isArray(runApiResult.response) && runApiResult.response.length === 1
                  ? runApiResult.response[0]
                  : runApiResult.response,
                null,
                4
              )}
              language="json"
              copyLabel={t('ui.copy')}
              copiedLabel={t('ui.copied')}
              styles={{
                codeHighlight: { display: 'flex' },
                pre: { textWrap: 'wrap' },
                code: { fontSize: 'var(--mantine-font-size-sm)' },
              }}
            />
          )}

          {mode === 'test' && testCaseResults.length > 0 && (
            <Stack p="md">
              {testCaseResults.map((result, index) => (
                <Alert
                  key={index}
                  variant="light"
                  color={result.status === 'success' ? 'green' : 'red'}
                  radius="md"
                  title={`TEST CASE ${index + 1} – ${result.status === 'success' ? 'SUCCESS' : 'ERROR'}`}
                  icon={<IconInfoCircle />}
                >
                  <Stack gap="xs">
                    <Anchor size="sm" w="fit-content" href={result.url} target="_blank">
                      {result.url}
                    </Anchor>
                    {result.error && (
                      <Text size="sm" c="red">
                        {result.error}
                      </Text>
                    )}
                  </Stack>
                </Alert>
              ))}
            </Stack>
          )}
        </Flex>
      </Card>
    </CodeHighlightAdapterProvider>
  );
}

'use client';

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
import { Alert, Button, Card, Divider, Flex, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
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

interface Result {
  date: string;
  response: string;
}

export function Console() {
  const t = useTranslations();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
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

    setLoading(true);

    try {
      const response = await fetch('/api/run-translator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translatorCode, testUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult(null);
        setError(data.error || 'Unknown error');
      } else {
        setResult({ date: new Date().toISOString(), response: data.result });
        setError(null);
      }
    } catch (err: any) {
      setResult(null);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  });

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
                  <Button type="submit" size="compact-sm" loading={loading}>
                    {t('ui.run')}
                  </Button>
                </Group>
              </form>
              <Divider orientation="vertical" />
              <Button size="compact-sm">{t('ui.test')}</Button>
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
              ({new Date().toISOString()}) {error}
            </Alert>
          )}

          {result && (
            <CodeHighlight
              code={JSON.stringify(
                Array.isArray(result.response) && result.response.length === 1
                  ? result.response[0]
                  : result.response,
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
        </Flex>
      </Card>
    </CodeHighlightAdapterProvider>
  );
}

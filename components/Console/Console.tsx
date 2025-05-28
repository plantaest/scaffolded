import { useTranslations } from 'next-intl';
import { Button, Card, Divider, Flex, Group, TextInput } from '@mantine/core';

export function Console() {
  const t = useTranslations();

  return (
    <Card withBorder radius="md" p={0}>
      <Flex direction="column">
        <Group justify="space-between" p="md">
          <Group gap="xs" wrap="nowrap" w="100%">
            <TextInput
              variant="filled"
              size="xs"
              placeholder={t('ui.typeUrl')}
              w="100%"
              flex={1}
              styles={{ input: { height: 28, minHeight: 28 } }}
            />
            <Button size="compact-sm">{t('ui.run')}</Button>
            <Divider orientation="vertical" />
            <Button size="compact-sm">{t('ui.test')}</Button>
          </Group>
        </Group>

        <Divider />
      </Flex>
    </Card>
  );
}

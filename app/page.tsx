import { nanoid } from 'nanoid';
import { Flex, SimpleGrid } from '@mantine/core';
import { Console } from '@/components/Console/Console';
import { Editor } from '@/components/Editor/Editor';
import { Header } from '@/components/Header/Header';
import classes from './page.module.css';

export default function HomePage() {
  const translatorId = nanoid(6);

  return (
    <Flex className={classes.wrapper} direction="column" h="100vh" p="md" gap="md">
      <Header />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" verticalSpacing="md" h="100%" mih={0}>
        <Editor generatedTranslatorId={translatorId} />
        <Console />
      </SimpleGrid>
    </Flex>
  );
}

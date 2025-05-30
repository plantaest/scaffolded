import { DBSchema, openDB } from 'idb';
import { Translator } from '@/types/Translator';
import { appConfig } from '@/utils/appConfig';

interface MyDB extends DBSchema {
  translators: {
    key: string;
    value: Translator;
    indexes: { 'by-updatedAt': number };
  };
}

export const getDb = () => {
  return openDB<MyDB>('scaffolded-db', 1, {
    upgrade(db) {
      const store = db.createObjectStore('translators', {
        keyPath: 'id',
      });
      store.createIndex('by-updatedAt', 'updatedAt');
    },
  });
};

export const loadAllTranslators = async () => {
  const db = await getDb();
  return await db.getAll('translators');
};

export const getTranslatorById = async (id: string) => {
  const db = await getDb();
  return await db.get('translators', id);
};

export const persistTranslator = async (translator: Translator) => {
  const db = await getDb();
  const tx = db.transaction('translators', 'readwrite');
  const store = tx.objectStore('translators');

  const all = await store.getAll();

  if (all.length >= appConfig.MAX_TRANSLATORS) {
    const oldest = all.reduce((a, b) => (a.updatedAt < b.updatedAt ? a : b));
    await store.delete(oldest.id);
  }

  await store.put(translator);
  await tx.done;
};

export const updateTranslatorContent = async (id: string, newContent: string) => {
  const db = await getDb();
  const tx = db.transaction('translators', 'readwrite');
  const store = tx.objectStore('translators');

  const oldTranslator = await store.get(id);

  if (!oldTranslator) {
    throw new Error(`Translator with id ${id} not found`);
  }

  if (oldTranslator.content === newContent) {
    return;
  }

  const updatedTranslator = {
    ...oldTranslator,
    content: newContent,
    updatedAt: Date.now(),
  };

  await store.put(updatedTranslator);
  await tx.done;
};

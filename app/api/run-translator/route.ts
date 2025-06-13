import { NextResponse } from 'next/server';
import { unlink, writeFile } from 'fs/promises';
import { zoteroTranslationServerUri } from '@/utils/zoteroTranslationServerUri';

export async function POST(request: Request) {
  const { translatorCode, testUrl } = await request.json();

  if (!translatorCode || !testUrl) {
    return NextResponse.json({ error: 'Missing translatorCode or testUrl' }, { status: 400 });
  }

  const filePath = `${process.env.TEMP_TRANSLATORS_DIR}/translator-${Date.now()}-${Math.random()}.js`;

  try {
    // Write temporary translator file
    await writeFile(filePath, translatorCode, 'utf-8');

    // Send request to Zotero Translation Server
    const response = await fetch(zoteroTranslationServerUri('web'), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: testUrl,
    });

    // Response
    const result = await response.json();

    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || err.toString() }, { status: 500 });
  } finally {
    // Remove translator file
    await unlink(filePath);
  }
}

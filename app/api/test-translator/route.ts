import { NextResponse } from 'next/server';
import { unlink, writeFile } from 'fs/promises';
import { TestCase } from '@/types/TestCase';
import { TestCaseResult } from '@/types/TestCaseResult';
import { zoteroTranslationServerUri } from '@/utils/zoteroTranslationServerUri';

interface RequestBody {
  translatorCode: string;
  testCases: TestCase[];
}

interface ResponseBody {
  cases: TestCaseResult[];
}

export async function POST(request: Request) {
  const { translatorCode, testCases }: RequestBody = await request.json();

  if (!translatorCode || !testCases) {
    return NextResponse.json({ error: 'Missing translatorCode or testCases' }, { status: 400 });
  }

  const filePath = `${process.env.TEMP_TRANSLATORS_DIR}/translator-${Date.now()}-${Math.random()}.js`;

  try {
    await writeFile(filePath, translatorCode, 'utf-8');

    const cases: TestCaseResult[] = [];

    for (const testCase of testCases) {
      try {
        const response = await fetch(zoteroTranslationServerUri('web'), {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: testCase.url,
        });

        const serverResult = (await response.json()) as Array<Record<string, any>>;
        const sanitizedServerResult = serverResult.map((item) => {
          const { key, version, accessDate, ...rest } = item;
          return rest;
        });

        const matched = JSON.stringify(testCase.items) === JSON.stringify(sanitizedServerResult);

        cases.push({
          url: testCase.url,
          status: matched ? 'success' : 'error',
          error: matched ? undefined : 'Not matched',
        });
      } catch (err) {
        cases.push({
          url: testCase.url,
          status: 'error',
          error: 'Unknown error',
        });
      }
    }

    return NextResponse.json<ResponseBody>({ cases });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || err.toString() }, { status: 500 });
  } finally {
    await unlink(filePath);
  }
}

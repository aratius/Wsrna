export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';
import fs from 'fs';
import path from 'path';

function fillTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/{{(\w+)}}/g, (_, key) => vars[key] || '');
}

export async function POST(req: NextRequest) {
  const { main_word, fromLang, toLang, main_word_translations } = await req.json();
  if (!main_word || !fromLang || !toLang) {
    return NextResponse.json({ error: 'main_word, fromLang, toLang are required' }, { status: 400 });
  }

  // プロンプトテンプレートを外部ファイルから読み込み
  const promptPath = path.join(process.cwd(), 'src/prompts/generate-quiz.txt');
  const template = fs.readFileSync(promptPath, 'utf8');
  // main_word もテンプレートに渡す必要がある
  const prompt = fillTemplate(template, { main_word, main_word_translations: main_word_translations || '', fromLang, toLang });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106',
      messages: [
        { role: 'system', content: 'You are a helpful multilingual language teacher AI.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: 'json_object' }, // JSONモードを有効化
    });
    const text = completion.choices[0].message.content?.trim() || '';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Failed to parse JSON from LLM', raw: text }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
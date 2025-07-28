export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';
import fs from 'fs';
import path from 'path';
import supportedLanguages from '@/lib/supportedLanguages.json';

function fillTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/{{(\w+)}}/g, (_, key) => vars[key] || '');
}

function getLanguageLabel(code: string): string {
  const lang = (supportedLanguages as any[]).find(l => l.code === code);
  return lang ? lang.label : code;
}

export async function POST(req: NextRequest) {
  const { main_word, fromLang, toLang, main_word_translations } = await req.json();
  if (!main_word || !fromLang || !toLang) {
    return NextResponse.json({ error: 'main_word, fromLang, toLang are required' }, { status: 400 });
  }

  // プロンプトテンプレートを外部ファイルから読み込み
  const promptPath = path.join(process.cwd(), 'src/prompts/generate-quiz.txt');
  const template = fs.readFileSync(promptPath, 'utf8');
  // fromLangを現地語表記に変換
  const fromLangLabel = getLanguageLabel(fromLang);
  let prompt = fillTemplate(template, { main_word, main_word_translations: main_word_translations || '', fromLang: fromLangLabel, toLang });

  // main_wordが構文・パターンの場合は補助説明を追加
  if (/\[.*\]|\.\.\.|ing\b|\bto\b|\bof\b|\bis\b|\bare\b|\bam\b|\bbe\b|\bwas\b|\bwere\b|\bhas\b|\bhave\b|\bhad\b|\bwill\b|\bwould\b|\bcan\b|\bcould\b|\bshould\b|\bmay\b|\bmight\b|\bmust\b|\bshall\b|\bdo\b|\bdid\b|\bdoes\b/.test(main_word)) {
    prompt += '\n\nNote: The main_word provided is a grammar pattern or construction. All questions must use the entire pattern as the answer and focus, not just a single word. Do not use any other word or idiom as the answer.';
  }
  // main_word_translationsが空の場合は訳語生成を強調
  if (!main_word_translations || (Array.isArray(main_word_translations) && main_word_translations.length === 0)) {
    prompt += `\n\nNote: You must always provide at least one accurate and appropriate translation for the main_word (\"${main_word}\") in ${fromLang}. If not provided, you must research and generate a suitable translation yourself. Never leave main_word_translations empty.`;
  }

  try {
    const completion = await openai.chat.completions.create({
      // model: 'gpt-3.5-turbo-1106',
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful multilingual language teacher AI.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2048 * 2,
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
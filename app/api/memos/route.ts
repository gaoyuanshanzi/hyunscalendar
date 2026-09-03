import { NextResponse } from 'next/server';
import { sql, ensureTables } from '@/lib/db';
import { Memo } from '@/types/memo';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureTables();
    const rows = await sql`
      SELECT id, title, content, plain_text_preview as "plainTextPreview",
             created_at as "createdAt", updated_at as "updatedAt",
             is_pinned as "isPinned"
      FROM memos
      ORDER BY is_pinned DESC, updated_at DESC;
    `;
    return NextResponse.json(rows);
  } catch (err: unknown) {
    console.error('Failed to fetch memos:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureTables();
    const memo: Memo = await req.json();
    await sql`
      INSERT INTO memos (id, title, content, plain_text_preview, created_at, updated_at, is_pinned)
      VALUES (${memo.id}, ${memo.title}, ${memo.content}, ${memo.plainTextPreview || ''},
              ${memo.createdAt}, ${memo.updatedAt}, ${memo.isPinned || false})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        plain_text_preview = EXCLUDED.plain_text_preview,
        updated_at = EXCLUDED.updated_at,
        is_pinned = EXCLUDED.is_pinned;
    `;
    return NextResponse.json({ success: true, memo });
  } catch (err: unknown) {
    console.error('Failed to save memo:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { sql, ensureTables } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureTables();
    const id = params.id;
    await sql`DELETE FROM todos WHERE id = ${id};`;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Failed to delete todo:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

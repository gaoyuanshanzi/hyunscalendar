import { NextResponse } from 'next/server';
import { sql, ensureTables } from '@/lib/db';
import { TodoItem } from '@/types/calendar';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureTables();
    const rows = await sql`
      SELECT id, date, dates, time, title, description,
             completed, color, created_at as "createdAt"
      FROM todos
      ORDER BY time ASC;
    `;
    return NextResponse.json(rows);
  } catch (err: unknown) {
    console.error('Failed to fetch todos:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureTables();
    const todo: TodoItem = await req.json();
    const datesArr = todo.dates && todo.dates.length > 0 ? todo.dates : [todo.date];

    await sql`
      INSERT INTO todos (id, date, dates, time, title, description, completed, color, created_at)
      VALUES (${todo.id}, ${todo.date}, ${datesArr}, ${todo.time}, ${todo.title},
              ${todo.description || ''}, ${todo.completed || false}, ${todo.color || 'blue'},
              ${todo.createdAt})
      ON CONFLICT (id) DO UPDATE SET
        date = EXCLUDED.date,
        dates = EXCLUDED.dates,
        time = EXCLUDED.time,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        completed = EXCLUDED.completed,
        color = EXCLUDED.color;
    `;
    return NextResponse.json({ success: true, todo });
  } catch (err: unknown) {
    console.error('Failed to save todo:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

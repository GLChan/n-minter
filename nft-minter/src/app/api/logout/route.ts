import { IRON_OPTIONS } from '@/app/_lib/config/session';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getIronSession<{ nonce: string }>(
    await cookies(),
    IRON_OPTIONS
  );

  await session.destroy();

  return NextResponse.json({ status: 200 });
}

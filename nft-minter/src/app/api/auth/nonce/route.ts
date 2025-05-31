import { IRON_OPTIONS } from '@/app/_lib/config/session';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateNonce } from 'siwe';

export async function GET() {
  const session = await getIronSession<{ nonce: string }>(
    await cookies(),
    IRON_OPTIONS
  );

  session.nonce = generateNonce();
  await session.save();

  return NextResponse.json({ nonce: session.nonce }, { status: 200 });
}

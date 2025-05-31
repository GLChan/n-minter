import { IRON_OPTIONS } from '@/app/_lib/config/session';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';

export async function POST(request: Request) {
  const session = await getIronSession<{ nonce: string }>(
    await cookies(),
    IRON_OPTIONS
  );

  const { message, signature } = await request.json();

  const siweMessage = new SiweMessage(message);
  const { data: fields } = await siweMessage.verify({ signature });

  if (fields.nonce !== session.nonce) {
    return NextResponse.json({ message: 'Invalid nonce.' }, { status: 422 });
  }

  // const jwt = await generateJwt({
  //   address: fields.address,
  //   chainId: fields.chainId,
  //   domain: fields.domain,
  //   nonce: fields.nonce,
  // });

  // return NextResponse.json({ jwt });

  return NextResponse.json({
    address: fields.address,
    chainId: fields.chainId,
    domain: fields.domain,
    nonce: fields.nonce,
  });
}

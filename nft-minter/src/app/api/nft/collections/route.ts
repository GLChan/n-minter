import { getCollectionsByUserId } from '@/app/_lib/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {  
  const { userId } = await request.json();
  const collections = await getCollectionsByUserId(userId);
  return NextResponse.json(collections);
}
import { NextRequest, NextResponse } from 'next/server';
import { claimAndScrapeListing } from '@/lib/claim-helper';

export async function POST(request: NextRequest) {
  try {
    const { id, tier, website } = await request.json();
    if (!id || !tier || !website) {
      return NextResponse.json({ error: 'Missing required parameters (id, tier, website)' }, { status: 400 });
    }

    const validPlans = ['claim', 'gold', 'gold_social', 'featured', 'featured_social'];
    if (!validPlans.includes(tier)) {
      return NextResponse.json({ error: 'Invalid plan selected. Must be claim, gold, gold_social, featured, or featured_social.' }, { status: 400 });
    }

    const result = await claimAndScrapeListing(id, tier, website);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Claim Listing API Error:", err.message);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

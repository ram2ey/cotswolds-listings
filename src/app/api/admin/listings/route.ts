import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Clean mock data for administrative staging queue testing when keys are unconfigured
let mockPendingListings = [
  {
    id: "mock-pending-1",
    title: "The Cotswold Lavender Farm",
    category: "Attraction / Farm Shop",
    address: "Hill Barn Farm, Snowshill, Broadway WR12 7JY",
    town: "Snowshill",
    tier: "basic",
    is_approved: false
  },
  {
    id: "mock-pending-2",
    title: "Cotswold Gin Pantry",
    category: "Distillery / Boutique Store",
    address: "High St, Broadway WR12 7DP",
    town: "Broadway",
    tier: "basic",
    is_approved: false
  },
  {
    id: "mock-pending-3",
    title: "The Cotswold Toy Museum",
    category: "Attraction / Museum",
    address: "The Square, Stow-on-the-Wold GL54 1AB",
    town: "Stow-on-the-Wold",
    tier: "basic",
    is_approved: false
  }
];

let mockApprovedListings = [
  {
    id: "mock-1",
    title: "The Lygon Arms",
    category: "Hotel & Accommodation",
    address: "High St, Broadway WR12 7DU",
    town: "Broadway",
    tier: "gold",
    is_approved: true,
    website: "https://www.lygonarmshotel.co.uk"
  },
  {
    id: "mock-2",
    title: "The Wild Rabbit",
    category: "Pub & Restaurant",
    address: "Church St, Kingham, Chipping Norton OX7 6YA",
    town: "Kingham",
    tier: "gold",
    is_approved: true,
    website: "https://thewildrabbit.co.uk"
  },
  {
    id: "mock-3",
    title: "The Porch House",
    category: "Pub & Restaurant",
    address: "Digbeth St, Stow-on-the-Wold GL54 1BN",
    town: "Stow-on-the-Wold",
    tier: "silver",
    is_approved: true,
    website: "https://www.porch-house.co.uk"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');
    const isApproved = type === 'approved';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Return mock data if keys are unconfigured
    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-supabase-url-here')) {
      console.warn(`Using mock ${isApproved ? 'approved' : 'pending'} listings database for admin panel.`);
      return NextResponse.json(isApproved ? mockApprovedListings : mockPendingListings);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('is_approved', isApproved)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST is used to approve a listing
export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing listing ID' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-supabase-url-here')) {
      console.log(`Mock Approve: Listing '${id}' approved successfully.`);
      // Remove from our in-memory mock pending array
      mockPendingListings = mockPendingListings.filter(l => l.id !== id);
      return NextResponse.json({ success: true, message: `Approved listing ${id} (Mock Mode)` });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('listings')
      .update({ is_approved: true })
      .eq('id', id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE is used to reject and delete a listing from the database
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing listing ID' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-supabase-url-here')) {
      console.log(`Mock Reject & Delete: Listing '${id}' deleted successfully.`);
      // Remove from our in-memory mock pending array
      mockPendingListings = mockPendingListings.filter(l => l.id !== id);
      return NextResponse.json({ success: true, message: `Deleted listing ${id} (Mock Mode)` });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, message: `Listing ${id} successfully rejected and deleted.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT is used to update listing details (tier, website)
export async function PUT(request: NextRequest) {
  try {
    const { id, tier, website } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing listing ID' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-supabase-url-here')) {
      console.log(`Mock Update: Listing '${id}' updated: tier=${tier}, website=${website}`);
      
      // Update in-memory mock lists
      mockPendingListings = mockPendingListings.map(l => l.id === id ? { ...l, ...(tier && { tier }), ...(website !== undefined && { website }) } : l);
      mockApprovedListings = mockApprovedListings.map(l => l.id === id ? { ...l, ...(tier && { tier }), ...(website !== undefined && { website }) } : l);
      
      const updatedListing = mockApprovedListings.find(l => l.id === id) || mockPendingListings.find(l => l.id === id);
      return NextResponse.json({ success: true, data: updatedListing });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const updateData: any = {};
    if (tier) updateData.tier = tier;
    if (website !== undefined) updateData.website = website;

    const { data, error } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, data: data?.[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

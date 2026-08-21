import { createClient } from '@supabase/supabase-js';
import { getErrorMessage } from './api-utils';

interface SubscriptionPlanRow {
  id: string;
  name: string;
  description?: string | null;
  price_monthly_gbp: number | string;
  features?: string[] | null;
  is_active?: boolean | null;
}

export interface SubscriptionPlan {
  id: 'claim' | 'gold' | 'gold_social' | 'featured' | 'featured_social';
  name: string;
  description: string;
  price_monthly_gbp: number;
  features: string[];
  is_active: boolean;
}

export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'claim',
    name: 'Claim Listing',
    description: 'Verify ownership, link your website, and display reviews.',
    price_monthly_gbp: 20.00,
    features: ['✓ Verify Ownership', '✓ Link Official Website', '✓ Rating Stars & Reviews'],
    is_active: true,
  },
  {
    id: 'gold',
    name: 'Gold Partner',
    description: 'The complete premium listing experience.',
    price_monthly_gbp: 50.00,
    features: ['✓ Gold Partner Badge', '✓ Priority Search Ranking', '✓ Full Photo Gallery', '✓ AI-Generated Details'],
    is_active: true,
  },
  {
    id: 'gold_social',
    name: 'Gold & Social Package',
    description: 'All Gold features + dedicated social media promotion.',
    price_monthly_gbp: 150.00,
    features: ['✓ Gold Partner Badge', '✓ Priority Search Ranking', '✓ Social Media Promotion', '✓ AI-Generated Details'],
    is_active: true,
  },
  {
    id: 'featured',
    name: 'Featured Partner',
    description: 'Absolute maximum visibility across Cotswolds Pages.',
    price_monthly_gbp: 100.00,
    features: ['✓ Featured Standout Badge', '✓ Absolute Top Ranking', '✓ Full Photo Gallery', '✓ AI-Generated Details'],
    is_active: true,
  },
  {
    id: 'featured_social',
    name: 'Featured & Social Promotion',
    description: 'Absolute max visibility + premium campaigns.',
    price_monthly_gbp: 200.00,
    features: ['✓ Featured Standout Badge', '✓ Absolute Top Ranking', '✓ Premium Social Campaigns', '✓ AI-Generated Details'],
    is_active: true,
  }
];

// In-memory mock storage for development/offline mode
const mockPlans: SubscriptionPlan[] = JSON.parse(JSON.stringify(DEFAULT_PLANS));

export async function getSubscriptionPlans(includeInactive = false): Promise<SubscriptionPlan[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-supabase-url-here')) {
    return includeInactive ? mockPlans : mockPlans.filter(p => p.is_active);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let query = supabase.from('subscription_plans').select('*');
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      console.warn('Could not query subscription_plans table, using defaults:', error?.message);
      return includeInactive ? mockPlans : mockPlans.filter(p => p.is_active);
    }

    return data.map((item: SubscriptionPlanRow) => ({
      id: item.id as SubscriptionPlan['id'],
      name: item.name,
      description: item.description || '',
      price_monthly_gbp: parseFloat(String(item.price_monthly_gbp)),
      features: item.features || [],
      is_active: item.is_active ?? true,
    }));
  } catch (err) {
    console.error('Error fetching subscription plans:', getErrorMessage(err));
    return includeInactive ? mockPlans : mockPlans.filter(p => p.is_active);
  }
}

export async function getSubscriptionPlan(id: string): Promise<SubscriptionPlan | null> {
  const plans = await getSubscriptionPlans(true);
  return plans.find(p => p.id === id) || null;
}

export async function updateSubscriptionPlan(
  id: string, 
  updates: Partial<Pick<SubscriptionPlan, 'name' | 'description' | 'price_monthly_gbp' | 'is_active' | 'features'>>
): Promise<SubscriptionPlan> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-supabase-url-here')) {
    const planIndex = mockPlans.findIndex(p => p.id === id);
    if (planIndex === -1) {
      throw new Error(`Plan with ID '${id}' not found`);
    }
    mockPlans[planIndex] = {
      ...mockPlans[planIndex],
      ...updates,
      price_monthly_gbp: updates.price_monthly_gbp !== undefined 
        ? Number(updates.price_monthly_gbp) 
        : mockPlans[planIndex].price_monthly_gbp
    };
    return mockPlans[planIndex];
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.price_monthly_gbp !== undefined) dbUpdates.price_monthly_gbp = Number(updates.price_monthly_gbp);
  if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;
  if (updates.features !== undefined) dbUpdates.features = updates.features;

  const { data, error } = await supabase
    .from('subscription_plans')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update plan ${id}: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    price_monthly_gbp: parseFloat(data.price_monthly_gbp),
    features: data.features || [],
    is_active: data.is_active ?? true,
  };
}

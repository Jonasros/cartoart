import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getCurrentCounts, forceFlush } from '@/lib/api-usage/tracker';

/**
 * Admin API endpoint for fetching API usage statistics
 * Protected by simple password authentication via header
 */

// Define the api_usage row type directly
interface ApiUsageRow {
  id: string;
  source: string;
  date: string;
  request_count: number;
  tilejson_count: number;
  error_count: number;
  created_at: string;
  updated_at: string;
}

function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

function verifyAdminAuth(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    // If no password is set, deny access
    return false;
  }

  const authHeader = request.headers.get('x-admin-password');
  return authHeader === adminPassword;
}

export async function GET(request: NextRequest) {
  // Verify admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 500 }
    );
  }

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch usage data from database
    const { data: usageData, error } = await supabase
      .from('api_usage')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .returns<ApiUsageRow[]>();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch usage data', details: error.message },
        { status: 500 }
      );
    }

    // Get current in-memory counts (not yet flushed)
    const inMemoryCounts = getCurrentCounts();

    // Calculate totals by source
    const totalsBySource: Record<string, { requests: number; tilejson: number; errors: number }> = {};

    for (const row of usageData || []) {
      if (!totalsBySource[row.source]) {
        totalsBySource[row.source] = { requests: 0, tilejson: 0, errors: 0 };
      }
      totalsBySource[row.source].requests += row.request_count;
      totalsBySource[row.source].tilejson += row.tilejson_count;
      totalsBySource[row.source].errors += row.error_count;
    }

    // Calculate grand total
    const grandTotal = Object.values(totalsBySource).reduce(
      (acc, curr) => ({
        requests: acc.requests + curr.requests,
        tilejson: acc.tilejson + curr.tilejson,
        errors: acc.errors + curr.errors,
      }),
      { requests: 0, tilejson: 0, errors: 0 }
    );

    // Calculate this month's total (for quota tracking)
    const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const thisMonthTotal = (usageData || [])
      .filter(row => row.date.startsWith(thisMonth))
      .reduce((sum, row) => sum + row.request_count, 0);

    return NextResponse.json({
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        days,
      },
      thisMonth: {
        total: thisMonthTotal,
        limit: 100000, // MapTiler free tier limit
        percentUsed: ((thisMonthTotal / 100000) * 100).toFixed(2),
      },
      totalsBySource,
      grandTotal,
      daily: usageData || [],
      inMemoryCounts,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

// POST endpoint to force flush in-memory counts to database
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await forceFlush();
    return NextResponse.json({ success: true, message: 'Flushed in-memory counts to database' });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to flush', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

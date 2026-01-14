'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { Database, Json } from '@/types/database';
import type { ExportProduct } from '@/lib/stripe/products';
import { logger } from '@/lib/logger';
import { randomBytes, createHash } from 'crypto';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];

export interface Order {
  id: string;
  user_id: string | null;
  email: string;
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  product: ExportProduct;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  map_id: string | null;
  export_config: Record<string, unknown> | null;
  download_count: number;
  max_downloads: number;
  download_token: string;
  created_at: string;
  completed_at: string | null;
  // Config snapshot fields - CRITICAL for purchase integrity
  config_snapshot: Record<string, unknown> | null;
  sculpture_config_snapshot: Record<string, unknown> | null;
  product_type: 'poster' | 'sculpture';
  config_hash: string | null;
}

/**
 * Generate a secure random download token
 */
function generateDownloadToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generate SHA256 hash of config for integrity verification
 */
function generateConfigHash(config: Record<string, unknown>): string {
  const configString = JSON.stringify(config, Object.keys(config).sort());
  return createHash('sha256').update(configString).digest('hex');
}

/**
 * Create a PENDING order BEFORE Stripe checkout.
 * This stores the full config snapshot in the database (avoids Stripe's 500 char metadata limit).
 * The order ID is passed to Stripe, and the webhook completes the order after payment.
 */
export async function createPendingOrder(data: {
  product: ExportProduct;
  userId?: string;
  mapId?: string;
  exportConfig?: Record<string, unknown>;
}): Promise<{ orderId: string } | null> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (clientError) {
    logger.error('Failed to create service client:', clientError);
    console.error('[ORDERS] Failed to create service client - check SUPABASE_SERVICE_ROLE_KEY:', clientError);
    return null;
  }

  const downloadToken = generateDownloadToken();

  // Extract config snapshots - CRITICAL for purchase integrity
  const configSnapshot = data.exportConfig?.configSnapshot as
    | Record<string, unknown>
    | undefined;
  const sculptureConfigSnapshot = data.exportConfig?.sculptureConfigSnapshot as
    | Record<string, unknown>
    | undefined;
  const productMode =
    (data.exportConfig?.productMode as 'poster' | 'sculpture') || 'poster';

  // Generate hash for integrity verification
  let configHash: string | null = null;
  if (configSnapshot) {
    configHash = generateConfigHash(configSnapshot);
    // Log in both dev and prod for debugging
    console.log('[ORDERS] Pending order config snapshot stored with hash:', configHash);
    logger.info('Pending order config snapshot stored with hash:', configHash);
  } else {
    console.warn('[ORDERS] WARNING: No configSnapshot in exportConfig!');
    console.warn('[ORDERS] exportConfig keys:', data.exportConfig ? Object.keys(data.exportConfig) : 'null');
  }

  // Generate unique placeholder for stripe_session_id (has UNIQUE constraint)
  const pendingSessionId = `pending_${randomBytes(16).toString('hex')}`;

  const insertData: OrderInsert = {
    email: 'pending@checkout.local', // Will be updated by webhook
    stripe_session_id: pendingSessionId, // Unique placeholder, updated by webhook
    stripe_payment_intent: null,
    product: data.product,
    amount: 0, // Will be updated by webhook
    currency: 'eur',
    status: 'pending',
    user_id: data.userId || null,
    map_id: data.mapId || null,
    export_config: (data.exportConfig as Json) ?? null,
    download_count: 0,
    max_downloads: 5,
    download_token: downloadToken,
    completed_at: null,
    // Config snapshot fields - CRITICAL for purchase integrity
    config_snapshot: (configSnapshot as Json) ?? null,
    sculpture_config_snapshot: (sculptureConfigSnapshot as Json) ?? null,
    product_type: productMode,
    config_hash: configHash,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error } = await (supabase as any)
    .from('orders')
    .insert(insertData)
    .select('id')
    .single();

  if (error) {
    // Use both logger and console.error to ensure visibility
    const errorInfo = {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    };
    logger.error('Failed to create pending order:', errorInfo);
    console.error('[ORDERS] Failed to create pending order:', JSON.stringify(errorInfo, null, 2));
    return null;
  }

  return { orderId: order.id };
}

/**
 * Complete a pending order after successful Stripe payment.
 * Called from webhook with payment details.
 */
export async function completePendingOrder(data: {
  orderId: string;
  email: string;
  stripeSessionId: string;
  stripePaymentIntent?: string;
  amount: number;
}): Promise<Order | null> {
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error } = await (supabase as any)
    .from('orders')
    .update({
      email: data.email,
      stripe_session_id: data.stripeSessionId,
      stripe_payment_intent: data.stripePaymentIntent || null,
      amount: data.amount,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', data.orderId)
    .eq('status', 'pending') // Only update if still pending
    .select()
    .single();

  if (error) {
    logger.error('Failed to complete pending order:', error);
    return null;
  }

  return mapOrderRow(order);
}

/**
 * Get a pending order by ID (for webhook validation)
 */
export async function getPendingOrder(orderId: string): Promise<Order | null> {
  const supabase = createServiceClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('status', 'pending')
    .single();

  if (error || !order) {
    return null;
  }

  return mapOrderRow(order);
}

/**
 * Create a new order (called from webhook after successful payment)
 * FALLBACK: Only used if no pending order exists (legacy flow).
 * CRITICAL: This stores the exact config at purchase time to ensure
 * the customer always gets the design they paid for.
 */
export async function createOrder(data: {
  email: string;
  stripeSessionId: string;
  stripePaymentIntent?: string;
  product: ExportProduct;
  amount: number;
  userId?: string;
  mapId?: string;
  exportConfig?: Record<string, unknown>;
}): Promise<Order | null> {
  // Use service client to bypass RLS (webhook needs to insert)
  const supabase = createServiceClient();

  const downloadToken = generateDownloadToken();

  // Extract config snapshots from exportConfig
  // These are the EXACT configs at purchase time - immutable
  const configSnapshot = data.exportConfig?.configSnapshot as
    | Record<string, unknown>
    | undefined;
  const sculptureConfigSnapshot = data.exportConfig?.sculptureConfigSnapshot as
    | Record<string, unknown>
    | undefined;
  const productMode =
    (data.exportConfig?.productMode as 'poster' | 'sculpture') || 'poster';

  // Generate hash for integrity verification
  let configHash: string | null = null;
  if (configSnapshot) {
    configHash = generateConfigHash(configSnapshot);
    logger.info('Order config snapshot stored with hash:', configHash);
  }

  const insertData: OrderInsert = {
    email: data.email,
    stripe_session_id: data.stripeSessionId,
    stripe_payment_intent: data.stripePaymentIntent || null,
    product: data.product,
    amount: data.amount,
    currency: 'eur',
    status: 'completed',
    user_id: data.userId || null,
    map_id: data.mapId || null,
    export_config: (data.exportConfig as Json) ?? null,
    download_count: 0,
    max_downloads: 5,
    download_token: downloadToken,
    completed_at: new Date().toISOString(),
    // Config snapshot fields - CRITICAL for purchase integrity
    config_snapshot: (configSnapshot as Json) ?? null,
    sculpture_config_snapshot: (sculptureConfigSnapshot as Json) ?? null,
    product_type: productMode,
    config_hash: configHash,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error } = await (supabase as any)
    .from('orders')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    logger.error('Failed to create order:', error);
    return null;
  }

  return mapOrderRow(order);
}

/**
 * Get order by download token (for download verification)
 */
export async function getOrderByToken(token: string): Promise<Order | null> {
  const supabase = createServiceClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('download_token', token)
    .single();

  if (error || !order) {
    return null;
  }

  return mapOrderRow(order);
}

/**
 * Get order by Stripe session ID
 */
export async function getOrderBySessionId(
  sessionId: string
): Promise<Order | null> {
  const supabase = createServiceClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .single();

  if (error || !order) {
    return null;
  }

  return mapOrderRow(order);
}

/**
 * Increment download count and check if downloads remaining
 */
export async function incrementDownloadCount(
  orderId: string
): Promise<{ success: boolean; remainingDownloads: number }> {
  const supabase = createServiceClient();

  // Get current order
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: fetchError } = await (supabase as any)
    .from('orders')
    .select('download_count, max_downloads')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    return { success: false, remainingDownloads: 0 };
  }

  // Check if downloads remaining
  if (order.download_count >= order.max_downloads) {
    return { success: false, remainingDownloads: 0 };
  }

  // Increment count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('orders')
    .update({ download_count: order.download_count + 1 })
    .eq('id', orderId);

  if (updateError) {
    logger.error('Failed to increment download count:', updateError);
    return { success: false, remainingDownloads: 0 };
  }

  return {
    success: true,
    remainingDownloads: order.max_downloads - order.download_count - 1,
  };
}

/**
 * Get orders for a user (by user_id or email)
 */
export async function getUserOrders(
  userId?: string,
  email?: string
): Promise<Order[]> {
  const supabase = await createClient();

  let query = supabase
    .from('orders')
    .select('*')
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (email) {
    query = query.eq('email', email);
  } else {
    return [];
  }

  const { data: orders, error } = await query;

  if (error || !orders) {
    return [];
  }

  return orders.map(mapOrderRow);
}

/**
 * Get current user's orders
 */
export async function getMyOrders(): Promise<Order[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  return getUserOrders(user.id, user.email);
}

/**
 * Update order status (e.g., for refunds)
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'completed' | 'failed' | 'refunded'
): Promise<boolean> {
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    logger.error('Failed to update order status:', error);
    return false;
  }

  return true;
}

/**
 * Map database row to Order type
 */
function mapOrderRow(row: OrderRow): Order {
  return {
    id: row.id,
    user_id: row.user_id,
    email: row.email,
    stripe_session_id: row.stripe_session_id,
    stripe_payment_intent: row.stripe_payment_intent,
    product: row.product as ExportProduct,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    map_id: row.map_id,
    export_config: row.export_config as Record<string, unknown> | null,
    download_count: row.download_count,
    max_downloads: row.max_downloads,
    download_token: row.download_token,
    created_at: row.created_at,
    completed_at: row.completed_at,
    // Config snapshot fields - CRITICAL for purchase integrity
    config_snapshot: row.config_snapshot as Record<string, unknown> | null,
    sculpture_config_snapshot: row.sculpture_config_snapshot as Record<
      string,
      unknown
    > | null,
    product_type: row.product_type as 'poster' | 'sculpture',
    config_hash: row.config_hash,
  };
}

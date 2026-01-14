import { NextRequest, NextResponse } from 'next/server';
import { getOrderByToken, incrementDownloadCount } from '@/lib/actions/orders';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  // Get order by token
  const order = await getOrderByToken(token);

  if (!order) {
    logger.warn('Invalid download token:', token.substring(0, 8) + '...');
    return NextResponse.json(
      { error: 'Invalid or expired download link' },
      { status: 404 }
    );
  }

  // Check order status
  if (order.status !== 'completed') {
    return NextResponse.json(
      { error: 'Order not completed' },
      { status: 400 }
    );
  }

  // Check download limits
  if (order.download_count >= order.max_downloads) {
    return NextResponse.json(
      { error: 'Download limit reached' },
      { status: 403 }
    );
  }

  // Increment download count
  const { success } = await incrementDownloadCount(order.id);
  if (!success) {
    return NextResponse.json(
      { error: 'Failed to process download' },
      { status: 500 }
    );
  }

  // For now, return a redirect to the export generation
  // The actual export generation happens client-side in the editor
  // This endpoint validates the token and tracks downloads
  //
  // In a production setup, you might:
  // 1. Store the generated file in cloud storage during checkout
  // 2. Return a signed URL to that file
  // 3. Or trigger server-side export generation
  //
  // For MVP, we'll return a success response with export config
  // and let the client handle the export generation

  const exportConfig = order.export_config as Record<string, unknown> | null;

  // CRITICAL: Return the config_snapshot for paid downloads
  // This is the EXACT config at purchase time - prevents wrong design on download
  return NextResponse.json({
    success: true,
    product: order.product,
    mapId: order.map_id,
    exportConfig,
    // Config snapshots - CRITICAL for purchase integrity
    configSnapshot: order.config_snapshot,
    sculptureConfigSnapshot: order.sculpture_config_snapshot,
    productType: order.product_type,
    configHash: order.config_hash,
    remainingDownloads: order.max_downloads - order.download_count - 1,
  });
}

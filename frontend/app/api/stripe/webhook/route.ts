import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import {
  createOrder,
  completePendingOrder,
  updateOrderStatus,
} from '@/lib/actions/orders';
import { getStripeProducts, type ExportProduct } from '@/lib/stripe/products';
import { logger } from '@/lib/logger';
import Stripe from 'stripe';

// Disable body parsing - we need raw body for signature verification
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    logger.error('Missing Stripe signature');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        logger.info('Checkout session expired:', session.id);
        // Clean up pending order if exists
        const pendingOrderId = session.metadata?.pendingOrderId;
        if (pendingOrderId) {
          await updateOrderStatus(pendingOrderId, 'failed');
          logger.info('Marked pending order as failed:', pendingOrderId);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        logger.info('Unhandled webhook event:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    // Return 200 to prevent Stripe from retrying (we logged the error)
    return NextResponse.json({ received: true, error: 'Processing failed' });
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  logger.info('Processing checkout completion:', session.id);

  // Extract metadata
  const { product, mapId, userId, pendingOrderId, exportConfig } =
    session.metadata || {};

  if (!product) {
    logger.error('Missing product in checkout metadata:', session.id);
    return;
  }

  // Get customer email
  const email = session.customer_email || session.customer_details?.email;
  if (!email) {
    logger.error('Missing customer email:', session.id);
    return;
  }

  // Get product amount
  const products = getStripeProducts();
  const productData = products[product as ExportProduct];
  const amount = productData?.amount || session.amount_total || 0;

  // PRIORITY: Complete pending order if exists (new flow - config stored in DB)
  if (pendingOrderId) {
    const order = await completePendingOrder({
      orderId: pendingOrderId,
      email,
      stripeSessionId: session.id,
      stripePaymentIntent: session.payment_intent as string | undefined,
      amount,
    });

    if (order) {
      logger.info('Pending order completed successfully:', order.id);
    } else {
      logger.error(
        'Failed to complete pending order:',
        pendingOrderId,
        'for session:',
        session.id
      );
    }
    return;
  }

  // FALLBACK: Create new order (legacy flow - config in metadata)
  // Parse export config if present
  let parsedExportConfig: Record<string, unknown> | undefined;
  if (exportConfig) {
    try {
      parsedExportConfig = JSON.parse(exportConfig);
    } catch {
      logger.warn('Failed to parse export config:', exportConfig);
    }
  }

  // Create order record
  const order = await createOrder({
    email,
    stripeSessionId: session.id,
    stripePaymentIntent: session.payment_intent as string | undefined,
    product: product as ExportProduct,
    amount,
    userId: userId || undefined,
    mapId: mapId || undefined,
    exportConfig: parsedExportConfig,
  });

  if (order) {
    logger.info('Order created successfully:', order.id);
  } else {
    logger.error('Failed to create order for session:', session.id);
  }
}

/**
 * Handle refund event
 */
async function handleRefund(charge: Stripe.Charge) {
  logger.info('Processing refund for charge:', charge.id);

  // Find order by payment intent
  const paymentIntent = charge.payment_intent as string;
  if (!paymentIntent) {
    logger.warn('No payment intent on refunded charge');
    return;
  }

  // Note: We'd need to look up the order by payment_intent
  // For now, just log it - full refund handling would require
  // querying orders by stripe_payment_intent
  logger.info('Refund processed for payment intent:', paymentIntent);
}

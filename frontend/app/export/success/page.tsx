import { stripe } from '@/lib/stripe/client';
import { redirect } from 'next/navigation';
import { getOrderBySessionId, createOrder } from '@/lib/actions/orders';
import { getStripeProducts, type ExportProduct } from '@/lib/stripe/products';
import ExportDownloadClient from './ExportDownloadClient';
import { AlertCircle } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function ExportSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    redirect('/create');
  }

  // Verify payment with Stripe
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error('Failed to retrieve session:', error);
    return <ErrorState message="Invalid or expired session" />;
  }

  if (session.payment_status !== 'paid') {
    return <ErrorState message="Payment not completed" />;
  }

  // Get order from database (may already exist from webhook)
  let order = await getOrderBySessionId(sessionId);

  // If order not found, the webhook hasn't fired yet
  // CRITICAL: Complete the pending order instead of creating a new one!
  // The pending order has the config_snapshot, a new order won't.
  if (!order) {
    const metadata = session.metadata || {};
    const pendingOrderId = metadata.pendingOrderId;
    const product = metadata.product as ExportProduct;
    const products = getStripeProducts();
    const productData = products[product];

    // Priority 1: Complete the pending order (preserves config_snapshot)
    if (pendingOrderId && session.customer_details?.email && productData) {
      logger.info(
        'Webhook delayed - completing pending order directly:',
        pendingOrderId
      );

      const { completePendingOrder } = await import('@/lib/actions/orders');
      order = await completePendingOrder({
        orderId: pendingOrderId,
        email: session.customer_details.email,
        stripeSessionId: sessionId,
        stripePaymentIntent:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id,
        amount: productData.amount,
      });

      if (order) {
        logger.info(
          'Pending order completed successfully from success page:',
          order.id
        );
      } else {
        logger.warn(
          'Failed to complete pending order, may already be completed:',
          pendingOrderId
        );
        // Try fetching the order again - webhook might have completed it
        order = await getOrderBySessionId(sessionId);
      }
    }

    // Fallback: Create new order (legacy flow, loses config_snapshot!)
    if (!order && product && productData && session.customer_details?.email) {
      logger.warn(
        'Creating order without config_snapshot - this should be rare:',
        sessionId
      );

      order = await createOrder({
        email: session.customer_details.email,
        stripeSessionId: sessionId,
        stripePaymentIntent:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id,
        product,
        amount: productData.amount,
        userId: metadata.userId || undefined,
        mapId: metadata.mapId || undefined,
        exportConfig: metadata.exportConfig
          ? JSON.parse(metadata.exportConfig)
          : undefined,
      });
    }
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Order Processing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We&apos;re having trouble retrieving your order. Please try
            refreshing the page. If the problem persists, contact support with
            your session ID.
          </p>
          <p className="text-xs text-gray-400 mb-4 font-mono break-all">
            Session: {sessionId}
          </p>
          <a
            href={`/export/success?session_id=${sessionId}`}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Refresh Page
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <ExportDownloadClient
        order={{
          id: order.id,
          product: order.product,
          downloadToken: order.download_token,
          downloadCount: order.download_count,
          maxDownloads: order.max_downloads,
          email: order.email,
          mapId: order.map_id,
        }}
      />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <a
          href="/create"
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Back to Editor
        </a>
      </div>
    </div>
  );
}

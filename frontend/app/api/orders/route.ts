import { NextResponse } from 'next/server';
import { getMyOrders } from '@/lib/actions/orders';

export async function GET() {
  try {
    const orders = await getMyOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

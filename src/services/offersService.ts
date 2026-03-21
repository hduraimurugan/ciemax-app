import { Offer } from '@ctypes/models';
import { MockDelay } from '@constants/config';

const MOCK_OFFERS: Offer[] = [
  {
    id: 'o1',
    code: 'FIRST50',
    title: '50% off on your first booking',
    description: 'Get 50% off up to ₹150 on your first movie booking. Valid on all formats.',
    discountType: 'percentage',
    discountValue: 50,
    minOrderAmount: 200,
    maxDiscount: 150,
    validUntil: '2026-12-31',
    isActive: true,
  },
  {
    id: 'o2',
    code: 'IMAX100',
    title: '₹100 off on IMAX shows',
    description: 'Flat ₹100 off on any IMAX show booking. Minimum order ₹500.',
    discountType: 'flat',
    discountValue: 100,
    minOrderAmount: 500,
    maxDiscount: 100,
    validUntil: '2026-06-30',
    isActive: true,
  },
  {
    id: 'o3',
    code: 'WEEKEND20',
    title: '20% off on weekends',
    description: 'Every weekend, enjoy 20% off on Gold and Premium seats.',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 300,
    maxDiscount: 200,
    validUntil: '2026-12-31',
    isActive: true,
  },
  {
    id: 'o4',
    code: 'FDFS200',
    title: '₹200 off on FDFS shows',
    description: 'Be the first to watch! Get ₹200 off on First Day First Show bookings.',
    discountType: 'flat',
    discountValue: 200,
    minOrderAmount: 600,
    maxDiscount: 200,
    validUntil: '2026-04-30',
    isActive: true,
  },
];

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export async function getOffers(): Promise<Offer[]> {
  await delay(MockDelay);
  return MOCK_OFFERS.filter(o => o.isActive);
}

export async function validateCoupon(
  code: string,
  orderAmount: number,
): Promise<{ valid: boolean; offer?: Offer; message?: string }> {
  await delay(MockDelay);
  const offer = MOCK_OFFERS.find(o => o.code === code && o.isActive);
  if (!offer) return { valid: false, message: 'Invalid coupon code' };
  if (orderAmount < offer.minOrderAmount) {
    return { valid: false, message: `Minimum order amount ₹${offer.minOrderAmount} required` };
  }
  return { valid: true, offer };
}

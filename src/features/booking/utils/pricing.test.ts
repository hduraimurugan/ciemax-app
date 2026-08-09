import { computeCheckoutPricing } from './pricing';

describe('computeCheckoutPricing', () => {
  it('charges GST on the convenience fee only, not on the ticket price', () => {
    // 2 tickets @ ₹500 = ₹1000, fee ₹15/ticket = ₹30, GST 18% of ₹30 = ₹5.4
    const result = computeCheckoutPricing({
      ticketTotal: 1000,
      numTickets: 2,
      feePerTicket: 15,
      gstPercentage: 18,
    });
    expect(result.convenienceTotal).toBe(30);
    expect(result.gstAmount).toBeCloseTo(5.4, 2);
    expect(result.subtotalWithFee).toBeCloseTo(1035.4, 2);
    expect(result.grandTotal).toBeCloseTo(1035.4, 2);
  });

  it('matches the server default settings (₹15/ticket, 18% GST)', () => {
    const result = computeCheckoutPricing({
      ticketTotal: 700,
      numTickets: 3,
      feePerTicket: 15,
      gstPercentage: 18,
    });
    // fee = 45, gst = 8.1
    expect(result.convenienceTotal).toBe(45);
    expect(result.gstAmount).toBeCloseTo(8.1, 2);
    expect(result.subtotalWithFee).toBeCloseTo(753.1, 2);
  });

  it('subtracts the offer discount only from the grand total, not the subtotal used for offer validation', () => {
    const result = computeCheckoutPricing({
      ticketTotal: 1000,
      numTickets: 2,
      feePerTicket: 15,
      gstPercentage: 18,
      discountAmount: 100,
    });
    expect(result.subtotalWithFee).toBeCloseTo(1035.4, 2);
    expect(result.grandTotal).toBeCloseTo(935.4, 2);
  });

  it('defaults discount to 0 when omitted', () => {
    const withDiscount = computeCheckoutPricing({ ticketTotal: 500, numTickets: 1, feePerTicket: 15, gstPercentage: 18, discountAmount: 0 });
    const withoutDiscount = computeCheckoutPricing({ ticketTotal: 500, numTickets: 1, feePerTicket: 15, gstPercentage: 18 });
    expect(withoutDiscount.grandTotal).toBe(withDiscount.grandTotal);
  });

  it('handles zero tickets/fee without dividing by zero or producing NaN', () => {
    const result = computeCheckoutPricing({ ticketTotal: 0, numTickets: 0, feePerTicket: 15, gstPercentage: 18 });
    expect(result.convenienceTotal).toBe(0);
    expect(result.gstAmount).toBe(0);
    expect(result.grandTotal).toBe(0);
    expect(Number.isNaN(result.grandTotal)).toBe(false);
  });

  it('rounds to 2 decimal places rather than accumulating floating point drift', () => {
    const result = computeCheckoutPricing({ ticketTotal: 333, numTickets: 3, feePerTicket: 15.5, gstPercentage: 18 });
    // fee = 46.5, gst = 46.5 * 0.18 = 8.37 exactly at 2dp.
    expect(result.gstAmount).toBe(8.37);
    expect(result.grandTotal).toBe(387.87);
  });
});

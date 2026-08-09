export interface CheckoutPricingInput {
  ticketTotal: number;
  numTickets: number;
  feePerTicket: number;
  gstPercentage: number;
  discountAmount?: number;
}

export interface CheckoutPricingResult {
  convenienceTotal: number;
  gstAmount: number;
  /** Ticket total + convenience fee + GST, before any offer discount — what /offers/validate prices against. */
  subtotalWithFee: number;
  grandTotal: number;
}

/**
 * Mirrors cinema-hall-api's payment.Controller.js createOrder pricing
 * exactly: GST is charged on the convenience fee only, not on the ticket
 * price. This is display-only — the server recomputes the real amount at
 * POST /api/payment/create-order, so a client/server mismatch here would
 * only ever cause a wrong *display* total, never a wrong charge.
 */
export function computeCheckoutPricing({
  ticketTotal,
  numTickets,
  feePerTicket,
  gstPercentage,
  discountAmount = 0,
}: CheckoutPricingInput): CheckoutPricingResult {
  const convenienceTotal = numTickets * feePerTicket;
  const gstAmount = Math.round(convenienceTotal * (gstPercentage / 100) * 100) / 100;
  const subtotalWithFee = ticketTotal + convenienceTotal + gstAmount;
  const grandTotal = Math.round((subtotalWithFee - discountAmount) * 100) / 100;
  return { convenienceTotal, gstAmount, subtotalWithFee, grandTotal };
}

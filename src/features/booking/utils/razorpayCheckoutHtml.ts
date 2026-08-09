import { RazorpayWebViewParams } from '@ctypes/navigation';

/**
 * Inline HTML page that loads Razorpay's own checkout.js and opens the
 * standard checkout sheet — the same script tag the web app loads in
 * index.html. Bridges back to React Native via
 * `window.ReactNativeWebView.postMessage`, since there is no native
 * postMessage equivalent for a WebView-hosted script otherwise.
 *
 * Events posted back: {event:'success', payload:{razorpay_order_id,
 * razorpay_payment_id, razorpay_signature}} | {event:'dismiss'} |
 * {event:'error', message}.
 */
export function razorpayCheckoutHtml(params: RazorpayWebViewParams): string {
  const options = {
    key: params.keyId,
    amount: params.amountPaise,
    currency: params.currency,
    order_id: params.orderId,
    name: 'CineHall',
    description: params.description,
    prefill: {
      name: params.customerName,
      email: params.customerEmail,
      contact: params.customerPhone ?? '',
    },
    theme: { color: '#E6474E' },
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <style>
    html, body { margin: 0; padding: 0; height: 100%; background: #16171B; }
    #status {
      display: flex; align-items: center; justify-content: center; height: 100%;
      font-family: -apple-system, sans-serif; color: #A6A9B4; font-size: 14px;
    }
  </style>
</head>
<body>
  <div id="status">Opening secure checkout…</div>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    function post(message) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
    }

    try {
      var options = ${JSON.stringify(options)};
      options.handler = function (response) {
        post({
          event: 'success',
          payload: {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          },
        });
      };
      options.modal = {
        ondismiss: function () {
          post({ event: 'dismiss' });
        },
      };
      var rzp = new Razorpay(options);
      rzp.on('payment.failed', function (response) {
        post({ event: 'error', message: response.error && response.error.description ? response.error.description : 'Payment failed' });
      });
      rzp.open();
    } catch (err) {
      post({ event: 'error', message: String(err && err.message ? err.message : err) });
    }
  </script>
</body>
</html>`;
}

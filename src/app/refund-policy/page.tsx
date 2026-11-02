import Link from 'next/link';

const updated = 'October 2026';

export const metadata = {
  title: 'Refund Policy - Love Dove',
  description: 'Refund, billing, and cancellation policy for Love Dove.',
};

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-2 text-pink-600 text-sm font-bold uppercase tracking-widest">
          <Link href="/" className="hover:underline">Love Dove</Link>
          <span>/</span>
          <span>Refund Policy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Refund &amp; Cancellation Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: {updated}</p>

        <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-6 sm:p-10 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. No charges, no hidden fees</h2>
            <p>
              Love Dove is free to use. We do not charge a subscription fee and we do not run
              hidden charges. If we ever introduce a paid feature, the price will be clearly
              shown before you commit, and you must actively confirm it. There is no
              auto-renewing subscription today; if we add one, we will disclose it up front and
              it will be cancellable at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Refunds</h2>
            <p>
              For any item you do pay for:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Digital goods that are delivered (like a generated site) may be refunded within 14 days if the item is defective or not as described.</li>
              <li>If we change the terms or cancel a paid feature you asked for, you get a full refund.</li>
              <li>Refunds are processed to your original payment method within 5&ndash;10 business days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Cancellation &amp; deactivation</h2>
            <p>
              Because most of the Service is free, there is nothing to cancel. You can delete
              your account and all your data at any time from Settings, in one click, with no
              waiting period and no reason required. There are no &ldquo;dark patterns&rdquo;: we
              show the confirmation step plainly and honor it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. How to request a refund</h2>
            <p>
              Email us at
              <a href="mailto:salariarudar5@gmail.com" className="text-pink-600 font-semibold">
                {' '}salariarudar5@gmail.com
              </a> with your account email and what you paid for. We respond within 30 days
              and aim to resolve it within 7.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Related policies</h2>
            <p>
              See our <Link href="/terms" className="text-pink-600 font-semibold hover:underline">terms of service</Link> and{' '}
              <Link href="/privacy" className="text-pink-600 font-semibold hover:underline">privacy policy</Link> for the full picture.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

const updated = 'October 2026';

export const metadata = {
  title: 'Terms of Service - Love Dove',
  description: 'The terms and conditions that govern use of Love Dove.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-2 text-pink-600 text-sm font-bold uppercase tracking-widest">
          <Link href="/" className="hover:underline">Love Dove</Link>
          <span>/</span>
          <span>Terms of Service</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: {updated}</p>

        <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-6 sm:p-10 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance</h2>
            <p>
              By creating an account or using Love Dove (the &ldquo;Service&rdquo;), you agree to
              these terms and to our <Link href="/privacy" className="text-pink-600 font-semibold hover:underline">privacy policy</Link>.
              If you do not agree, do not use the Service. By accepting, you confirm you are 16 or older.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. What the Service is</h2>
            <p>
              Love Dove lets you create birthday websites, play couple games, add friends, and
              celebrate anniversaries. The Service is provided free of charge. We make no
              guarantee that it will be uninterrupted or error-free, and we may change, suspend,
              or discontinue features at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Your account</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You are responsible for your username, password, and for everything that happens under your account.</li>
              <li>Provide a valid email address and keep it current.</li>
              <li>One user = one account. Creating or using another person&rsquo;s account is not allowed.</li>
              <li>We may close accounts that violate these terms.</li>
              <li>You can delete your account and all associated data at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Acceptable use</h2>
            <p>You may not:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Post content that is illegal, harassing, hateful, or sexually explicit.</li>
              <li>Use the Service to target or collect data on minors.</li>
              <li>Upload malware, scrape the site at scale, or interfere with its operation.</li>
              <li>Impersonate another person or misrepresent the source of your content.</li>
              <li>Attempt to access data that does not belong to you.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Content &amp; IP</h2>
            <p>
              You keep ownership of the content you create (birthday sites, messages, guestbook
              entries, game scores). By posting it, you grant us a limited license to store and
              display it only to operate the Service. Anything Love Dove owns (the app, its name,
              design, and code) stays ours. AI-generated responses from the in-app assistant are
              provided for information and do not constitute professional advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Intellectual property &amp; third-party marks</h2>
            <p>
              Game titles that reference well-known films (for example &ldquo;Dilwale Dulhania
              Le Jayenge&rdquo; or &ldquo;Sholay&rdquo;) are used as informal, non-commercial names
              for original games we created. We do not claim ownership of, or a license to, those
              third-party trademarks or any associated logos, artwork, or audio. This is a
              personal, fan-made project; it is not affiliated with or endorsed by the rights
              holders.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. AI-assisted content</h2>
            <p>
              Where we use AI (the in-app &ldquo;LoveBot&rdquo; relationship assistant), the output is
              labelled as AI-generated. It is produced from a local knowledge base and is meant as
              general guidance, not a substitute for professional help.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Billing &amp; refunds</h2>
            <p>
              Love Dove is free. We do not charge for access. If you ever pay for an optional
              item, see our <Link href="/refund-policy" className="text-pink-600 font-semibold hover:underline">refund policy</Link>.
              There are no hidden fees and no auto-renewing subscriptions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Cancellation &amp; deactivation</h2>
            <p>
              Because the Service is free, there is nothing to cancel. You can pause your account,
              change your privacy settings, or delete your account and all data at any time, with
              one click, from Settings — no forms, no waiting periods, no dark patterns.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Disclaimers &amp; limitation of liability</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranty of any kind. To the maximum
              extent permitted by law, we are not liable for damages arising from your use of the
              Service. We do not make false uptime or security claims; we are a small consumer
              project.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Takedown &amp; copyright (DMCA-style)</h2>
            <p>
              If you believe content on the Service infringes your copyright, contact us at
              <a href="mailto:salariarudar5@gmail.com" className="text-pink-600 font-semibold">
                {' '}salariarudar5@gmail.com
              </a> and we will review and remove it promptly if the claim is valid.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Changes to these terms</h2>
            <p>
              We may update these terms. If the change is material, we will post it here with a
              new &ldquo;Last updated&rdquo; date and, where practical, notify you by email. Your
              continued use after the effective date means you accept the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Governing law &amp; contact</h2>
            <p>
              These terms are governed by the laws of the place of operation. Love Dove is
              operated by Rudar Salaria. Contact:
              <a href="mailto:salariarudar5@gmail.com" className="text-pink-600 font-semibold">
                {' '}salariarudar5@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

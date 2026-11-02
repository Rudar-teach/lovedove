import Link from 'next/link';

const updated = 'October 2026';

export const metadata = {
  title: 'Privacy Policy - Love Dove',
  description: 'How Love Dove collects, uses, and protects your personal data.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-2 text-pink-600 text-sm font-bold uppercase tracking-widest">
          <Link href="/" className="hover:underline">Love Dove</Link>
          <span>/</span>
          <span>Privacy Policy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: {updated}</p>

        <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-6 sm:p-10 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. What we collect</h2>
            <p>
              Love Dove (the &ldquo;Service&rdquo;) collects only the data needed to run it:
              your account (email, username, profile photo) through Supabase Auth, the content
              you create (birthday sites, messages, guestbook entries, game scores), and
              analytics of page views. We do not collect unnecessary data. Marketing email is
              only sent if you explicitly opt in, and every email includes an unsubscribe link.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How we use it</h2>
            <p>
              Data is used to: authenticate your account; store and display your created
              content; run games and challenges with friends; and send emails you have asked
              for (proposal notifications). AI features (relationship advisor) respond from a
              local knowledge base and do not send your messages to third-party AI providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Cookies &amp; tracking</h2>
            <p>
              We use strictly necessary cookies for authentication and session management.
              Marketing or advertising trackers are blocked until you consent via the cookie
              banner. No third-party advertising SDKs are loaded.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data retention &amp; deletion</h2>
            <p>
              Your account data is retained while your account exists. You can delete your
              account and all associated data at any time from Settings or by contacting us
              (below). Proposal emails we send are retained only as needed for delivery
              receipts and are not repurposed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Your rights</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access: request a copy of your data.</li>
              <li>Correction: edit your profile directly.</li>
              <li>Deletion: delete your account and content at any time.</li>
              <li>Marketing consent: separate from functional use; opt in/out independently.</li>
              <li>AI training: user data and content are <strong>not</strong> used to train AI models.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Children</h2>
            <p>
              The Service is intended for users 16+. We do not knowingly collect data from
              children; if you believe a minor has created an account, contact us and we will
              delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Sub-processors</h2>
            <p>
              Supabase (auth, database, storage — hosted in the Supabase cloud) and Vercel /
              Netlify (web hosting and CDN). We process personal data only with these
              sub-processors for hosting and identity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contact &amp; business details</h2>
            <p>
              Love Dove, operated by Rudar Salaria. Business contact:
              <a href="mailto:salariarudar5@gmail.com" className="text-pink-600 font-semibold">
                {' '}salariarudar5@gmail.com
              </a>. For data access or deletion requests, email us and we will respond within
              30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. No SOC 2 / false claims</h2>
            <p>
              Love Dove is a small consumer project. We do not claim SOC 2, ISO 27001, or any
              other security certification we do not hold.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

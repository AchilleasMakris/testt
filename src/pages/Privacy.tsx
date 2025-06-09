import React from "react";

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-black text-white flex items-center justify-center py-16 px-4">
      <div className="bg-gray-900/80 border-2 border-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-8 backdrop-blur-md">
        <div className="flex justify-start mb-6">
          <button
            onClick={() => window.location.href = '/'}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 text-black font-semibold shadow hover:scale-105 transition-transform border border-blue-200"
          >
            ← Return to Home
          </button>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">UniTracker Privacy Policy</h1>
        <div className="text-gray-200 text-base md:text-lg space-y-4">
          <p><strong>Effective Date:</strong> June 1, 2025<br/><strong>Version:</strong> 1.0</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">Information We Collect</h2>
          <p><strong>Name and Email Address:</strong><br/>Collected when you create an account or update your profile. We use your name and email to identify your account and communicate with you (for example, to send password resets or account notifications).</p>
          <p><strong>Academic Progress Data:</strong><br/>Information you enter about your courses, grades, and study progress. We collect this data to track and display your university progress within the app (for example, calculating GPAs or course completion).</p>
          <p><strong>Device Identifiers and Usage Data:</strong><br/>We collect unique device IDs and app usage information. This includes non‑personal data like device model or OS version, used to recognize your device, prevent fraud, and help debug issues.</p>
          <p><strong>Analytics Data:</strong><br/>Through Vercel Web Analytics, we gather anonymized usage statistics (such as features accessed, session duration, and error reports). No personal identifiers or cookies are used; data is aggregated to improve the app’s functionality and performance.</p>
          <p>We disclose each category of data we collect and the purposes for its use (such as app functionality, analytics, account management).</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">How We Use Your Data</h2>
          <p><strong>Service Provision:</strong><br/>We use your account and academic data to operate and personalize the app. Your information is necessary to enable core features (tracking progress, saving preferences, etc.), in line with the performance of our contract with you.</p>
          <p><strong>Account Management:</strong><br/>We use your email to manage your account (e.g. verify your identity, deliver account notices, or reset passwords) and handle any subscription changes.</p>
          <p><strong>Communication:</strong><br/>We use your contact information to send service-related communications (such as updates, security alerts, or support responses). You may choose whether to receive optional newsletters or promotional offers.</p>
          <p><strong>Analytics and Improvement:</strong><br/>We analyze anonymized usage data (via Vercel Analytics) to understand how the app is used and to improve features and performance. These analytics help us make the app more reliable, efficient, and user-friendly.</p>
          <p><strong>Legal and Safety:</strong><br/>We may use your data to comply with legal obligations or protect against fraud and abuse. For example, we may analyze login patterns for security or retain certain information to prevent repeated policy violations.</p>
          <p>Each use of data is limited to what is needed for the stated purposes. Personal data is processed only to fulfill contractual commitments or legal obligations, to protect user safety, or in other legitimate interests (such as service improvement).</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">Legal Basis for Processing Personal Data</h2>
          <p>For users in the EU (and similar jurisdictions), UniTracker relies on GDPR lawful bases:</p>
          <p><strong>Performance of a Contract:</strong> We process your personal data when it is necessary to provide you the app’s features (account setup, progress tracking, subscription management). Without such data, we could not fulfill our agreement to deliver the service.</p>
          <p><strong>User Consent:</strong> For optional activities (such as receiving marketing emails or certain analytics), we seek your clear consent. You may withdraw consent at any time.</p>
          <p><strong>Legitimate Interests:</strong> We may process data based on our legitimate interests (for example, improving the app, securing our service, or maintaining internal records), provided that these interests do not override your privacy rights.</p>
          <p><strong>Legal Compliance:</strong> We will also process personal data when required by law (e.g. responding to lawful requests by authorities).</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">Data Storage and Security</h2>
          <p>Your data is stored on secure cloud servers. We use Supabase (a cloud database service) to host our data under strict security controls. Supabase encrypts all data at rest using AES-256 and in transit using TLS, ensuring that your information is protected against unauthorized access.</p>
          <p>We follow industry-standard security practices (such as firewalls, access controls, and monitoring) to safeguard data integrity and confidentiality. Only authorized personnel with a business need can access personal information, and user passwords are hashed and salted.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">Data Retention</h2>
          <p>We keep your personal data only as long as necessary to provide the app’s services or as required by law. Once your account is deleted or you cease to use the app, we will erase your personal data from our active systems. In practice, we delete account data within a reasonable time (e.g. 30 days) after deletion. De-identified or aggregated data (which cannot be linked to you) may be retained indefinitely for analytics and improvement purposes.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">Third-Party Services and Sharing</h2>
          <p>UnITracker does not sell or rent your personal information. We may share data only with service providers that help us operate the app, or when legally required:</p>
          <ul className="list-disc pl-6">
            <li><strong>Cloud Service (Supabase):</strong> We use Supabase to store and process data on our behalf. Supabase is a data processor and only processes data under our instructions.</li>
            <li><strong>Analytics Provider (Vercel):</strong> We share usage data with Vercel Web Analytics to generate anonymized reports. Vercel’s service is privacy-focused (no cookies, no identifiers) and only provides aggregated insights.</li>
            <li><strong>Payment Processors:</strong> For Premium Subscription purchases, payments are handled by third-party platforms (e.g. Google Play, Apple App Store, or Stripe). We do not collect or store your credit card or payment details. We only receive confirmation of successful subscription purchase (and renewal) to unlock Premium features.</li>
            <li><strong>Legal Requests:</strong> We may disclose personal data if required by law (e.g. valid court orders or government requests) or to protect our rights, safety, or the safety of others.</li>
          </ul>
          <p>Under Google Play policy, data shared with a service provider to process on our behalf is not considered “sharing” to unauthorized third parties. Similarly, if you make an in-app purchase and are redirected to a payment service, the details you provide go directly to that service; we do not see them.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">Analytics and Tracking</h2>
          <p>We use Vercel Web Analytics for app usage statistics. Vercel’s analytics only collects anonymized data about page views and events and explicitly does not use cookies. This means it cannot link information to you as an individual. We use these analytics solely to count sessions, understand which features are most used, and identify app errors.</p>
          <p>If you prefer not to be tracked by our analytics, please contact us (see Contact Information) to discuss options.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">Premium Subscription and Payments</h2>
          <p>UnITracker offers an optional Premium Subscription for advanced features. Payments are processed through the app store (Google Play or Apple App Store) or a secure payment gateway. When you purchase Premium, you do so under the payment provider’s terms, and they handle your financial information.</p>
          <p>We do not store credit card details or view any full payment information – only your subscription status (active/inactive) is recorded in our system. Cancellations or refunds must be processed through the same app store or payment provider.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">Your Privacy Rights</h2>
          <p>If you are a resident of the EU (or other jurisdictions with data protection laws), you have certain rights regarding your personal data:</p>
          <ul className="list-disc pl-6">
            <li><strong>Access:</strong> You have the right to request and receive a copy of the personal data we hold about you.</li>
            <li><strong>Rectification:</strong> You can ask us to correct any inaccurate or incomplete information.</li>
            <li><strong>Erasure (Right to be Forgotten):</strong> You can request that we delete your personal data when it is no longer needed for the purposes described, or if you withdraw consent.</li>
            <li><strong>Restriction:</strong> You have the right to request that we limit how we use your data under certain circumstances (for example, if you contest its accuracy).</li>
            <li><strong>Portability:</strong> You can request a machine-readable copy of your personal data for transfer to another service.</li>
            <li><strong>Objection:</strong> You can object to our processing of your data (for example, for marketing). If you do, we will comply unless we have compelling legitimate grounds to continue.</li>
            <li><strong>Withdraw Consent:</strong> If we rely on your consent for certain processing, you may withdraw your consent at any time; this will not affect the lawfulness of processing before withdrawal.</li>
          </ul>
          <p>To exercise any of these rights, please contact us (see below). We will respond within one month (as required by GDPR). If you are not satisfied with our response, you have the right to lodge a complaint with your local data protection authority.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">Children’s Privacy</h2>
          <p>UniTracker is designed for use by university students and is not intended for children. We do not knowingly collect personal data from anyone under 16. If we learn that personal data of a child under 16 has been collected without parental consent, we will delete that data immediately. If you believe a child has provided us data, please contact us.</p>
          <p>The GDPR provides additional protections for children, including a right to erasure of data collected when they were a child.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">Data Retention and Deletion</h2>
          <p>In accordance with GDPR principles, we retain personal data only as long as necessary for the purposes stated above. When you delete your account or request data deletion, we will remove your personal data from our active databases. We may keep logs or backups for a limited period for legal compliance or auditing, after which these are securely deleted or anonymized.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. When we do, we will revise the “Effective Date” above and post the new version in the app and on our website. If changes are significant, we will provide a prominent notice (such as an in-app message or email) before the changes take effect. We encourage you to review this policy periodically to stay informed about our privacy practices.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">Contact Information</h2>
          <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
          <p><strong>Email:</strong> <a href="mailto:lexlarisa@hotmail.com" className="text-blue-400 underline hover:text-blue-300 transition-colors">lexlarisa@hotmail.com</a></p>
          <p>We are committed to resolving any privacy issues and will respond to your inquiries promptly.</p>
        </div>
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 text-black font-semibold shadow hover:scale-105 transition-transform border border-blue-200"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

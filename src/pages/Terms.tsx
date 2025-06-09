import React from "react";

const Terms: React.FC = () => {
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
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">UniTracker Terms of Use</h1>
        <div className="text-gray-200 text-base md:text-lg space-y-4">
          <p><strong>Effective Date:</strong> June 1, 2025<br/><strong>Version:</strong> 1.0</p>
          <p>Please read these Terms of Use ("Terms", "Agreement") carefully before using the UniTracker mobile application (the "App") operated by UniTracker ("we", "our", or "us").</p>
          <p>By accessing or using the App, you agree to be bound by these Terms. If you do not agree with any part of the Terms, you may not access or use the App.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">1. Use of the App</h2>
          <p>UniTracker is designed to help university students track their academic progress. You must be at least 16 years old to use the App. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">2. User Accounts</h2>
          <p>To use UniTracker, you must create an account. You agree to provide accurate and complete information when registering and to keep your information up to date.</p>
          <p>You are responsible for safeguarding your password and any activity under your account. If you believe your account has been compromised, you must notify us immediately.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">3. Premium Features and Subscriptions</h2>
          <p>UniTracker offers optional Premium features via subscription. Payment is handled through the app store (e.g., Google Play, Apple App Store). Subscriptions renew automatically unless canceled. Cancellation and refunds must be handled through the app store where you made the purchase.</p>
          <p>We reserve the right to change pricing or features of the Premium service with notice.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6">
            <li>Use the App for any unlawful purpose or in violation of any applicable laws.</li>
            <li>Reverse engineer, decompile, or attempt to extract the source code of the App.</li>
            <li>Interfere with the operation of the App or try to gain unauthorized access to our systems.</li>
            <li>Upload malicious code or content that is harmful, illegal, or infringes on intellectual property rights.</li>
          </ul>
          <h2 className="font-semibold text-xl mt-6 mb-2">5. Intellectual Property</h2>
          <p>All content, trademarks, logos, and intellectual property within the App are owned by UniTracker or its licensors and protected by copyright and trademark laws. You may not reproduce, copy, modify, or distribute any part of the App without our prior written consent.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">6. Privacy</h2>
          <p>Our Privacy Policy explains how we collect, use, and protect your personal data. By using the App, you consent to the collection and use of your data in accordance with the <a href="/privacy" className="text-blue-400 underline hover:text-blue-300 transition-colors">Privacy Policy</a>.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">7. Termination</h2>
          <p>We reserve the right to suspend or terminate your access to the App at any time, with or without notice, if you violate these Terms or misuse the service. Upon termination, your right to use the App will immediately cease.</p>
          <p>You may delete your account at any time through the app interface or by contacting us.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">8. Disclaimer of Warranties</h2>
          <p>The App is provided “as is” and “as available.” We make no warranties, express or implied, regarding the availability, reliability, or accuracy of the App. We disclaim all warranties, including merchantability, fitness for a particular purpose, and non-infringement.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">9. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, UniTracker shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of data or profits, arising from your use of the App.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">10. Changes to Terms</h2>
          <p>We may modify these Terms at any time. If we do, we will update the "Effective Date" and provide reasonable notice through the App or by email. Your continued use of the App after the changes become effective constitutes your agreement to the new Terms.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">11. Governing Law</h2>
          <p>These Terms are governed by and construed in accordance with the laws of your country of residence, unless otherwise required by applicable law.</p>
          <h2 className="font-semibold text-xl mt-6 mb-2">12. Contact</h2>
          <p>If you have any questions or concerns about these Terms, you can contact us:</p>
          <p><strong>Email:</strong> <a href="mailto:lexlarisa@hotmail.com" className="text-blue-400 underline hover:text-blue-300 transition-colors">lexlarisa@hotmail.com</a></p>
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

export default Terms;

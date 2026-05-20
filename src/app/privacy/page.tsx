export const metadata = {
    title: "Privacy Policy | Vaiu",
    description: "Privacy Policy for Vaiu",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 py-12 md:py-16">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
                    Privacy Policy
                </h1>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300">
                    <p className="text-lg">
                        Last updated: January 3, 2026
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            1. Introduction
                        </h2>
                        <p>
                            Vaiu (&quot;we&quot; or &quot;us&quot; or &quot;our&quot;) operates the website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our website and the choices you have associated with that data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            2. Information Collection and Use
                        </h2>
                        <p>
                            We collect several different types of information for various purposes to provide and improve our service to you.
                        </p>

                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-3">
                            Types of Data Collected:
                        </h3>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Personal Data: Email address, name, phone number, address, country</li>
                            <li>Usage Data: Browser type, IP address, pages visited, time and date of visit</li>
                            <li>Cookies and Tracking Data: Information collected through cookies and similar technologies</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            3. Use of Data
                        </h2>
                        <p>
                            Vaiu uses the collected data for various purposes:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>To provide and maintain our website</li>
                            <li>To notify you about changes to our website</li>
                            <li>To provide customer support</li>
                            <li>To gather analysis or valuable information to improve our website</li>
                            <li>To monitor the usage of our website</li>
                            <li>To detect, prevent and address technical issues</li>
                            <li>To provide you with news, special offers and general information</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            4. Security of Data
                        </h2>
                        <p>
                            The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            5. Cookies
                        </h2>
                        <p>
                            We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            6. Third-Party Links
                        </h2>
                        <p>
                            Our website may contain links to other sites that are not operated by us. This Privacy Policy applies only to information we collect. We are not responsible for the privacy practices of other websites. We encourage you to review the privacy policies of any third-party services before providing your information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            7. Your Rights
                        </h2>
                        <p>
                            You have the right to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Data portability</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            8. Children&apos;s Privacy
                        </h2>
                        <p>
                            Our website is not directed to anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If we become aware that a child under 13 has provided us with personal information, we immediately delete such information from our systems.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            9. Changes to This Privacy Policy
                        </h2>
                        <p>
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date at the top of this page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            10. Contact Us
                        </h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at{" "}
                            <a href="mailto:contact.vaiuteam@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                                contact.vaiuteam@gmail.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

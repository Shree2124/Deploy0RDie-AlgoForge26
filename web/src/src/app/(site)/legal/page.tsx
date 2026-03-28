'use client';
import React from 'react';
import { SiteHeader } from '@/components/layouts/SiteHeader';
import { FooterSection } from '@/components/LandingPage/FooterSection';

export default function LegalPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">Legal & Compliance</h1>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Terms of Use</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Welcome to Civic.ai. By accessing this portal, you agree to use it for lawful purposes only.
                            This platform is designed to facilitate transparency in public infrastructure projects.
                            Any misuse, including submitting false reports or attempting to breach security, will be subject to legal action under the IT Act, 2000.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Privacy Policy</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We value your privacy. Your personal data is encrypted and stored securely.
                            We do not share your personal information with third parties without your consent, except as required by law.
                            Anonymity options are available for whistleblowers.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">RTI Act Compliance</h2>
                        <p className="text-slate-600 leading-relaxed">
                            This portal is compliant with the Right to Information Act, 2005.
                            Citizens can use the data available here to file RTI applications.
                            The AI Legal Assistant can help draft these applications.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Contact Us</h2>
                        <p className="text-slate-600 leading-relaxed">
                            For any legal queries, please contact our Grievance Officer at support@civic.ai.
                        </p>
                    </section>
                </div>
            </main>
            <FooterSection />
        </div>
    );
}

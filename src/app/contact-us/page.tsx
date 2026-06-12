"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Custom easings from emil-design-eng skill
const EASE_OUT = [0.23, 1, 0.32, 1] as [number, number, number, number];

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage("Please fill in all required fields.");
      setFormStatus("error");
      return;
    }

    setFormStatus("submitting");
    setErrorMessage("");

    try {
      // Simulate premium network request with beautiful micro-animations
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setFormStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch {
      setErrorMessage("Something went wrong. Please try again later.");
      setFormStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-[family-name:var(--font-plus-jakarta)]">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-20 border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(#a68b6a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05]" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a68b6a]">
            Connect With Us
          </span>
          <h1 id="contact-us-title" className="mt-3 text-3xl font-bold tracking-tight text-[#2c2c2c] sm:text-5xl font-headline">
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-gray-500">
            Have questions about planning your wedding or showcasing your services? Reach out to our dedicated support team.
          </p>
        </div>
      </section>

      {/* Grid Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            
            {/* Info Cards Side (40%) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Corporate Office */}
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#a68b6a]/10 text-[#a68b6a]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#2c2c2c]">Corporate Office</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
                      152 - 154 Roosevelt Avenue,<br />
                      Quezon City, Philippines
                    </p>
                    <a
                      id="view-map-link"
                      href="https://maps.google.com/?q=152+Roosevelt+Avenue+Quezon+City+Philippines"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center text-[12px] font-semibold text-[#a68b6a] hover:text-[#957a5c] transition-colors"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                </div>
              </div>

              {/* Phone Contacts */}
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#a68b6a]/10 text-[#a68b6a]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#2c2c2c]">Telephone & Hotline</h3>
                    <p className="mt-2 text-[13px] text-gray-500">
                      We are available via mobile and WhatsApp:
                    </p>
                    <a
                      id="phone-call-link"
                      href="tel:+639175220707"
                      className="mt-2 block text-[13px] font-medium text-[#a68b6a] hover:text-[#957a5c] transition-colors"
                    >
                      +63 917 522 0707
                    </a>
                  </div>
                </div>
              </div>

              {/* Email Support */}
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#a68b6a]/10 text-[#a68b6a]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#2c2c2c]">General Inquiries</h3>
                    <p className="mt-2 text-[13px] text-gray-500">
                      Drop us an email. We typically reply within 24 hours:
                    </p>
                    <a
                      id="email-support-link"
                      href="mailto:info@themesnmotifs.com"
                      className="mt-2 block text-[13px] font-medium text-[#a68b6a] hover:text-[#957a5c] transition-colors"
                    >
                      info@themesnmotifs.com
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Interactive Form Side (60%) */}
            <div className="lg:col-span-7">
              <div className="rounded-xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
                <h3 className="text-[18px] font-semibold text-[#2c2c2c] font-headline">Send a Message</h3>
                <p className="mt-1 text-[13px] text-gray-400">
                  Please fill out the form below and our team will get in touch with you.
                </p>

                <AnimatePresence mode="wait">
                  {formStatus === "success" ? (
                    <motion.div
                      key="success-container"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                      className="mt-6 flex flex-col items-center justify-center text-center py-10"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="mt-4 text-[16px] font-semibold text-[#2c2c2c]">Inquiry Sent Successfully!</h4>
                      <p className="mt-2 text-[13px] text-gray-500 max-w-sm">
                        Thank you for contacting Themes & Motifs The Wedding App. We have received your inquiry and will respond to you as soon as possible.
                      </p>
                      <button
                        id="reset-form-btn"
                        onClick={() => setFormStatus("idle")}
                        className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-gray-50 border border-gray-200 px-4 text-[13px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="contact-form"
                      onSubmit={(e) => void handleSubmit(e)}
                      className="mt-6 space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {formStatus === "error" && (
                        <div className="rounded-lg bg-red-50 p-3 text-[13px] text-red-600 border border-red-100 flex items-center gap-2">
                          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Name Input */}
                        <div>
                          <label htmlFor="contact-name" className="block text-[12px] font-semibold text-gray-600">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="contact-name"
                            name="name"
                            type="text"
                            required
                            placeholder="Juan dela Cruz"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={formStatus === "submitting"}
                            className="mt-1 block w-full h-10 rounded-lg border border-gray-200 px-3 text-[13px] transition-all"
                          />
                        </div>

                        {/* Email Input */}
                        <div>
                          <label htmlFor="contact-email" className="block text-[12px] font-semibold text-gray-600">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="contact-email"
                            name="email"
                            type="email"
                            required
                            placeholder="juan@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={formStatus === "submitting"}
                            className="mt-1 block w-full h-10 rounded-lg border border-gray-200 px-3 text-[13px] transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Phone Input */}
                        <div>
                          <label htmlFor="contact-phone" className="block text-[12px] font-semibold text-gray-600">
                            Phone Number
                          </label>
                          <input
                            id="contact-phone"
                            name="phone"
                            type="tel"
                            placeholder="0917 123 4567"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={formStatus === "submitting"}
                            className="mt-1 block w-full h-10 rounded-lg border border-gray-200 px-3 text-[13px] transition-all"
                          />
                        </div>

                        {/* Subject Selector */}
                        <div>
                          <label htmlFor="contact-subject" className="block text-[12px] font-semibold text-gray-600">
                            Subject
                          </label>
                          <select
                            id="contact-subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            disabled={formStatus === "submitting"}
                            className="mt-1 block w-full h-10 rounded-lg border border-gray-200 px-3 text-[13px] transition-all"
                          >
                            <option value="">Select a subject</option>
                            <option value="couple_inquiry">Wedding Planning / Couple Account</option>
                            <option value="vendor_inquiry">Exhibitor or Listing Inquiries</option>
                            <option value="expo_summit">Wedding Expo & Summit</option>
                            <option value="support">Technical Support</option>
                          </select>
                        </div>
                      </div>

                      {/* Message Textarea */}
                      <div>
                        <label htmlFor="contact-message" className="block text-[12px] font-semibold text-gray-600">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="contact-message"
                          name="message"
                          required
                          rows={4}
                          placeholder="How can we help you plan your perfect day?"
                          value={formData.message}
                          onChange={handleChange}
                          disabled={formStatus === "submitting"}
                          className="mt-1 block w-full rounded-lg border border-gray-200 p-3 text-[13px] transition-all resize-none"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        id="submit-contact-form-btn"
                        type="submit"
                        disabled={formStatus === "submitting"}
                        className="w-full flex h-10 items-center justify-center rounded-lg bg-[#a68b6a] text-white text-[13px] font-medium hover:bg-[#957a5c] transition-colors disabled:opacity-60 shadow-sm"
                      >
                        {formStatus === "submitting" ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending inquiry...
                          </span>
                        ) : (
                          "Send Message"
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

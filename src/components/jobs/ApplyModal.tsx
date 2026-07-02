"use client";

import { useState, useRef } from "react";
import { applyToJob } from "@/actions/seeker";
import { motion, AnimatePresence, backdropVariants, scaleInVariants } from "@/components/ui/Motion";

interface ApplyModalProps {
    jobId: string;
    jobTitle: string;
    companyName?: string;
    onSuccess: () => void;
    onClose: () => void;
}

export default function ApplyModal({
    jobId,
    jobTitle,
    companyName,
    onSuccess,
    onClose,
}: ApplyModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [coverLetter, setCoverLetter] = useState("");
    const [phone, setPhone] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const uploadResume = async (): Promise<string> => {
        if (!resumeFile) return "";
        const fd = new FormData();
        fd.append("file", resumeFile);
        fd.append("type", "resume");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Resume upload failed");
        const { url } = await res.json();
        return url as string;
    };

    const handleSubmit = async () => {
        if (!coverLetter.trim()) {
            setError("Please write a cover letter.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            setUploading(true);
            const resumeUrl = await uploadResume();
            setUploading(false);

            const result = await applyToJob(jobId, {
                coverLetter: coverLetter.trim(),
                phone: phone.trim(),
                resumeUrl,
            });

            if (result.ok) {
                onSuccess();
            } else {
                setError(result.error ?? "Something went wrong.");
            }
        } catch {
            setError("Failed to submit. Please try again.");
        } finally {
            setSubmitting(false);
            setUploading(false);
        }
    };

    return (
        /* Backdrop */
        <AnimatePresence>
        <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                key="panel"
                variants={scaleInVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white">Apply for Position</h2>
                            <p className="text-teal-100 text-sm mt-0.5 truncate">
                                {jobTitle}{companyName ? ` · ${companyName}` : ""}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-teal-200 hover:text-white transition mt-0.5"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mt-4">
                        {[1, 2].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s
                                            ? "bg-white text-teal-600"
                                            : step > s
                                                ? "bg-teal-400 text-white"
                                                : "bg-teal-400/50 text-teal-200"
                                        }`}
                                >
                                    {step > s ? "✓" : s}
                                </div>
                                <span
                                    className={`text-xs ${step === s ? "text-white font-medium" : "text-teal-200"}`}
                                >
                                    {s === 1 ? "Your Info" : "Cover Letter"}
                                </span>
                                {s < 2 && <div className="w-8 h-px bg-teal-400/50" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body — step content slides left/right */}
                <div className="px-6 py-5 overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.22, ease: "easeOut" }}
                                className="space-y-4"
                            >
                                <p className="text-sm text-gray-500">
                                    Provide your contact details and upload your resume.
                                </p>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                {/* Resume upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Resume / CV <span className="text-gray-400 font-normal">(PDF, max 5MB)</span>
                                    </label>
                                    <div
                                        onClick={() => fileRef.current?.click()}
                                        className="border-2 border-dashed border-gray-200 rounded-lg px-4 py-6 flex flex-col items-center gap-2 cursor-pointer hover:border-teal-400 hover:bg-teal-50/40 transition"
                                    >
                                        <span className="text-2xl">📄</span>
                                        <span className="text-sm text-gray-500">
                                            {resumeFile ? (
                                                <span className="text-teal-600 font-medium">{resumeFile.name}</span>
                                            ) : (
                                                <>Click to upload <span className="text-teal-600 font-medium">resume</span></>
                                            )}
                                        </span>
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    onClick={() => setStep(2)}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition"
                                >
                                    Next →
                                </motion.button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 30 }}
                                transition={{ duration: 0.22, ease: "easeOut" }}
                                className="space-y-4"
                            >
                                <p className="text-sm text-gray-500">
                                    Write a concise cover letter explaining why you are the best fit.
                                </p>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cover Letter <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                        rows={7}
                                        placeholder={`Dear Hiring Manager,\n\nI am excited to apply for the ${jobTitle} role...`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1 text-right">
                                        {coverLetter.length} / 2000 characters
                                    </p>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.p
                                            key="error"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg"
                                        >
                                            {error}
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                <div className="flex gap-3">
                                    <motion.button
                                        onClick={() => setStep(1)}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
                                    >
                                        ← Back
                                    </motion.button>
                                    <motion.button
                                        onClick={handleSubmit}
                                        disabled={submitting || !coverLetter.trim()}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex-1 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                                    >
                                        {uploading ? "Uploading…" : submitting ? "Submitting…" : "Submit Application"}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
        </AnimatePresence>
    );
}

"use client";

import { useState } from "react";
import ApplyModal from "@/components/jobs/ApplyModal";

type ApplicationStatus = "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED" | null;

interface Props {
  jobId: string;
  jobTitle: string;
  companyName?: string;
  initialStatus?: ApplicationStatus;
}

const statusDisplay: Record<NonNullable<ApplicationStatus>, { label: string; className: string }> = {
  PENDING:  { label: "✓ Application Submitted",  className: "bg-green-50 border-green-200 text-green-700" },
  REVIEWED: { label: "👁 Application Under Review", className: "bg-blue-50 border-blue-200 text-blue-700" },
  APPROVED: { label: "🎉 Application Approved",  className: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  REJECTED: { label: "✕ Application Rejected",   className: "bg-red-50 border-red-200 text-red-600" },
};

export default function ApplyButton({ jobId, jobTitle, companyName, initialStatus = null }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState<ApplicationStatus>(initialStatus);

  // Any existing application — block re-apply regardless of status
  if (status !== null) {
    const { label, className } = statusDisplay[status];
    return (
      <div className={`w-full py-2.5 text-center border text-sm font-semibold rounded-xl ${className}`}>
        {label}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-xl hover:bg-teal-800 transition"
      >
        Apply Now
      </button>

      {showModal && (
        <ApplyModal
          jobId={jobId}
          jobTitle={jobTitle}
          companyName={companyName}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            setStatus("PENDING");
          }}
        />
      )}
    </>
  );
}

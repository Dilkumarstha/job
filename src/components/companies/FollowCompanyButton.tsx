"use client";

import { useState, useTransition } from "react";
import { toggleFollowCompany } from "@/actions/seeker";

interface FollowCompanyButtonProps {
  companyId: string;
  initialFollowing: boolean;
}

export default function FollowCompanyButton({ companyId, initialFollowing }: FollowCompanyButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleFollowCompany(companyId);
      setFollowing(result.following);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
        following
          ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
          : "bg-teal-700 text-white hover:bg-teal-800"
      }`}
    >
      {isPending ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : following ? (
        "Following"
      ) : (
        "+ Follow"
      )}
    </button>
  );
}

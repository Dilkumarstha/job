"use client";

import { useState, useTransition } from "react";
import { toggleFollowCompany } from "@/actions/seeker";

interface FollowCompanyMiniProps {
  companyId: string;
  initialFollowing: boolean;
}

export default function FollowCompanyMini({ companyId, initialFollowing }: FollowCompanyMiniProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleFollowCompany(companyId);
      setFollowing(result.following);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`text-xs font-semibold rounded-lg px-2.5 py-1 transition ${
        following
          ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
          : "bg-teal-600 text-white hover:bg-teal-700"
      }`}
    >
      {isPending ? (
        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : following ? (
        "Following"
      ) : (
        "+ Follow"
      )}
    </button>
  );
}

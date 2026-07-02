"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateCompanyProfileSchema, type UpdateCompanyProfileInput } from "@/lib/validations/profile";

interface CompanyProfileFormProps {
  profile: {
    companyName: string;
    description?: string;
    logoUrl?: string;
    industry?: string;
    website?: string;
  };
  userId: string;
}

async function saveCompanyProfile(userId: string, data: UpdateCompanyProfileInput & { logoUrl?: string }) {
  const res = await fetch("/api/company/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, userId }),
  });
  return res.json();
}

export function CompanyProfileForm({ profile, userId }: CompanyProfileFormProps) {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl ?? "");
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCompanyProfileInput>({
    resolver: zodResolver(updateCompanyProfileSchema),
    defaultValues: {
      companyName: profile.companyName,
      description: profile.description ?? "",
      industry: profile.industry ?? "",
      website: profile.website ?? "",
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", "logo");
    fd.append("entityId", userId);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setLogoUrl(data.url);
      else setServerError(data.error ?? "Upload failed");
    } catch {
      setServerError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: UpdateCompanyProfileInput) => {
    setSuccess(false);
    setServerError("");
    const result = await saveCompanyProfile(userId, { ...data, logoUrl });
    if (result?.error) setServerError(result.error);
    else setSuccess(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Profile updated successfully!
        </div>
      )}
      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {serverError}
        </div>
      )}

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
        {logoUrl && (
          <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-lg object-cover mb-2 border border-gray-200" />
        )}
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleLogoUpload}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {uploading && <p className="text-xs text-gray-500 mt-1">Uploading…</p>}
      </div>

      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
          Company name <span className="text-red-500">*</span>
        </label>
        <input
          id="companyName"
          {...register("companyName")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.companyName && <p className="mt-1 text-xs text-red-600">{errors.companyName.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          id="description"
          {...register("description")}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Tell job seekers about your company…"
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
          <input
            id="industry"
            {...register("industry")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Technology"
          />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            id="website"
            type="url"
            {...register("website")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://company.com"
          />
          {errors.website && <p className="mt-1 text-xs text-red-600">{errors.website.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-2.5 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800 disabled:opacity-60 transition"
      >
        {isSubmitting ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

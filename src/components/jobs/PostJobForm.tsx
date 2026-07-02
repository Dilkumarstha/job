"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { createJobSchema, type CreateJobInput } from "@/lib/validations/job";
import { JOB_CATEGORIES, EXPERIENCE_LEVELS, JOB_TYPES } from "@/lib/constants";
import TagInput from "@/components/ui/TagInput";

interface PostJobFormProps {
  defaultValues?: Partial<CreateJobInput>;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  submitLabel?: string;
}

export default function PostJobForm({
  defaultValues,
  action,
  submitLabel = "Post Job",
}: PostJobFormProps) {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateJobInput, unknown, CreateJobInput>({
    resolver: zodResolver(createJobSchema) as Resolver<CreateJobInput>,
    defaultValues: {
      skillsRequired: [],
      ...defaultValues,
    },
  });

  const onSubmit = async (data: CreateJobInput) => {
    setServerError("");
    const fd = new FormData();
    fd.append("title", data.title);
    fd.append("description", data.description);
    fd.append("category", data.category);
    data.skillsRequired.forEach((s) => fd.append("skillsRequired", s));
    fd.append("experienceLevel", data.experienceLevel);
    if (data.salaryMin) fd.append("salaryMin", String(data.salaryMin));
    if (data.salaryMax) fd.append("salaryMax", String(data.salaryMax));
    fd.append("location", data.location);
    fd.append("jobType", data.jobType);
    fd.append("deadline", data.deadline.toISOString());
    const result = await action(fd);
    if (result?.error) setServerError(result.error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Job title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          {...register("title")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. Senior Frontend Developer"
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Describe the role, responsibilities, and requirements…"
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            {...register("category")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select category…</option>
            {JOB_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>}
        </div>

        <div>
          <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
            Experience level <span className="text-red-500">*</span>
          </label>
          <select
            id="experienceLevel"
            {...register("experienceLevel")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select level…</option>
            {EXPERIENCE_LEVELS.map((l) => (
              <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>
            ))}
          </select>
          {errors.experienceLevel && <p className="mt-1 text-xs text-red-600">{errors.experienceLevel.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Required skills <span className="text-red-500">*</span>
        </label>
        <Controller
          name="skillsRequired"
          control={control}
          render={({ field }) => (
            <TagInput value={field.value} onChange={field.onChange} placeholder="Add required skills" />
          )}
        />
        {errors.skillsRequired && <p className="mt-1 text-xs text-red-600">{errors.skillsRequired.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            id="location"
            {...register("location")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. San Francisco, CA"
          />
          {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>}
        </div>

        <div>
          <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
            Job type <span className="text-red-500">*</span>
          </label>
          <select
            id="jobType"
            {...register("jobType")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select type…</option>
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
            ))}
          </select>
          {errors.jobType && <p className="mt-1 text-xs text-red-600">{errors.jobType.message}</p>}
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
            Deadline <span className="text-red-500">*</span>
          </label>
          <input
            id="deadline"
            type="date"
            {...register("deadline", { valueAsDate: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.deadline && <p className="mt-1 text-xs text-red-600">{errors.deadline.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 mb-1">
            Min salary (optional)
          </label>
          <input
            id="salaryMin"
            type="number"
            {...register("salaryMin")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. 60000"
          />
        </div>
        <div>
          <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 mb-1">
            Max salary (optional)
          </label>
          <input
            id="salaryMax"
            type="number"
            {...register("salaryMax")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. 100000"
          />
          {errors.salaryMax && <p className="mt-1 text-xs text-red-600">{errors.salaryMax.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-2.5 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800 disabled:opacity-60 transition"
      >
        {isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

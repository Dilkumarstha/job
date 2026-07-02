"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/profile";
import { completeOnboarding } from "@/actions/seeker";
import { JOB_CATEGORIES, EXPERIENCE_LEVELS } from "@/lib/constants";
import TagInput from "@/components/ui/TagInput";
import { motion, AnimatePresence, StaggerList, StaggerItem } from "@/components/ui/Motion";

export default function OnboardingPage() {
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { interests: [], skills: [] },
  });

  const onSubmit = async (data: OnboardingInput) => {
    setIsLoading(true);
    setServerError("");
    const fd = new FormData();
    data.interests.forEach((i) => fd.append("interests", i));
    data.skills.forEach((s) => fd.append("skills", s));
    fd.append("experienceLevel", data.experienceLevel);
    fd.append("location", data.location);
    const result = await completeOnboarding(fd);
    if (result?.error) {
      setServerError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        className="bg-white rounded-2xl border border-gray-100 p-8"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome to HireHub! 👋
        </h1>
        <p className="text-gray-500 mb-8">
          Tell us about yourself so we can personalise your job feed.
        </p>

        <AnimatePresence>
          {serverError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {serverError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job categories you&apos;re interested in
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <StaggerList className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Controller
                name="interests"
                control={control}
                render={({ field }) =>
                  JOB_CATEGORIES.map((cat) => (
                    <StaggerItem key={cat}>
                      <label
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm transition w-full ${
                          field.value.includes(cat)
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={field.value.includes(cat)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, cat]);
                            } else {
                              field.onChange(field.value.filter((v) => v !== cat));
                            }
                          }}
                        />
                        {cat}
                      </label>
                    </StaggerItem>
                  )) as unknown as React.ReactElement
                }
              />
            </StaggerList>
            {errors.interests && (
              <p className="mt-1 text-xs text-red-600">{errors.interests.message}</p>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your skills <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">Type a skill and press Enter</p>
            <Controller
              name="skills"
              control={control}
              render={({ field }) => (
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="e.g. React, TypeScript, Node.js"
                />
              )}
            />
            {errors.skills && (
              <p className="mt-1 text-xs text-red-600">{errors.skills.message}</p>
            )}
          </div>

          {/* Experience Level */}
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
                <option key={l} value={l}>
                  {l.charAt(0) + l.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {errors.experienceLevel && (
              <p className="mt-1 text-xs text-red-600">{errors.experienceLevel.message}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Your location <span className="text-red-500">*</span>
            </label>
            <input
              id="location"
              {...register("location")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. San Francisco, CA"
            />
            {errors.location && (
              <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.97 }}
            className="w-full py-2.5 bg-indigo-700 text-white font-semibold rounded-lg hover:bg-indigo-800 disabled:opacity-60 transition"
          >
            {isLoading ? "Saving…" : "Get started →"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

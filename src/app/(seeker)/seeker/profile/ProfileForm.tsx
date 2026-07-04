"use client";

import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { updateSeekerProfileSchema, type UpdateSeekerProfileInput } from "@/lib/validations/profile";
import { updateSeekerProfile } from "@/actions/seeker";
import { EXPERIENCE_LEVELS, JOB_CATEGORIES } from "@/lib/constants";
import TagInput from "@/components/ui/TagInput";

interface SeekerProfileFormProps {
  profile: {
    fullName: string;
    bio?: string;
    experienceLevel?: string;
    location?: string;
    skills?: string[];
    interests?: string[];
    resumeUrl?: string;
  };
  userId: string;
}

// Section wrapper with stagger animation
function Section({
  title,
  icon,
  children,
  delay = 0,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-50">
        {icon && <span className="text-lg">{icon}</span>}
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

// Animated form field
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            key="err"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 text-xs text-red-600 overflow-hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50/50 transition placeholder:text-gray-400";

export default function SeekerProfileForm({ profile, userId }: SeekerProfileFormProps) {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(profile.resumeUrl ?? "");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UpdateSeekerProfileInput>({
    resolver: zodResolver(updateSeekerProfileSchema),
    defaultValues: {
      fullName: profile.fullName,
      bio: profile.bio ?? "",
      experienceLevel: (profile.experienceLevel as UpdateSeekerProfileInput["experienceLevel"]) ?? undefined,
      location: profile.location ?? "",
      skills: profile.skills ?? [],
      interests: profile.interests ?? [],
    },
  });

  const uploadFile = async (file: File) => {
    setUploading(true);
    setServerError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", "resume");
    fd.append("entityId", userId);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setResumeUrl(data.url);
      else setServerError(data.error ?? "Upload failed");
    } catch {
      setServerError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") uploadFile(file);
  };

  const onSubmit = async (data: UpdateSeekerProfileInput) => {
    setSuccess(false);
    setServerError("");
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((item) => fd.append(k, item));
      else if (v !== undefined) fd.append(k, String(v));
    });
    if (resumeUrl) fd.append("resumeUrl", resumeUrl);
    const result = await updateSeekerProfile(fd);
    if (result?.error) setServerError(result.error);
    else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Toast banners */}
      <AnimatePresence>
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm shadow-sm"
          >
            {/* <span className="text-xl">✅</span> */}
            <span className="font-medium">Profile updated successfully!</span>
          </motion.div>
        )}
        {serverError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm shadow-sm"
          >
            {/* <span className="text-xl">⚠️</span> */}
            <span className="font-medium">{serverError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* — Section 1: Basic Info — */}
      <Section title="Basic Information" 
      // icon="👤"
       delay={0.05}>
        <div className="space-y-4">
          <Field label="Full name" required error={errors.fullName?.message}>
            <input
              id="fullName"
              {...register("fullName")}
              className={inputCls}
              placeholder="Jane Doe"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Experience level" error={errors.experienceLevel?.message}>
              <select id="experienceLevel" {...register("experienceLevel")} className={inputCls}>
                <option value="">Select level…</option>
                {EXPERIENCE_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l.charAt(0) + l.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Location" error={errors.location?.message}>
              <input
                id="location"
                {...register("location")}
                className={inputCls}
                placeholder="City, Country"
              />
            </Field>
          </div>

          <Field label="Bio" error={errors.bio?.message}>
            <textarea
              id="bio"
              {...register("bio")}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="Tell employers about yourself — your background, what you're looking for, and what makes you stand out…"
            />
          </Field>
        </div>
      </Section>

      {/* — Section 2: Skills — */}
      <Section 
      title="Skills" 
      // icon="⚡" 
      delay={0.1}>
        <p className="text-xs text-gray-400 mb-3">Type a skill and press Enter or comma to add it.</p>
        <Controller
          name="skills"
          control={control}
          render={({ field }) => (
            <TagInput value={field.value ?? []} onChange={field.onChange} placeholder="e.g. React, TypeScript, Node.js" />
          )}
        />
      </Section>

      {/* — Section 3: Interests — */}
      <Section title="Job Category Interests" 
      // icon="🎯"
       delay={0.15}>
        <p className="text-xs text-gray-400 mb-3">Select the categories you want to see in your feed.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Controller
            name="interests"
            control={control}
            render={({ field }) =>
              JOB_CATEGORIES.map((cat) => {
                const checked = field.value?.includes(cat) ?? false;
                return (
                  <motion.label
                    key={cat}
                    whileTap={{ scale: 0.96 }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-medium transition select-none ${
                      checked
                        ? "border-teal-500 bg-teal-50 text-teal-700 shadow-sm"
                        : "border-gray-200 text-gray-600 hover:border-teal-300 hover:bg-teal-50/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={(e) => {
                        const val = field.value ?? [];
                        if (e.target.checked) field.onChange([...val, cat]);
                        else field.onChange(val.filter((v) => v !== cat));
                      }}
                    />
                    <motion.span
                      animate={{ scale: checked ? 1 : 0.85, opacity: checked ? 1 : 0 }}
                      className="w-3.5 h-3.5 rounded-full bg-teal-600 flex items-center justify-center shrink-0"
                    >
                      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.span>
                    {!checked && <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />}
                    {cat}
                  </motion.label>
                );
              }) as unknown as React.ReactElement
            }
          />
        </div>
      </Section>

      {/* — Section 4: Resume — */}
      <Section title="Resume" 
      // icon="📄" 
      delay={0.2}>
        {resumeUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl mb-4"
          >
            <span className="text-xl">📎</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-green-700">Resume uploaded</p>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-green-600 hover:underline truncate block"
              >
                View current resume ↗
              </a>
            </div>
            <button
              type="button"
              onClick={() => setResumeUrl("")}
              className="text-green-400 hover:text-red-500 transition text-lg leading-none"
              title="Remove resume"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Drag & drop zone */}
        <motion.div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          animate={{
            borderColor: dragOver ? "#6366f1" : "#e5e7eb",
            backgroundColor: dragOver ? "#eef2ff" : "#fafafa",
          }}
          transition={{ duration: 0.15 }}
          className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors"
        >
          <AnimatePresence mode="wait">
            {uploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full"
                />
                <p className="text-sm text-teal-600 font-medium">Uploading resume…</p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2 text-center"
              >
                <span className="text-4xl">📂</span>
                <p className="text-sm font-medium text-gray-700">
                  {dragOver ? "Drop it here!" : "Drag & drop your PDF here"}
                </p>
                <p className="text-xs text-gray-400">or <span className="text-teal-600 font-medium">click to browse</span> — PDF only, max 5 MB</p>
              </motion.div>
            )}
          </AnimatePresence>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </motion.div>
      </Section>

      {/* Save button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="flex justify-end"
      >
        <motion.button
          type="submit"
          disabled={isSubmitting || uploading}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          className="px-8 py-3 bg-teal-700 text-white text-sm font-semibold rounded-xl hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Saving…
            </span>
          ) : (
            "Save Profile"
          )}
        </motion.button>
      </motion.div>
    </form>
  );
}

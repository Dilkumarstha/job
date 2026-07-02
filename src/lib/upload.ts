import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export interface UploadResult {
  url: string;
}

const RESUME_MAX = parseInt(process.env.UPLOAD_RESUME_MAX_BYTES ?? "5242880");
const LOGO_MAX = parseInt(process.env.UPLOAD_LOGO_MAX_BYTES ?? "2097152");

const ALLOWED_RESUME = ["application/pdf"];
const ALLOWED_LOGO = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

/**
 * Saves an uploaded file to /public/uploads/<type>/.
 * To swap to S3/Cloudinary, replace only this function body.
 */
export async function saveFile(
  file: File,
  type: "resume" | "logo",
  entityId: string
): Promise<UploadResult> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Validate size
  const maxSize = type === "resume" ? RESUME_MAX : LOGO_MAX;
  if (buffer.byteLength > maxSize) {
    throw new Error(
      `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)} MB.`
    );
  }

  // Validate MIME type
  const allowed = type === "resume" ? ALLOWED_RESUME : ALLOWED_LOGO;
  if (!allowed.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed: ${allowed.join(", ")}`
    );
  }

  // Determine extension
  const ext = file.name.split(".").pop()?.toLowerCase() ?? (type === "resume" ? "pdf" : "jpg");
  const filename = `${entityId}-${Date.now()}.${ext}`;
  const subdir = type === "resume" ? "resumes" : "logos";
  const uploadDir = join(process.cwd(), "public", "uploads", subdir);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), buffer);

  return { url: `/uploads/${subdir}/${filename}` };
}

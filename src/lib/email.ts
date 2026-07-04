import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
) {
  console.log(`\n📧 Password reset link for ${email}: ${resetLink}\n`);

  const verifiedEmail = process.env.RESEND_VERIFIED_EMAIL;
  if (!verifiedEmail || email.toLowerCase() !== verifiedEmail.toLowerCase()) {
    console.log("⚠️  DEMO MODE: Use the console link above to reset.");
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
      to: email,
      subject: "Reset your HireHub password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #0f766e;">HireHub</h2>
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <a href="${resetLink}"
             style="display: inline-block; padding: 12px 24px; background: #0f766e; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #6b7280; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
          <p style="color: #6b7280; font-size: 14px;">Or copy this URL: <br/>${resetLink}</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend error:", error);
    }
  } catch (err) {
    console.error("❌ Failed to send email:", err);
  }
}

import { Resend } from "resend";
import OTP from "../models/otpSchema.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpService(email) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Upsert OTP (replace if it already exists)
  await OTP.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true }
  );

  const html = `
    <div style="font-family:sans-serif;">
      <h2>Your OTP is: ${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    </div>
  `;

  await resend.emails.send({
    from: "SyncDrive <onboarding@resend.dev>",
    to: email,
    subject: "SyncDrive OTP",
    html,
  });

  return { 
    success: true, 
    message: `OTP sent successfully on ${email}` };
}

import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  if (!env.smtpUser || !env.smtpPass) {
    console.log(`[email] skipped (SMTP not configured): ${subject} → ${to}`);
    return;
  }
  await transporter.sendMail({ from: env.smtpFrom, to, subject, html });
}

export { sendMail };

/** Notify student when their application status changes */
export async function sendApplicationStatusEmail(opts: {
  studentEmail: string;
  studentName: string;
  companyName: string;
  driveTitle: string;
  status: string;
}): Promise<void> {
  const { studentEmail, studentName, companyName, driveTitle, status } = opts;

  const statusMessages: Record<string, { subject: string; heading: string; color: string; body: string }> = {
    shortlisted: {
      subject: `You've been shortlisted — ${companyName}`,
      heading: "Congratulations! You've been shortlisted 🎉",
      color: "#f59e0b",
      body: `Great news! You have been shortlisted for the <strong>${driveTitle}</strong> drive at <strong>${companyName}</strong>. Stay tuned for further updates.`,
    },
    offered: {
      subject: `Offer received — ${companyName}`,
      heading: "You received an offer! 🏆",
      color: "#10b981",
      body: `Congratulations! You have received a placement offer for <strong>${driveTitle}</strong> at <strong>${companyName}</strong>. Please contact your TPO for next steps.`,
    },
    rejected: {
      subject: `Application update — ${companyName}`,
      heading: "Application Status Update",
      color: "#ef4444",
      body: `We regret to inform you that your application for <strong>${driveTitle}</strong> at <strong>${companyName}</strong> was not selected this time. Keep applying — more drives are coming!`,
    },
  };

  const cfg = statusMessages[status];
  if (!cfg) return; // don't email for applied/withdrawn

  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
      <div style="background: #003466; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 18px;">ScholarFlow</h2>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 28px 24px; border-radius: 0 0 12px 12px;">
        <div style="display: inline-block; background: ${cfg.color}20; color: ${cfg.color}; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 16px;">
          ${status.toUpperCase()}
        </div>
        <h3 style="margin: 0 0 12px; color: #111827; font-size: 20px;">${cfg.heading}</h3>
        <p style="color: #374151; line-height: 1.6; margin: 0 0 16px;">Hi <strong>${studentName}</strong>,</p>
        <p style="color: #374151; line-height: 1.6; margin: 0 0 24px;">${cfg.body}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 16px;" />
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">This is an automated message from ScholarFlow Placement Management System.</p>
      </div>
    </div>
  `;

  await sendMail(studentEmail, cfg.subject, html);
}

/** Notify TPO when a student submits a profile edit request */
export async function sendProfileEditRequestEmail(opts: {
  tpoEmail: string;
  studentName: string;
  studentEmail: string;
}): Promise<void> {
  const { tpoEmail, studentName, studentEmail } = opts;

  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
      <div style="background: #003466; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 18px;">ScholarFlow</h2>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 28px 24px; border-radius: 0 0 12px 12px;">
        <h3 style="margin: 0 0 12px; color: #111827; font-size: 20px;">Profile Edit Request</h3>
        <p style="color: #374151; line-height: 1.6; margin: 0 0 16px;">
          <strong>${studentName}</strong> (${studentEmail}) has submitted a profile edit request that requires your review.
        </p>
        <p style="color: #374151; line-height: 1.6; margin: 0 0 24px;">
          Please log in to ScholarFlow and visit <strong>Profile Requests</strong> to approve or reject the changes.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 16px;" />
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">This is an automated message from ScholarFlow Placement Management System.</p>
      </div>
    </div>
  `;

  await sendMail(tpoEmail, `Profile edit request from ${studentName}`, html);
}

/** Notify student when their profile edit request is reviewed */
export async function sendProfileReviewEmail(opts: {
  studentEmail: string;
  studentName: string;
  action: "approved" | "rejected";
  reviewNote?: string;
}): Promise<void> {
  const { studentEmail, studentName, action, reviewNote } = opts;

  const approved = action === "approved";
  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
      <div style="background: #003466; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 18px;">ScholarFlow</h2>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 28px 24px; border-radius: 0 0 12px 12px;">
        <h3 style="margin: 0 0 12px; color: #111827; font-size: 20px;">
          Profile Edit Request ${approved ? "Approved ✅" : "Rejected ❌"}
        </h3>
        <p style="color: #374151; line-height: 1.6; margin: 0 0 16px;">Hi <strong>${studentName}</strong>,</p>
        <p style="color: #374151; line-height: 1.6; margin: 0 0 16px;">
          Your profile edit request has been <strong>${action}</strong> by your TPO.
          ${approved ? "Your profile has been updated accordingly." : "Your profile remains unchanged."}
        </p>
        ${reviewNote ? `<p style="color: #374151; background: #f9fafb; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #003466; margin: 0 0 16px;"><strong>TPO Note:</strong> ${reviewNote}</p>` : ""}
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 16px;" />
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">This is an automated message from ScholarFlow Placement Management System.</p>
      </div>
    </div>
  `;

  await sendMail(studentEmail, `Profile edit request ${action}`, html);
}

import nodemailer from 'nodemailer';
import { env }     from '../config/env.js';

function createTransport() {
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
  });
}

export async function sendMail({ to, subject, html, replyTo }) {
  const transport = createTransport();
  if (!transport) {
    console.warn('[email] GMAIL_USER or GMAIL_APP_PASSWORD not set — email not sent:', subject);
    return { skipped: true };
  }
  return transport.sendMail({
    from: `"Spandana Care Aid" <${env.GMAIL_USER}>`,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });
}

export async function sendContactConfirmation({ name, email, message }) {
  return sendMail({
    to: email,
    subject: 'Thank you for contacting Spandana Care Aid Foundation',
    html: `<p>Dear ${name},</p><p>Thank you for reaching out. We have received your message and will respond within 2 business days.</p><p>Your message: <em>${message}</em></p><p>Warm regards,<br>Spandana Care Aid Foundation</p>`,
  });
}

export async function sendContactAlert({ name, email, phone, message }) {
  if (!env.CONTACT_EMAIL) return;
  return sendMail({
    to: env.CONTACT_EMAIL,
    replyTo: email,
    subject: `New contact form submission from ${name}`,
    html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone || 'N/A'}</p><p><strong>Message:</strong></p><p>${message}</p>`,
  });
}

export async function sendVolunteerAlert({ fullName, email }) {
  if (!env.CONTACT_EMAIL) return;
  return sendMail({
    to: env.CONTACT_EMAIL,
    subject: `New volunteer application from ${fullName}`,
    html: `<p>A new volunteer application was submitted.</p><p><strong>Name:</strong> ${fullName}</p><p><strong>Email:</strong> ${email}</p>`,
  });
}

export async function sendNewsletterAlert(email, totalCount) {
  if (!env.CONTACT_EMAIL) return;
  return sendMail({
    to: env.CONTACT_EMAIL,
    subject: `New newsletter subscriber: ${email}`,
    html: `<p><strong>${email}</strong> subscribed to the newsletter.</p><p>Total subscribers: <strong>${totalCount}</strong></p>`,
  });
}

import { sendContactConfirmation, sendContactAlert } from '../services/emailService.js';

export async function submit(req, res) {
  const { fullName, email, phone, message } = req.body;
  // Fire both emails concurrently — don't block the response
  await Promise.allSettled([
    sendContactConfirmation({ name: fullName, email, message }),
    sendContactAlert({ name: fullName, email, phone, message }),
  ]);
  res.json({ success: true });
}

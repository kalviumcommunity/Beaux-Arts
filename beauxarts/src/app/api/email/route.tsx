import { sendSuccess,sendError } from "@/lib/responseHandler";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  try {
    const { to, subject, message } = await req.json();

    const emailData = {
      to,
      from: process.env.SENDGRID_SENDER!,
      subject,
      html: message,
    };

    const response = await sendgrid.send(emailData);
    console.log("Email sent:", response[0].headers);
    return sendSuccess({ data: null, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email send failed:", error);
    return sendError({ message: "Failed to send email", details: error });
  }
}
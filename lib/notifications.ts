import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: ReturnType<typeof twilio> | null = null;

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
}

export interface SMSNotification {
  to: string;
  message: string;
}

export const sendSMS = async (to: string, message: string): Promise<boolean> => {
  if (!twilioClient || !twilioPhone) {
    console.warn('Twilio not configured. SMS notification skipped.');
    return false;
  }

  try {
    // Format South African phone number
    const formattedPhone = to.startsWith('+27') ? to : to.startsWith('0') ? `+27${to.slice(1)}` : `+27${to}`;

    await twilioClient.messages.create({
      body: message,
      from: twilioPhone,
      to: formattedPhone,
    });

    console.log(`SMS sent to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

// Pre-defined notification templates
export const NotificationTemplates = {
  bookingConfirmation: (clientName: string, date: string, time: string) => `
Hi ${clientName}! Your Bespoke Preservation booking is confirmed for ${date} at ${time}. We'll send parking instructions 24h before. Reply HELP for questions.
  `.trim(),

  preArrivalReminder: (clientName: string, time: string, address: string) => `
Hi ${clientName}! Reminder: Your service is tomorrow at ${time}. Please park in a shaded area if possible and ensure we have access to ${address}. See you soon!
  `.trim(),

  technicianEnRoute: (clientName: string, eta: string) => `
Hi ${clientName}! Your technician is on the way. ETA: ${eta}. Your vehicle will be transformed shortly. Thank you for choosing Bespoke Preservation.
  `.trim(),

  serviceComplete: (clientName: string, portalLink: string) => `
Hi ${clientName}! Your vehicle preservation is complete! View before/after photos & your digital report here: ${portalLink}. Thank you for trusting us!
  `.trim(),

  healthReminder: (clientName: string, vehicleName: string, daysLeft: number) => `
Hi ${clientName}! Your ${vehicleName}'s protection is at ${Math.round((daysLeft / 21) * 100)}%. Book your next service to maintain optimal protection: ${process.env.NEXT_PUBLIC_SITE_URL}/book
  `.trim(),

  weatherAlert: (clientName: string, date: string) => `
Hi ${clientName}! Rain forecasted for ${date}. We recommend our Rain Repel ceramic upgrade (R120) for enhanced protection. Reply YES to add it to your service.
  `.trim(),
};

// Email notification placeholder (for Resend integration)
export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}

export const sendEmail = async (notification: EmailNotification): Promise<boolean> => {
  // TODO: Implement Resend email sending
  console.log('Email notification:', notification.subject, 'to', notification.to);

  // Placeholder for Resend integration
  try {
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: process.env.RESEND_FROM_EMAIL || 'noreply@bespokepreservation.co.za',
    //   to: notification.to,
    //   subject: notification.subject,
    //   html: notification.html,
    //   attachments: notification.attachments,
    // });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const EmailTemplates = {
  bookingConfirmation: (clientName: string, bookingDetails: any) => ({
    subject: 'Booking Confirmed - Bespoke Car Preservation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #07070A; color: #E6E8EE; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #40E0FF; margin: 0;">BESPOKE PRESERVATION</h1>
          <p style="color: #E6E8EE; opacity: 0.7;">Your booking is confirmed</p>
        </div>

        <div style="background: #2B2F36; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #40E0FF; margin-top: 0;">Hi ${clientName},</h2>
          <p>Your vehicle preservation service is confirmed!</p>

          <div style="margin: 20px 0; padding: 15px; background: #07070A; border-left: 3px solid #40E0FF;">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${bookingDetails.date}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${bookingDetails.time}</p>
            <p style="margin: 5px 0;"><strong>Vehicle:</strong> ${bookingDetails.vehicle}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${bookingDetails.address}</p>
          </div>

          <p><strong>What happens next?</strong></p>
          <ul style="line-height: 1.8;">
            <li>24h before: Pre-arrival SMS with parking instructions</li>
            <li>Service day: Our technician arrives on time</li>
            <li>After service: Digital report & photos in your portal</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal" style="display: inline-block; padding: 12px 30px; background: #40E0FF; color: #07070A; text-decoration: none; border-radius: 6px; font-weight: bold;">View in Portal</a>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #2B2F36; font-size: 12px; opacity: 0.6;">
          <p>Bespoke Car Preservation | www.bespokepreservation.co.za</p>
        </div>
      </div>
    `,
  }),

  serviceComplete: (clientName: string, portalLink: string, pdfAttachment?: Buffer) => ({
    subject: 'Service Complete - Your Digital Report is Ready',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #07070A; color: #E6E8EE; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #40E0FF; margin: 0;">SERVICE COMPLETE</h1>
          <p style="color: #E6E8EE; opacity: 0.7;">Your vehicle is protected</p>
        </div>

        <div style="background: #2B2F36; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #40E0FF; margin-top: 0;">Hi ${clientName},</h2>
          <p>Your vehicle preservation service is complete! Your car now has advanced polymer protection that will maintain a showroom finish for weeks.</p>

          <div style="margin: 20px 0; padding: 15px; background: #07070A; border: 2px solid #40E0FF; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 18px;"><strong>✨ View Your Before/After Photos</strong></p>
            <a href="${portalLink}" style="display: inline-block; margin-top: 15px; padding: 12px 30px; background: #40E0FF; color: #07070A; text-decoration: none; border-radius: 6px; font-weight: bold;">Open Digital Report</a>
          </div>

          <p><strong>Your protection includes:</strong></p>
          <ul style="line-height: 1.8;">
            <li>Si02 polymer sealant for 21-day protection</li>
            <li>Hydrophobic coating for water repellency</li>
            <li>UV protection to prevent paint fade</li>
            <li>Digital service history for resale value</li>
          </ul>

          <p style="margin-top: 20px; padding: 15px; background: rgba(64, 224, 255, 0.1); border-left: 3px solid #40E0FF;">
            <strong>💡 Pro Tip:</strong> Book your next service in 3 weeks to maintain optimal protection and maximize your vehicle's resale value.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #2B2F36; font-size: 12px; opacity: 0.6;">
          <p>Bespoke Car Preservation | www.bespokepreservation.co.za</p>
        </div>
      </div>
    `,
    attachments: pdfAttachment
      ? [
          {
            filename: 'Service-Report.pdf',
            content: pdfAttachment,
          },
        ]
      : undefined,
  }),
};

import nodemailer from 'nodemailer';
import pluralize from 'pluralize';

import envConfig from '@config/env';
import logger from '@utils/logger';
import stringify from '@utils/misc/stringify';

// Types
import Mail from 'nodemailer/lib/mailer';

type SendTableBookingEmailInput = {
  date: string;
  playersPlayingCount: number;
};

const sendTableBookingEmail = ({ date, playersPlayingCount }: SendTableBookingEmailInput): Promise<void> => {
  const subject = `${envConfig.emailFromName} will be ${playersPlayingCount} this week (${date})`;

  const text = `Hallöchen ${envConfig.emailToName},

  we will be ${playersPlayingCount} ${pluralize('person', playersPlayingCount)} this week.
  
  
  Cheers
  
  ${envConfig.botName}`;

  return new Promise((resolve, reject) => {
    const smtpConfig = {
      auth: {
        user: envConfig.emailAuthUser,
        pass: envConfig.emailAuthPassword,
      },
      host: envConfig.emailAuthHost,
      port: envConfig.emailAuthPort,
      secure: false,
      ignoreTLS: true,
    };

    const mailConfig: Mail.Options = {
      cc: envConfig.emailCc,
      from: `${envConfig.emailFromName} <${envConfig.emailFrom}>`,
      replyTo: envConfig.emailReplyTo,
      subject,
      text,
      to: envConfig.emailTo,
    };

    const transporter = nodemailer.createTransport(smtpConfig);

    transporter.sendMail(mailConfig, err => {
      if (err) {
        logger.error('Error sending booking email.', stringify(err, null, 2));

        return reject(err);
      }

      logger.info('Booking email sent.', {
        label: 'src/utils/email/sendTableBookingEmail.ts',
      });

      return resolve();
    });
  });
};

export default sendTableBookingEmail;

import nodemailer from 'nodemailer';

import envConfig from '../../config/env';
import logger from '../logger';
import stringify from '../misc/stringify';

// Types
import Mail from 'nodemailer/lib/mailer';

const EMAIL_TEXT = `Hallöchen ${envConfig.emailToName},

we sadly have to cancel for this week.


Cheers

${envConfig.botName}`;

const EMAIL_SUBJECT = `${envConfig.emailFromName} will have to cancel this week`;

const sendTableBookingCancelEmail = (date: string): Promise<void> => {
  const subject = `${EMAIL_SUBJECT} (${date})`;

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
      text: EMAIL_TEXT,
      to: envConfig.emailTo,
    };

    const transporter = nodemailer.createTransport(smtpConfig);

    transporter.sendMail(mailConfig, err => {
      if (err) {
        logger.error('Error sending cancelation email.', stringify(err, null, 2));

        return reject(err);
      }

      logger.info('Cancelation email sent.', {
        label: 'src/utils/email/sendTableBookingCancelEmail.ts',
      });

      return resolve();
    });
  });
};

export default sendTableBookingCancelEmail;

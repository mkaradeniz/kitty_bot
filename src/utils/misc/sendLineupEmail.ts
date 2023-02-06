import nodemailer from 'nodemailer';
import pluralize from 'pluralize';

import envConfig from '../../config/env';

const buildEmailText = (playerCount: number) => `Hallöchen ${envConfig.emailToName},

we will be ${playerCount} ${pluralize('person', playerCount)} this week.


Cheers

KittyBot`;

const buildEmailSubject = (playerCount: number) => `${envConfig.emailFromName} will be ${playerCount} this week`;

const sendLineupEmail = (playerCount: number): Promise<void> => {
  const subject = buildEmailSubject(playerCount);
  const text = buildEmailText(playerCount);

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

    const mailConfig = {
      cc: envConfig.emailCc,
      from: `${envConfig.emailFromName} <${envConfig.emailFrom}>`,
      subject,
      text,
      to: envConfig.emailTo,
    };

    const transporter = nodemailer.createTransport(smtpConfig);

    transporter.sendMail(mailConfig, err => {
      if (err) {
        console.error('Error while sending mail.', err);

        return reject(err);
      }

      // eslint-disable-next-line no-console
      console.info('Email sent');

      return resolve();
    });
  });
};

export default sendLineupEmail;

import nodemailer from 'nodemailer';
import pluralize from 'pluralize';

import envConfig from '../../config/env';

const buildEmailText = (playerCount: number) => `Hallöchen Scott,

we will be ${playerCount} ${pluralize('person', playerCount)} this week.


Cheers

KittyBot`;

const buildEmailSubject = (playerCount: number) => `Kitty's Table will be ${playerCount} this week`;

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
      from: envConfig.emailFrom,
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

      console.info('Email sent');

      return resolve();
    });
  });
};

export default sendLineupEmail;

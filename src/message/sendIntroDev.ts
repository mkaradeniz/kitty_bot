import createSendMessageWithoutContext from '@utils/message/createSendMessageWithoutContext';
import envConfig from '@config/env';
import isNotNullOrUndefined from '@utils/misc/isNotNullOrUndefined';
import logger from '@utils/logger';
import { BUTTONS_DEV } from '@config/constants';

// Types
import { Telegraf } from 'telegraf';

const createSendIntroDev = (bot: Telegraf<any>) => async () => {
  if (!envConfig.isDev) {
    return;
  }

  // ! This only works if we have the `pubquizChatId` defined in the ENVs.
  if (!isNotNullOrUndefined(envConfig.pubquizChatId)) {
    return;
  }

  try {
    const sendMessageWithoutContext = createSendMessageWithoutContext(bot);

    await sendMessageWithoutContext(`${envConfig.botName} is online! 🤖`, { ...BUTTONS_DEV });
  } catch (err) {
    logger.error(err);
  }
};

export default createSendIntroDev;

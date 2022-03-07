import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';

// Types
import { Context } from 'telegraf';
import { KittyBotState } from './stateMiddleware';
import { Message, Update, User } from 'telegraf/typings/core/types/typegram';

export interface KittyBotContext extends Context {
  myContext: {
    addPlayer: (chatId: number, user: User) => void;
    addPlayersExternal: (chatId: number, invitedBy: User, numberOfInvitees: number) => void;
    chatId: number;
    getLineup: (chatId: number) => string;
    getPlayerCount: (chatId: number) => number;
    getQuizDate: (chatId: number) => string;
    isUserPlayingAlready: (chatId: number, userId: number) => boolean;
    message?: Update.New & Update.NonChannel & Message.TextMessage;
    resetState: (chatId: number) => void;
    setIntroSent: (chatId: number) => void;
    setLineupComplete: (chatId: number) => void;
    setReminder1Sent: (chatId: number) => void;
    state: { [chatId: number]: KittyBotState };
    user?: User;
  };
}

const contextMiddleware = async (ctx: KittyBotContext, next: () => Promise<void>) => {
  if (!isNotNullOrUndefined(ctx.myContext)) {
    // TODO: Is this really the way to go?
    // @ts-ignore
    ctx.myContext = {};
  }

  const chatId = ctx?.message?.chat.id ?? undefined;

  if (!isNotNullOrUndefined(chatId)) {
    return;
  }

  const user = ctx?.message?.from ?? undefined;

  ctx.myContext.chatId = chatId;
  ctx.myContext.user = user;

  if (isNotNullOrUndefined(ctx.message)) {
    if ('text' in ctx.message) {
      const message = ctx.message;

      ctx.myContext.message = message;
    }
  }

  return next();
};

export default contextMiddleware;

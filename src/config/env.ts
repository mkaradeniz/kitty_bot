import { describe, Type } from '@mrboolean/envconfig';

export interface EnvConfig {
  adminUserId: number | null;
  botName: string;
  botToken: string;
  databaseUrl: string;
  emailAuthHost: string;
  emailAuthPassword: string;
  emailAuthPort: number;
  emailAuthUser: string;
  emailCc: string;
  emailFrom: string;
  emailFromName: string;
  emailReplyTo?: string;
  emailTo: string;
  emailToName: string;
  isDev: boolean;
  isProduction: boolean;
  maxPlayers: number;
  pubquizChatId: number | null;
}

const envConfig: EnvConfig = describe({
  adminUserId: {
    isRequired: false,
    name: 'ADMIN_USER_ID',
    standard: null,
    type: Type.NUMBER,
  },
  botName: {
    isRequired: true,
    name: 'BOT_NAME',
    type: Type.STRING,
  },
  botToken: {
    isRequired: true,
    name: 'BOT_TOKEN',
    type: Type.STRING,
  },
  databaseUrl: {
    isRequired: true,
    name: 'DATABASE_URL',
    type: Type.STRING,
  },
  emailAuthHost: {
    isRequired: true,
    name: 'EMAIL_AUTH_HOST',
    type: Type.STRING,
  },
  emailAuthPassword: {
    isRequired: true,
    name: 'EMAIL_AUTH_PASSWORD',
    type: Type.STRING,
  },
  emailAuthPort: {
    isRequired: true,
    name: 'EMAIL_AUTH_PORT',
    type: Type.NUMBER,
  },
  emailAuthUser: {
    isRequired: true,
    name: 'EMAIL_AUTH_USER',
    type: Type.STRING,
  },
  emailCc: {
    isRequired: true,
    name: 'EMAIL_CC',
    type: Type.STRING,
  },
  emailFrom: {
    isRequired: true,
    name: 'EMAIL_FROM',
    type: Type.STRING,
  },
  emailFromName: {
    isRequired: true,
    name: 'EMAIL_FROM_NAME',
    type: Type.STRING,
  },
  emailReplyTo: {
    isRequired: false,
    name: 'EMAIL_REPLY_TO',
    type: Type.STRING,
  },
  emailTo: {
    isRequired: true,
    name: 'EMAIL_TO',
    type: Type.STRING,
  },
  emailToName: {
    isRequired: true,
    name: 'EMAIL_TO_NAME',
    type: Type.STRING,
  },
  isDev: {
    isRequired: true,
    name: 'NODE_ENV',
    sanitize: (value: any): boolean => value !== 'production',
  },
  isProduction: {
    isRequired: true,
    name: 'NODE_ENV',
    sanitize: (value: any): boolean => value === 'production',
  },
  maxPlayers: {
    isRequired: false,
    name: 'MAX_PLAYERS',
    standard: 8,
    type: Type.NUMBER,
  },
  pubquizChatId: {
    isRequired: false,
    name: 'PUBQUIZ_CHAT_ID',
    standard: null,
    type: Type.NUMBER,
  },
});

export default envConfig;

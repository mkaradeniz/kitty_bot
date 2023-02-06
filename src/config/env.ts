import { describe, Type } from '@mrboolean/envconfig';

export interface EnvConfig {
  adminUserId: number;
  botToken: string;
  databaseUrl: string;
  emailAuthHost: string;
  emailAuthPassword: string;
  emailAuthPort: number;
  emailAuthUser: string;
  emailCc: string;
  emailFrom: string;
  emailFromName: string;
  emailTo: string;
  emailToName: string;
  isDev: boolean;
  isProduction: boolean;
  maxPlayers: number;
  pubQuizGroupId: number;
}

const envConfig: EnvConfig = describe({
  adminUserId: {
    isRequired: true,
    name: 'ADMIN_USER_ID',
    type: Type.NUMBER,
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
    name: 'NODE_ENV',
    isRequired: true,
    sanitize: (value: any): boolean => value !== 'production',
  },
  isProduction: {
    name: 'NODE_ENV',
    isRequired: true,
    sanitize: (value: any): boolean => value === 'production',
  },
  maxPlayers: {
    isRequired: false,
    name: 'MAX_PLAYERS',
    standard: 8,
    type: Type.NUMBER,
  },
  pubQuizGroupId: {
    isRequired: true,
    name: 'PUB_QUIZ_GROUP_ID',
    type: Type.NUMBER,
  },
});

export default envConfig;

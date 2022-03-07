import { describe, Type } from '@mrboolean/envconfig';

export interface EnvConfig {
  adminUserId: number;
  botToken: string;
  isDev: boolean;
  isProduction: boolean;
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
  pubQuizGroupId: {
    isRequired: true,
    name: 'PUB_QUIZ_GROUP_ID',
    type: Type.NUMBER,
  },
});

export default envConfig;

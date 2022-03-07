import { describe, Type } from '@mrboolean/envconfig';

export interface EnvConfig {
  adminUserId: number;
  botToken: string;
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
});

export default envConfig;

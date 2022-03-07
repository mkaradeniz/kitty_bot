import { describe, Type } from '@mrboolean/envconfig';

export interface EnvConfig {
  botToken: string;
}

const envConfig: EnvConfig = describe({
  botToken: {
    isRequired: true,
    name: 'BOT_TOKEN',
    type: Type.STRING,
  },
});

export default envConfig;

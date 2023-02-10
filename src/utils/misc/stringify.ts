import safeJsonStringify from 'safe-json-stringify';

const stringify = (data: object = {}, replacer?: ((key: any, value: any) => any) | any[] | null, space?: string | number) => {
  return safeJsonStringify(data, replacer, space);
};

export default stringify;

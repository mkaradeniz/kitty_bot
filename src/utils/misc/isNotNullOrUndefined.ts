export const isNotNullOrUndefined = <T>(input: T | null | undefined): input is T => {
  // eslint-disable-next-line no-eq-null
  return input != null && input !== null && input !== undefined;
};

export const getSecurityUri = (metadata, name) => {
  return metadata.rest[0].security.extension[0].extension.find(
    (e) => e.url == name
  ).valueUri;
};

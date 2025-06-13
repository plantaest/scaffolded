export const zoteroTranslationServerUri = (path?: string) => {
  const host =
    process.env.NODE_ENV === 'development'
      ? 'http://0.0.0.0:1969/'
      : 'https://scaffolded.toolforge.org/_zts/';
  return path ? host + path : host;
};

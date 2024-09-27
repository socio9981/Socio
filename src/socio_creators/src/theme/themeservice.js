import { Preferences } from '@capacitor/preferences';

export const setTheme = async (theme) => {
  await Preferences.set({ key: 'color-theme', value: theme });
};

export const getTheme = async () => {
  const { value } = await Preferences.get({ key: 'color-theme' });
  return value;
};

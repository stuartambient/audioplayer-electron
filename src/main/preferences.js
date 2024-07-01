import { promises as fs } from 'fs';
import path from 'path';

const __dirname = path.resolve();
const preferencesPath = path.join(__dirname, 'src', 'main', 'preferences.json');

export const getPreferences = async () => {
  try {
    if (await fs.stat(preferencesPath)) {
      const data = await fs.readFile(preferencesPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading preferences:', err);
  }
  return { hiddenColumns: [] }; // default preferences
};

export const savePreferences = async (preferences) => {
  console.log('preferences: ', preferences);
  try {
    await fs.writeFile(preferencesPath, JSON.stringify(preferences, null, 2));
  } catch (err) {
    console.error('Error writing preferences:', err);
  }
};

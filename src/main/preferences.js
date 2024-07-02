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
  return {}; // default preferences
};

export const savePreferences = async (newPreferences) => {
  try {
    let currentPreferences = {};
    if (await fs.stat(preferencesPath)) {
      const data = await fs.readFile(preferencesPath, 'utf-8');
      currentPreferences = JSON.parse(data);
    }
    const updatedPreferences = { ...currentPreferences, ...newPreferences };
    await fs.writeFile(preferencesPath, JSON.stringify(updatedPreferences, null, 2));
  } catch (err) {
    console.error('Error writing preferences:', err);
  }
};

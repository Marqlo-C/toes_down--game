import fs from 'fs';
import path from 'path';

// Function to get all available pack names
export const getPackNames = (): string[] => {
  const dataDirectory = path.join(process.cwd(), 'src/data');
  const fileNames = fs.readdirSync(dataDirectory);
  const packs = fileNames
    .filter(fileName => fileName.endsWith('.txt'))
    .map(fileName => fileName.replace(/\.txt$/, ''));

  const showsIndex = packs.indexOf('movies and shows');
  const ucDavisIndex = packs.indexOf('uc davis trivia');
  if (showsIndex !== -1 && ucDavisIndex !== -1 && ucDavisIndex !== showsIndex + 1) {
    packs.splice(ucDavisIndex, 1);
    packs.splice(showsIndex + 1, 0, 'uc davis trivia');
  }

  return packs;
};

// Function to get items from a specific pack
export const getPackItems = (packName: string): string[] => {
  const filePath = path.join(process.cwd(), `src/data/${packName}.txt`);
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent.split('\n').filter(item => item.trim() !== '');
  } catch (error) {
    console.error(`Error reading pack ${packName}:`, error);
    return [];
  }
};

// Types for our game
export type GameState = 'selecting' | 'ready' | 'playing' | 'finished';

export interface GameSettings {
  selectedPacks: string[];
  timeLimit: number; // in seconds
}

export interface GameScore {
  correct: number;
  skipped: number;
  items: {
    text: string;
    status: 'correct' | 'skipped';
  }[];
}
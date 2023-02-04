import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Create files inside specified dir
 * @param dirName Directory to hold the files
 * @param jsonVol Keys are filepaths and values are data
 * @returns Full path to directory
 */
export const createFileSystem = (dirName: string, jsonVol: object): string => {
  const tmpPath = path.join(process.cwd(), dirName);
  fs.rmSync(tmpPath, { recursive: true, force: true });
  fs.mkdirSync(tmpPath, { recursive: true });

  Object.keys(jsonVol).map((file) => {
    const parentDir = path.join(tmpPath, path.dirname(file));
    if (parentDir) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    const filePath = path.join(tmpPath, file);
    const data = jsonVol[file] as string;

    fs.writeFileSync(filePath, data, { encoding: 'utf-8' });
  });

  return tmpPath;
};

/**
 * Remove files inside specified dir
 * @param dirName Directory that hold the files
 * @returns Full path to directory
 */
export const cleanFileSystem = (dirName: string): string => {
  const tmpPath = path.join(process.cwd(), dirName);
  fs.rmSync(tmpPath, { recursive: true, force: true });
  return tmpPath;
};

/**
 * Run command using shell
 * @param command Command name
 * @param args Arguments
 * @returns Stdout and Stderr
 */
export const runCommand = async (
  command: string,
  args: string,
): Promise<{ stdout: string; stderr: string }> => {
  return await execAsync(`yarn ts-node src/index.ts ${command} ${args}`);
};

/**
 * Find JSON string inside any string
 * @link https://stackoverflow.com/a/63660736
 * @param text Any string
 * @returns Javascript object
 */
export const findJSON = (text: string): object => {
  const matches = text.match(
    /\{(?:[^{}]|(\{(?:[^{}]|(\{(?:[^{}]|(\{(?:[^{}]|(\{(?:[^{}]|(\{(?:[^{}]|(\{(?:[^{}]|())*\}))*\}))*\}))*\}))*\}))*\}))*\}/g,
  );
  if (matches?.[0]) {
    return JSON.parse(matches[0]);
  }
  return {};
};

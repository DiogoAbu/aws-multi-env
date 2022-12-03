import { execAsync } from './exec-async';
import { logger } from './logger';

export const isWorkingTreeClean = async (dir = '.'): Promise<boolean> => {
  const { stdout, stderr } = await execAsync(`git status ${dir} --porcelain`);
  if (stderr) {
    logger.error(`Git status check on source folders failed with the error message ${stderr}.`);
    process.exit(1);
  }

  return stdout.length === 0;
};

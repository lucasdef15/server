import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs';
import { Response, Request, NextFunction } from 'express';

const logEvents = async (message: string, logFileName: any) => {
  const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss');
  const logItem = `${dateTime}\t${uuidv4()}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
      await fsPromises.promises.mkdir(path.join(__dirname, '..', 'logs'));
    }
    await fsPromises.promises.appendFile(
      path.join(__dirname, '..', 'logs', logFileName),
      logItem
    );
  } catch (error) {
    console.log(error);
  }
};

const logger = (req: Request, res: Response, next: NextFunction) => {
  const ownURL = 'your_own_url_here'; // Replace with your own URL

  //make the req.headers.origin !== ownURL check after deployment

  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log');
  console.log(`${req.method} ${req.path}`);

  next();
};

export { logger, logEvents };

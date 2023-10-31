import JWT from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  let token = req.header('authorization');

  if (!token) {
    return res.status(403).json({
      errors: [
        {
          msg: 'unauthorized',
        },
      ],
    });
  }

  token = token.split(' ')[1];

  JWT.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err: unknown, decoded: any) => {
      if (err) {
        res.clearCookie('token');
        return res.status(403).json({ message: 'Forbidden' });
      }
      req.user = decoded.email;
      req.role = decoded.role;
      next();
    }
  );
};

export default verifyJWT;

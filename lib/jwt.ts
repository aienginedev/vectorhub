// lib/jwt.ts

import jwt from 'jsonwebtoken';

export const verifyJWT = async (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!process.env.JWT_SECRET) {
      return reject('JWT_SECRET is not set');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

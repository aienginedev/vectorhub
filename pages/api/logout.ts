// pages/api/logout.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function logout(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', `token=; HttpOnly; Path=/; Max-Age=0`);
  return res.status(200).json({ message: 'Logged out successfully' });
}

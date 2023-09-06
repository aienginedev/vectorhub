import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.headers['authorization'] || req.cookies['jwt_token'];

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  let decoded: any;
  try {
    decoded = await verifyJWT(token);
  } catch (e) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return;
  }

  try {
    const indexes = await prisma.index.findMany({
      where: {
        authorId: decoded.id,
      },
      include: {
        likes: {
          where: {
            userId: decoded.id,
          }
        },
        author: {
          select: {
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.status(200).json(indexes);
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
}

export default handler;

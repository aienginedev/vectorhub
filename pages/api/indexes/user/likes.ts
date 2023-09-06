import {NextApiRequest, NextApiResponse} from "next";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.headers['authorization'] || req.cookies['jwt_token'];
  let decoded: any;

  try {
    if(token)
    {
      decoded = await verifyJWT(token);
    }
  } catch (e) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return;
  }

  try {
    const indexes = await prisma.index.findMany({
      where: {
        likes: {
          some: {
            userId: decoded.id as string,  // Use the user ID from the decoded JWT payload
          }
        }
      },
      include: {
        likes: {
          where: {
            userId: decoded.id as string,  // Use the user ID from the decoded JWT payload
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
        likesCount: 'desc',
      },
    });

    res.status(200).json(indexes);
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
};


const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.headers['authorization'] || req.cookies['jwt_token'];
  let decoded: any;

  try {
    if(token)
    {
      decoded = await verifyJWT(token);
    }
  } catch (e) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return;
  }
  const {indexId} = req.body;

  try {
    const createdData = await prisma?.like.create({
      data: {
        userId: decoded.id as string,
        indexId: indexId as string,
      }
    });

    await prisma?.index.update({
      where: {id: indexId},
      data: {likesCount: {increment: 1}},
    });

    res.status(200).json(createdData);
  } catch (e) {
    res.status(500).json({message: (e as Error).message});
  }
}

const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.headers['authorization'] || req.cookies['jwt_token'];
  let decoded: any;

  try {
    if(token)
    {
      decoded = await verifyJWT(token);
    }
  } catch (e) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return;
  }

  const {indexId} = req.body;

 
  
  try {
    await prisma?.like.delete({
      where: {
        userId_indexId: {
          userId: decoded.id as string,
          indexId: indexId as string,
        }
      }
    });

    await prisma?.index.update({
      where: {id: indexId},
      data: {likesCount: {decrement: 1}},
    });

    res.status(200).json({message: "unliked successfully"});
  } catch (e) {
    res.status(500).json({message: (e as Error).message});
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
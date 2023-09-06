import { NextApiRequest, NextApiResponse } from "next";
import { verifyJWT } from "@/lib/jwt"; // Your utility function to verify JWT

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
  
  const { page } = req.query;
  const pageSize = 20;
  const skip = page ? (Number(page) - 1) * pageSize : 0;

  try {
    const indexes = await prisma.index.findMany({
      where: {
        published: true,
      },
      include: {
        likes: {
          where: {
            userId: decoded.id as string, // Replaced session?.user?.id with decoded.id
          }
        },
        author: {
          select: {
            name: true,
            image: true,
          }
        }
      },
      orderBy: [
        {
          likesCount: 'desc',
        },
        {
          createdAt: 'desc',
        }
      ],
      skip,
      take: pageSize,
    });

    res.status(200).json(indexes);
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
};

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, name, description, prompt, tags, questions, published, likesCount } = req.body;
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
    const createdIndex = await prisma.index.create({
      data: {
        id: id,
        name: name,
        description: description,
        prompt: prompt,
        tags: tags,
        questions: questions,
        published: published,
        likesCount: likesCount,
        authorId: decoded.id // Replaced session?.user?.id with decoded.id
      }
    });
    res.status(200).json(createdIndex);
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;

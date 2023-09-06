import { NextApiRequest, NextApiResponse } from 'next';
import { hash } from 'bcrypt';
import { prisma } from '@/lib/prisma';

const signup = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password } = req.body;
  
  // You can add more input validation here
  
  try {
    const hashedPassword = await hash(password, 10);
    await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    console.error(error); // Logging the error can be helpful for debugging
    res.status(400).json({ error: 'An error occurred while creating the user' });
  }
};

export default signup;

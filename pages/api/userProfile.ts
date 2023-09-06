import { NextApiRequest, NextApiResponse } from "next";
import { verifyJWT } from '@/lib/jwt';

const userProfile = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.headers['authorization']?.split(' ')[1] || req.cookies['jwt_token'];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  let decoded: any;
  try {
    decoded = await verifyJWT(token);
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  // Here, you can fetch the user information using the decoded data (probably the user ID)
  // For demonstration, let's assume we have fetched the user data and stored it in a variable called `userData`

  const userData = {
    id: decoded.id,
    name: "John Doe",
    email: "john.doe@example.com",
  };

  console.log(userData)

  return res.status(200).json(userData);
};

export default userProfile;

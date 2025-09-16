import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {

    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1]; 
    if (!token) {
      return res.status(401).json({ message: "kindly login first" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    req.user = decoded;
  console.log("Decoded user:", req.user);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

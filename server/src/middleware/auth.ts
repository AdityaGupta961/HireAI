import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "OPTIONS") return res.sendStatus(200);

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "jsonsecret961");

    if (!decoded || typeof decoded === "string" || !(typeof decoded === "object" && "id" in decoded && "email" in decoded)) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    req.user = decoded as JwtPayload & { id: string; email: string };
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

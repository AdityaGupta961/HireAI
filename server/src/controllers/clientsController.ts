import { Request, Response } from 'express';
import { supabase } from "../lib/supabaseClient";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in environment variables");
}

// Helper: generate JWT
const generateToken = (client: { id: string; email: string }) => {
  return jwt.sign(
    { id: client.id, email: client.email.toLowerCase(), role: "recruiter" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailNormalized = email.toLowerCase();
    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("clients")
      .insert([{ 
        name, 
        email: emailNormalized, 
        password_hash: passwordHash  // Changed from passwordhash to password_hash
      }])
      .select("id, name, email, password_hash")
      .single();

    if (error) {
      if (error.code === "23505" || error.message?.includes("duplicate key")) {
        return res.status(409).json({ error: "Email already exists" });
      }
      throw error;
    }

    if (!data) {
      return res.status(500).json({ error: "Failed to create client" });
    }

    delete (data as any).passwordhash;

    const token = generateToken(data);

    return res.status(201).json({ 
      token, 
      token_type: "Bearer", 
      user: data 
    });
  } catch (error) {
    console.error("Error registering client:", error);
    return res.status(500).json({ error: "Failed to register client" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailNormalized = email.toLowerCase();

    const { data, error } = await supabase
      .from("clients")
      .select("id, name, email, password_hash")
      .eq("email", emailNormalized)
      .single();

    if (error || !data || !data.password_hash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, data.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    delete (data as any).passwordhash;

    const token = generateToken(data);

    return res.status(200).json({ 
      token, 
      token_type: "Bearer", 
      user: data 
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ error: "Failed to login" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id;
    if (!clientId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("clients")
      .select("id, name, email, created_at")
      .eq("id", clientId)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Client not found" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error getting profile:", error);
    return res.status(500).json({ error: "Failed to get profile" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id;
    if (!clientId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updates = { ...req.body };

    // Prevent updating protected fields
    delete updates.id;
    delete updates.email;
    delete updates.passwordhash;
    delete updates.created_at;

    const { data, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", clientId)
      .select("id, name, email, created_at")
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Client not found" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};

// Optional: Change password route
export const changePassword = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!clientId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("clients")
      .select("password_hash")
      .eq("id", clientId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Client not found" });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, data.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from("clients")
      .update({ password_hash: newHash })
      .eq("id", clientId);

    if (updateError) throw updateError;

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ error: "Failed to change password" });
  }
};

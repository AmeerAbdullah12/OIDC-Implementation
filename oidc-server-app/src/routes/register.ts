import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const router = Router();

const USERS_FILE = path.resolve(process.cwd(), "users.json");

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

function saveUsers(users: object[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

router.post("/register", async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: "email, password and name are required" });
    return;
  }

  const users = loadUsers();

  const existingUser = users.find((u: { email: string }) => u.email === email);
  if (existingUser) {
    res.status(409).json({ error: "user already exists" });
    return;
  }

  // 12 rounds is the industry standard balance between security and performance
  const passwordHash = await bcrypt.hash(password, 12);

  const newUser = {
    id: crypto.randomUUID(),
    email,
    name,
    passwordHash,
  };

  users.push(newUser);
  saveUsers(users);

  res.status(201).json({ id: newUser.id, email: newUser.email, name: newUser.name });
});

export default router;
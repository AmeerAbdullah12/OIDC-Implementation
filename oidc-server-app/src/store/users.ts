import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

const USERS_FILE = path.resolve(process.cwd(), "users.json");

function loadUsers(): User[] {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8")) as User[];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = loadUsers();
  return users.find((u) => u.email === email) ?? null;
}

export async function validatePassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}
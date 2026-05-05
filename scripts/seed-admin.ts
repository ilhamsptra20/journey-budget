import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { hashPassword } from "../src/core/auth/password";
import { getDb } from "../src/infrastructure/db";
import { authRepository } from "../src/modules/auth/auth.repository";

function loadEnvFromFile(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function seedAdmin() {
  loadEnvFromFile(path.resolve(process.cwd(), ".env"));

  getDb();

  const adminEmail = "admin@example.com";
  const existingAdmin = await authRepository.findByEmail(adminEmail);

  if (existingAdmin) {
    console.log("Admin already exists");
    return;
  }

  const passwordHash = await hashPassword("admin123");

  await authRepository.create({
    name: "Admin",
    email: adminEmail,
    passwordHash,
    role: "admin",
  });

  console.log("Admin created successfully");
}

async function main() {
  try {
    await seedAdmin();
  } catch (error) {
    console.error("Failed to seed admin", error);
    process.exit(1);
  }
}

void main();

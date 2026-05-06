import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { getDb } from "../src/infrastructure/db";
import {
  accommodationCategoryEnum,
  accommodationItems,
  consumptionCategoryEnum,
  consumptionItems,
  logisticItems,
} from "../src/infrastructure/db/schema";

type ConsumptionSeed = {
  title: string;
  category: (typeof consumptionCategoryEnum.enumValues)[number];
  unit: string;
  defaultPrice: number | null;
};

type AccommodationSeed = {
  title: string;
  category: (typeof accommodationCategoryEnum.enumValues)[number];
  unit: string;
  defaultPrice: number | null;
};

type LogisticSeed = {
  title: string;
  unit: string;
  defaultPrice: number | null;
};

const consumptionSeeds: ConsumptionSeed[] = [
  { title: "Bumbu All In", category: "bumbu", unit: "pack", defaultPrice: 50_000 },
  { title: "Kopi Susu", category: "minuman", unit: "cup", defaultPrice: 40_000 },
  { title: "Sarapan Tgl 13", category: "makan_berat", unit: "porsi", defaultPrice: 5_000 },
  { title: "Makan Di Kereta", category: "makan_berat", unit: "porsi", defaultPrice: 15_000 },
  { title: "Sarapan Di BC", category: "makan_berat", unit: "porsi", defaultPrice: 15_000 },
  { title: "Ayam + Tempe Ungkep", category: "makan_berat", unit: "paket", defaultPrice: 100_000 },
  { title: "Jasuke", category: "makanan_ringan", unit: "porsi", defaultPrice: 60_000 },
  { title: "Bakso + Tahu", category: "makan_berat", unit: "porsi", defaultPrice: 20_000 },
  { title: "Beras", category: "bumbu", unit: "kg", defaultPrice: 12_000 },
  { title: "Sarden", category: "bumbu", unit: "kaleng", defaultPrice: 24_000 },
  { title: "Es Buah", category: "minuman", unit: "porsi", defaultPrice: 100_000 },
  { title: "Roti", category: "makanan_ringan", unit: "bungkus", defaultPrice: 15_000 },
  { title: "Sosis Kanzler", category: "makanan_ringan", unit: "pack", defaultPrice: 90_000 },
  { title: "Bolognese", category: "bumbu", unit: "pack", defaultPrice: 35_000 },
  { title: "Pasta", category: "bumbu", unit: "pack", defaultPrice: 15_000 },
];

const accommodationSeeds: AccommodationSeed[] = [
  { title: "Simaksi + Registrasi", category: "simaksi", unit: "orang", defaultPrice: 110_000 },
  { title: "Travel PP", category: "transport", unit: "orang", defaultPrice: 69_231 },
  { title: "Tiket Kereta (Berangkat)", category: "transport", unit: "tiket", defaultPrice: 74_000 },
  { title: "Tiket Kereta (Pulang)", category: "transport", unit: "tiket", defaultPrice: 74_000 },
  { title: "Home Sate", category: "penginapan", unit: "orang", defaultPrice: 20_000 },
  { title: "Grab", category: "transport", unit: "orang", defaultPrice: 15_385 },
];

const logisticSeeds: LogisticSeed[] = [
  { title: "Tenda Double Layer Kapasitas 4", unit: "unit", defaultPrice: 50_000 },
  { title: "Flysheet 4x6", unit: "unit", defaultPrice: 10_000 },
  { title: "Lampu Tenda", unit: "unit", defaultPrice: 5_000 },
  { title: "Jas Hujan", unit: "pcs", defaultPrice: 10_000 },
  { title: "Gas", unit: "tabung", defaultPrice: 10_000 },
  { title: "Matras", unit: "pcs", defaultPrice: 5_000 },
  { title: "P3K", unit: "set", defaultPrice: 120_000 },
  { title: "Kompor", unit: "unit", defaultPrice: 48_000 },
  { title: "Kastrol", unit: "unit", defaultPrice: 120_000 },
  { title: "Silicone Pouch", unit: "pcs", defaultPrice: 13_000 },
  { title: "Baselayer", unit: "pcs", defaultPrice: null },
  { title: "Jaket Hangat", unit: "pcs", defaultPrice: null },
  { title: "Celana", unit: "pcs", defaultPrice: null },
  { title: "Hijab", unit: "pcs", defaultPrice: null },
  { title: "Underwear", unit: "pcs", defaultPrice: null },
  { title: "Topi", unit: "pcs", defaultPrice: null },
  { title: "Kacamata", unit: "pcs", defaultPrice: null },
  { title: "Buff", unit: "pcs", defaultPrice: null },
  { title: "Kaos Kaki", unit: "pasang", defaultPrice: null },
  { title: "Obat Pribadi", unit: "set", defaultPrice: null },
  { title: "Handwarmer", unit: "pcs", defaultPrice: null },
  { title: "Sandal", unit: "pasang", defaultPrice: null },
  { title: "Powerbank + Charger", unit: "set", defaultPrice: null },
  { title: "Headlamp", unit: "unit", defaultPrice: null },
  { title: "Mini Backpack / Slingbag", unit: "unit", defaultPrice: null },
  { title: "Alat Makan (Mangkok + Sendok)", unit: "set", defaultPrice: null },
  { title: "Aqua 2 Liter", unit: "botol", defaultPrice: null },
  { title: "Carrier", unit: "unit", defaultPrice: null },
  { title: "Sepatu Tracking", unit: "pasang", defaultPrice: null },
  { title: "Sleeping Bag", unit: "unit", defaultPrice: null },
  { title: "Sarung Tangan", unit: "pasang", defaultPrice: null },
];

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

function cleanTitle(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

function normalizeTitle(input: string) {
  return cleanTitle(input)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function seedConsumptionItems() {
  const db = getDb();
  const existingRows = await db.select({ title: consumptionItems.title }).from(consumptionItems);
  const normalizedTitles = new Set(existingRows.map((row) => normalizeTitle(row.title)));

  for (const seed of consumptionSeeds) {
    const title = cleanTitle(seed.title);
    const normalized = normalizeTitle(title);

    if (normalizedTitles.has(normalized)) {
      console.log(`[SKIP] ${title}`);
      continue;
    }

    await db.insert(consumptionItems).values({
      title,
      category: seed.category,
      unit: cleanTitle(seed.unit),
      defaultPrice: seed.defaultPrice,
    });

    normalizedTitles.add(normalized);
    console.log(`[CREATE] ${title}`);
  }
}

async function seedAccommodationItems() {
  const db = getDb();
  const existingRows = await db.select({ title: accommodationItems.title }).from(accommodationItems);
  const normalizedTitles = new Set(existingRows.map((row) => normalizeTitle(row.title)));

  for (const seed of accommodationSeeds) {
    const title = cleanTitle(seed.title);
    const normalized = normalizeTitle(title);

    if (normalizedTitles.has(normalized)) {
      console.log(`[SKIP] ${title}`);
      continue;
    }

    await db.insert(accommodationItems).values({
      title,
      category: seed.category,
      unit: cleanTitle(seed.unit),
      defaultPrice: seed.defaultPrice,
    });

    normalizedTitles.add(normalized);
    console.log(`[CREATE] ${title}`);
  }
}

async function seedLogisticItems() {
  const db = getDb();
  const existingRows = await db.select({ title: logisticItems.title }).from(logisticItems);
  const normalizedTitles = new Set(existingRows.map((row) => normalizeTitle(row.title)));

  for (const seed of logisticSeeds) {
    const title = cleanTitle(seed.title);
    const normalized = normalizeTitle(title);

    if (normalizedTitles.has(normalized)) {
      console.log(`[SKIP] ${title}`);
      continue;
    }

    await db.insert(logisticItems).values({
      title,
      unit: cleanTitle(seed.unit),
      defaultPrice: seed.defaultPrice,
    });

    normalizedTitles.add(normalized);
    console.log(`[CREATE] ${title}`);
  }
}

async function seedMasterItems() {
  loadEnvFromFile(path.resolve(process.cwd(), ".env"));

  getDb();

  console.log("Seeding master items...");
  await seedConsumptionItems();
  await seedAccommodationItems();
  await seedLogisticItems();
  console.log("Master items seeding completed.");
}

async function main() {
  try {
    await seedMasterItems();
  } catch (error) {
    console.error("Failed to seed master items", error);
    process.exit(1);
  }
}

void main();

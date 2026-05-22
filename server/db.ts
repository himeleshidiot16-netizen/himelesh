import { MongoClient } from "mongodb";

export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  organization: string;
  website: string;
  address: string;
  linkedin: string;
  twitter: string;
  github: string;
  avatar: string; // Base64 DataURL string
  createdAt: string; // ISO timestamp
}

let cachedClient: MongoClient | null = null;
export let dbMode: "database" | "memory" = "memory";
export let dbConnected = false;
export let dbError: string | null = null;

let lastConnectAttempt = 0;
const RETRY_COOLDOWN_MS = 15000; // 15 seconds cooldown

export function resetDbClient() {
  if (cachedClient) {
    try {
      cachedClient.close().catch(() => {});
    } catch (e) {}
  }
  cachedClient = null;
  dbConnected = false;
}

// In-memory fallback array
const memoryContacts: Contact[] = [];

// Populate some elegant initial seed data in memory mode so the app doesn't look empty
if (memoryContacts.length === 0) {
  memoryContacts.push({
    _id: "664dcdcb1f8d4c9a59cf6b81",
    firstName: "Sarah",
    lastName: "Connor",
    email: "sconnor@cyberdyne.io",
    phone: "+1 (555) 901-2029",
    title: "Lead Security Architect",
    organization: "Cyberdyne Systems",
    website: "https://cyberdyne.io",
    address: "Tech District, Block 4, Los Angeles, CA",
    linkedin: "sconnor",
    twitter: "sarah_connor",
    github: "sconnor-git",
    avatar: "",
    createdAt: new Date().toISOString()
  });
}

export function getMemoryStore() {
  return memoryContacts;
}

export async function getDb(force: boolean = false): Promise<any | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    dbMode = "memory";
    dbConnected = false;
    dbError = "MONGODB_URI environment variable is missing";
    return null;
  }

  // If there's a cached, active client, try returning it
  if (cachedClient && dbConnected) {
    try {
      return cachedClient.db();
    } catch (e) {
      console.warn("Cached db access failed, resetting client:", e);
      resetDbClient();
    }
  }

  const now = Date.now();
  if (!force && dbError && (now - lastConnectAttempt < RETRY_COOLDOWN_MS)) {
    // Under cooldown, return null immediately (fallback to memory mode)
    dbMode = "memory";
    dbConnected = false;
    return null;
  }

  lastConnectAttempt = now;

  try {
    if (force) {
      resetDbClient();
    }

    if (!cachedClient) {
      cachedClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      await cachedClient.connect();
    }
    dbMode = "database";
    dbConnected = true;
    dbError = null;
    return cachedClient.db();
  } catch (error: any) {
    console.warn("MongoDB Connection Error - Falling back to Memory Mode:", error.message || error);
    resetDbClient(); // Ensure cache is cleaned up
    dbMode = "memory";
    dbConnected = false;
    dbError = error.message || String(error);
    return null;
  }
}

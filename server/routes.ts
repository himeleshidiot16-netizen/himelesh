import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb, getMemoryStore, dbError, resetDbClient } from "./db.js";

const router = Router();

// Validate 24-char hex string as standard ObjectId
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// GET /config
router.get("/config", async (req, res) => {
  try {
    const isConfigured = !!process.env.MONGODB_URI;
    const force = req.query.force === "true";
    const db = await getDb(force);
    res.json({
      configured: isConfigured,
      mode: db ? "database" : "memory",
      connected: db ? true : false,
      dbName: db ? (db.databaseName || "cardnet") : "in-memory",
      error: dbError,
    });
  } catch (error: any) {
    if (error.name?.includes("Mongo") || error.message?.includes("closed") || error.message?.includes("SSL")) {
      resetDbClient();
    }
    res.json({
      configured: !!process.env.MONGODB_URI,
      mode: "memory",
      connected: false,
      dbName: "in-memory",
      error: error.message || String(error),
    });
  }
});

// GET /contacts
router.get("/contacts", async (req, res) => {
  try {
    const db = await getDb();
    if (db) {
      const contacts = await db.collection("contacts").find({}).sort({ createdAt: -1 }).toArray();
      res.json(contacts);
    } else {
      // Return memory sorted by createdAt desc
      const sorted = [...getMemoryStore()].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      res.json(sorted);
    }
  } catch (error: any) {
    if (error.name?.includes("Mongo") || error.message?.includes("closed") || error.message?.includes("SSL")) {
      resetDbClient();
    }
    // Still support fallback to memory store if database fails inside route
    try {
      const sorted = [...getMemoryStore()].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      res.json(sorted);
    } catch {
      res.status(500).json({ error: "Failed to fetch contacts", details: error.message });
    }
  }
});

// GET /contacts/:id
router.get("/contacts/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const db = await getDb();
    if (db) {
      const contact = await db.collection("contacts").findOne({ _id: new ObjectId(id) });
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } else {
      const contact = getMemoryStore().find((c) => c._id === id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    }
  } catch (error: any) {
    next(error);
  }
});

// POST /contacts
router.post("/contacts", async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      title,
      organization,
      website,
      address,
      linkedin,
      twitter,
      github,
      avatar,
    } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: "First Name and Last Name are required" });
    }

    const newContact: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: (email || "").trim(),
      phone: (phone || "").trim(),
      title: (title || "").trim(),
      organization: (organization || "").trim(),
      website: (website || "").trim(),
      address: (address || "").trim(),
      linkedin: (linkedin || "").trim(),
      twitter: (twitter || "").trim(),
      github: (github || "").trim(),
      avatar: avatar || "",
      createdAt: new Date().toISOString(),
    };

    const db = await getDb();
    if (db) {
      const result = await db.collection("contacts").insertOne(newContact);
      newContact._id = result.insertedId.toString();
      res.status(201).json(newContact);
    } else {
      // Create a mockup 24-character hex ID
      const mockId = Array.from({ length: 24 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      newContact._id = mockId;
      getMemoryStore().push(newContact);
      res.status(201).json(newContact);
    }
  } catch (error: any) {
    next(error);
  }
});

// PUT /contacts/:id
router.put("/contacts/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      title,
      organization,
      website,
      address,
      linkedin,
      twitter,
      github,
      avatar,
    } = req.body;

    const db = await getDb();
    if (db) {
      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName.trim();
      if (lastName !== undefined) updateData.lastName = lastName.trim();
      if (email !== undefined) updateData.email = email.trim();
      if (phone !== undefined) updateData.phone = phone.trim();
      if (title !== undefined) updateData.title = title.trim();
      if (organization !== undefined) updateData.organization = organization.trim();
      if (website !== undefined) updateData.website = website.trim();
      if (address !== undefined) updateData.address = address.trim();
      if (linkedin !== undefined) updateData.linkedin = linkedin.trim();
      if (twitter !== undefined) updateData.twitter = twitter.trim();
      if (github !== undefined) updateData.github = github.trim();
      if (avatar !== undefined) updateData.avatar = avatar;

      const result = await db.collection("contacts").findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );

      const updatedDoc = result ? (result.value || result) : null;
      if (!updatedDoc) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(updatedDoc);
    } else {
      const store = getMemoryStore();
      const index = store.findIndex((c) => c._id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Contact not found" });
      }

      const existing = store[index];
      const updated: any = {
        ...existing,
        firstName: firstName !== undefined ? firstName.trim() : existing.firstName,
        lastName: lastName !== undefined ? lastName.trim() : existing.lastName,
        email: email !== undefined ? email.trim() : existing.email,
        phone: phone !== undefined ? phone.trim() : existing.phone,
        title: title !== undefined ? title.trim() : existing.title,
        organization: organization !== undefined ? organization.trim() : existing.organization,
        website: website !== undefined ? website.trim() : existing.website,
        address: address !== undefined ? address.trim() : existing.address,
        linkedin: linkedin !== undefined ? linkedin.trim() : existing.linkedin,
        twitter: twitter !== undefined ? twitter.trim() : existing.twitter,
        github: github !== undefined ? github.trim() : existing.github,
        avatar: avatar !== undefined ? avatar : existing.avatar,
      };

      store[index] = updated;
      res.json(updated);
    }
  } catch (error: any) {
    next(error);
  }
});

// DELETE /contacts/:id
router.delete("/contacts/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const db = await getDb();
    if (db) {
      const result = await db.collection("contacts").deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json({ message: "Contact deleted successfully", id });
    } else {
      const store = getMemoryStore();
      const index = store.findIndex((c) => c._id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Contact not found" });
      }
      store.splice(index, 1);
      res.json({ message: "Contact deleted successfully", id });
    }
  } catch (error: any) {
    next(error);
  }
});

export default router;

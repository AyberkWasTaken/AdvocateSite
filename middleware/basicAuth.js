import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function loadCredentials() {
  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;
  if (envUser && envPass) {
    return {
      username: envUser.trim(),
      password: envPass.trim(),
      source: "env"
    };
  }

  const primary = path.join(dataDir, "adminCredentials.json");
  const fallback = path.join(dataDir, "adminCredentials.example.json");

  for (const filePath of [primary, fallback]) {
    try {
      let raw = fs.readFileSync(filePath, "utf8");
      if (raw.charCodeAt(0) === 0xfeff) {
        raw = raw.slice(1);
      }
      const data = JSON.parse(raw);
      const user = typeof data.username === "string" ? data.username.trim() : "";
      const pass = typeof data.password === "string" ? data.password.trim() : "";
      if (user && pass) {
        const source = filePath.endsWith("example.json") ? "example" : "file";
        return { username: user, password: pass, source };
      }
    } catch {
      // try next
    }
  }

  return null;
}

let warnedExample = false;

export function adminBasicAuth() {
  const creds = loadCredentials();

  return (req, res, next) => {
    if (!creds) {
      return res.status(503).render("pages/admin-setup-needed", {
        title: "Yonetim Ayari Eksik",
        currentPath: req.path
      });
    }

    if (creds.source === "example" && !warnedExample) {
      warnedExample = true;
      console.warn(
        "[admin] adminCredentials.json bulunamadi; ornek dosya kullaniliyor. " +
          "Guvenlik icin data/adminCredentials.json olusturup sifreyi degistirin."
      );
    }

    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Basic ")) {
      res.setHeader("WWW-Authenticate", 'Basic realm="Yonetim Paneli"');
      return res.status(401).end();
    }

    let decoded;
    try {
      decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
    } catch {
      res.setHeader("WWW-Authenticate", 'Basic realm="Yonetim Paneli"');
      return res.status(401).end();
    }

    const colon = decoded.indexOf(":");
    const user = colon === -1 ? decoded : decoded.slice(0, colon);
    const pass = colon === -1 ? "" : decoded.slice(colon + 1);

    if (safeEqual(user, creds.username) && safeEqual(pass, creds.password)) {
      return next();
    }

    res.setHeader("WWW-Authenticate", 'Basic realm="Yonetim Paneli"');
    return res.status(401).end();
  };
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "..", "data", "blogPosts.json");

function readPosts() {
  const raw = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(raw);
}

function writePosts(posts) {
  fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2), "utf-8");
}

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function listPosts() {
  return readPosts().sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

function getPostBySlug(slug) {
  return readPosts().find((post) => post.slug === slug);
}

function createPost({ title, summary, content }) {
  const posts = readPosts();
  const slug = createSlug(title);

  if (posts.some((post) => post.slug === slug)) {
    throw new Error("Ayni baslikta bir yazi zaten var.");
  }

  const newPost = {
    id: `${Date.now()}`,
    title,
    slug,
    summary,
    content,
    publishedAt: new Date().toISOString().slice(0, 10)
  };

  posts.unshift(newPost);
  writePosts(posts);
  return newPost;
}

export { listPosts, getPostBySlug, createPost };

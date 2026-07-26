import { createClient } from "@supabase/supabase-js";

import ws from "ws"


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY, {realtime: {transport : ws}}
);

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function mapPost(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    publishedAt: row.published_at,
  };
}

// In-memory cache for the full post list — no fixed expiry, since the data only
// changes when create/update/delete run below, and those clear it immediately.
let cachedPosts = null;

function invalidateCache() {
  cachedPosts = null;
}

async function listPosts() {
  if (cachedPosts) return cachedPosts;
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) throw error;
  cachedPosts = data.map(mapPost);
  return cachedPosts;
}

async function getPostBySlug(slug) {
  if (cachedPosts) {
    const cached = cachedPosts.find((post) => post.slug === slug);
    if (cached) return cached;
  }
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return mapPost(data);
}

async function createPost({ title, summary, content }) {
  const slug = createSlug(title);
  const id = `${Date.now()}`;
  const publishedAt = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({ id, title, slug, summary, content, published_at: publishedAt })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("Ayni baslikta bir yazi zaten var.");
    throw error;
  }
  invalidateCache();
  return mapPost(data);
}

async function updatePost(id, { title, summary, content }) {
  const slug = createSlug(title);

  const { data, error } = await supabase
    .from("blog_posts")
    .update({ title, slug, summary, content })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("Ayni baslikta bir yazi zaten var.");
    throw error;
  }
  invalidateCache();
  return mapPost(data);
}

async function getPostById(id) {
  if (cachedPosts) {
    const cached = cachedPosts.find((post) => post.id === id);
    if (cached) return cached;
  }
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return mapPost(data);
}

async function deletePost(id) {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
  invalidateCache();
}

export { listPosts, getPostBySlug, getPostById, createPost, updatePost, deletePost };

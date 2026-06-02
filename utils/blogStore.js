import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
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

async function listPosts() {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data.map(mapPost);
}

async function getPostBySlug(slug) {
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
  return mapPost(data);
}

async function getPostById(id) {
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
}

export { listPosts, getPostBySlug, getPostById, createPost, updatePost, deletePost };

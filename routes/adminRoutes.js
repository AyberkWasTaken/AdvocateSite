import express from "express";
import { listPosts, getPostById, createPost, updatePost, deletePost } from "../utils/blogStore.js";
import { BLOG_CATEGORIES, categoryLabel } from "../utils/blogCategories.js";

function withCategoryLabels(posts) {
  return posts.map((post) => ({ ...post, categoryLabel: categoryLabel(post.category) }));
}

const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.redirect("/admin/login");
}

router.get("/login", (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect("/admin");
  res.render("admin/login", {
    title: "Giriş",
    description: "",
    noindex: true,
    error: null,
    currentPath: "/admin/login"
  });
});

router.post("/login", (req, res) => {
  const username = (req.body.username || "").trim();
  const password = (req.body.password || "").trim();
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect("/admin");
  }
  res.status(401).render("admin/login", {
    title: "Giriş",
    description: "",
    noindex: true,
    error: "Kullanıcı adı veya şifre hatalı.",
    currentPath: "/admin/login"
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

router.get("/", requireAdmin, async (req, res) => {
  res.render("admin/dashboard", {
    title: "Admin Panel",
    description: "",
    noindex: true,
    posts: withCategoryLabels(await listPosts()),
    categories: BLOG_CATEGORIES,
    error: null,
    formValues: {},
    currentPath: "/admin"
  });
});

router.post("/posts", requireAdmin, async (req, res) => {
  const { title, summary, content, category, faq } = req.body;
  if (!title || !summary || !content || !category) {
    return res.status(400).render("admin/dashboard", {
      title: "Admin Panel",
      description: "",
      noindex: true,
      posts: withCategoryLabels(await listPosts()),
      categories: BLOG_CATEGORIES,
      error: "Başlık, konu, özet ve içerik zorunludur.",
      formValues: { title, summary, content, category, faq },
      currentPath: "/admin"
    });
  }
  try {
    await createPost({ title, summary, content, category, faq: faq || null });
    res.redirect("/admin");
  } catch (err) {
    res.status(400).render("admin/dashboard", {
      title: "Admin Panel",
      description: "",
      noindex: true,
      posts: withCategoryLabels(await listPosts()),
      categories: BLOG_CATEGORIES,
      error: err.message,
      formValues: { title, summary, content, category, faq },
      currentPath: "/admin"
    });
  }
});

router.get("/posts/:id/edit", requireAdmin, async (req, res) => {
  const post = await getPostById(req.params.id);
  if (!post) return res.redirect("/admin");
  res.render("admin/edit", {
    title: "Yazıyı Düzenle",
    description: "",
    noindex: true,
    post,
    categories: BLOG_CATEGORIES,
    error: null,
    currentPath: "/admin"
  });
});

router.post("/posts/:id/edit", requireAdmin, async (req, res) => {
  const { title, summary, content, category, faq } = req.body;
  if (!title || !summary || !content || !category) {
    const post = await getPostById(req.params.id);
    return res.status(400).render("admin/edit", {
      title: "Yazıyı Düzenle",
      description: "",
      noindex: true,
      post: { ...post, title, summary, content, category, faq },
      categories: BLOG_CATEGORIES,
      error: "Başlık, konu, özet ve içerik zorunludur.",
      currentPath: "/admin"
    });
  }
  try {
    await updatePost(req.params.id, { title, summary, content, category, faq: faq || null });
    res.redirect("/admin");
  } catch (err) {
    const post = await getPostById(req.params.id);
    res.status(400).render("admin/edit", {
      title: "Yazıyı Düzenle",
      description: "",
      noindex: true,
      post: { ...post, title, summary, content, category, faq },
      categories: BLOG_CATEGORIES,
      error: err.message,
      currentPath: "/admin"
    });
  }
});

router.post("/posts/:id/delete", requireAdmin, async (req, res) => {
  try {
    await deletePost(req.params.id);
  } catch (err) {
    console.error("[admin] Silme hatası:", err.message);
  }
  res.redirect("/admin");
});

export default router;

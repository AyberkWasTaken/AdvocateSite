import express from "express";
import { listPosts, createPost, deletePost } from "../utils/blogStore.js";

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
  const { username, password } = req.body;
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
    posts: await listPosts(),
    error: null,
    formValues: {},
    currentPath: "/admin"
  });
});

router.post("/posts", requireAdmin, async (req, res) => {
  const { title, summary, content } = req.body;
  if (!title || !summary || !content) {
    return res.status(400).render("admin/dashboard", {
      title: "Admin Panel",
      description: "",
      noindex: true,
      posts: await listPosts(),
      error: "Tüm alanlar zorunludur.",
      formValues: { title, summary, content },
      currentPath: "/admin"
    });
  }
  try {
    await createPost({ title, summary, content });
    res.redirect("/admin");
  } catch (err) {
    res.status(400).render("admin/dashboard", {
      title: "Admin Panel",
      description: "",
      noindex: true,
      posts: await listPosts(),
      error: err.message,
      formValues: { title, summary, content },
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

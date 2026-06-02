import express from "express";
import { listPosts, createPost } from "../utils/blogStore.js";

const router = express.Router();

router.get("/", async (req, res) => {
  res.render("admin/dashboard", {
    title: "Admin Panel",
    description: "",
    noindex: true,
    posts: await listPosts(),
    error: null,
    formValues: {},
    currentPath: req.baseUrl
  });
});

router.post("/posts", async (req, res) => {
  const { title, summary, content } = req.body;

  if (!title || !summary || !content) {
    return res.status(400).render("admin/dashboard", {
      title: "Admin Panel",
      description: "",
      noindex: true,
      posts: await listPosts(),
      error: "Tüm alanlar zorunludur.",
      formValues: { title, summary, content },
      currentPath: req.baseUrl
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
      currentPath: req.baseUrl
    });
  }
});

export default router;

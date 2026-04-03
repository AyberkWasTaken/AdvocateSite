import express from "express";
import { listPosts, getPostBySlug } from "../utils/blogStore.js";
import { isMailConfigured, sendContactEmail } from "../utils/mail.js";

const router = express.Router();

router.get("/", (req, res) => {
  const posts = listPosts().slice(0, 3);
  res.render("pages/home", {
    title: "Ana Sayfa",
    posts,
    currentPath: req.path
  });
});

router.get("/about", (req, res) => {
  res.render("pages/about", {
    title: "Hakkında",
    currentPath: req.path
  });
});

router.get("/services", (req, res) => {
  res.render("pages/services", {
    title: "Hizmetler",
    currentPath: req.path
  });
});

router.get("/contact", (req, res) => {
  const success = req.query.success === "1";
  const error = req.query.error || null;
  res.render("pages/contact", {
    title: "İletişim",
    success,
    error,
    currentPath: req.path
  });
});

router.post("/contact", async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name : "";
  const phone = typeof req.body.phone === "string" ? req.body.phone : "";
  const email = typeof req.body.email === "string" ? req.body.email : "";
  const message = typeof req.body.message === "string" ? req.body.message : "";

  if (!name.trim() || !phone.trim() || !email.trim() || !message.trim()) {
    return res.redirect("/contact?error=validation");
  }

  if (!isMailConfigured()) {
    console.warn("[contact] SMTP ayarlari eksik (.env icinde SMTP_HOST, SMTP_USER, SMTP_PASS, MAIL_TO)");
    return res.redirect("/contact?error=config");
  }

  try {
    await sendContactEmail({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      message: message.trim()
    });
    return res.redirect("/contact?success=1");
  } catch (err) {
    console.error("[contact] E-posta gonderilemedi:", err.message);
    return res.redirect("/contact?error=send");
  }
});

router.get("/blog", (req, res) => {
  const posts = listPosts();
  res.render("pages/blog-list", {
    title: "Blog",
    posts,
    currentPath: req.path
  });
});

router.get("/blog/:slug", (req, res) => {
  const post = getPostBySlug(req.params.slug);
  if (!post) {
    return res.status(404).render("pages/404", {
      title: "Yazı Bulunamadı",
      currentPath: req.path
    });
  }

  res.render("pages/blog-detail", {
    title: post.title,
    post,
    currentPath: req.path
  });
});

export default router;

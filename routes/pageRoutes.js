import express from "express";
import { listPosts, getPostBySlug } from "../utils/blogStore.js";
import { BLOG_CATEGORIES, categoryLabel } from "../utils/blogCategories.js";
import { isMailConfigured, sendContactEmail } from "../utils/mail.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const posts = (await listPosts()).slice(0, 3);
  res.render("pages/home", {
    title: "Eskişehir Avukat",
    description:
      "Eskişehir'de güvenilir hukuki danışmanlık. Av. Enes Aktaş; aile, iş, ceza ve icra hukuku alanlarında bireysel ve kurumsal müvekkillere profesyonel avukatlık hizmeti sunmaktadır.",
    noindex: false,
    posts,
    currentPath: req.path
  });
});

router.get("/about", (req, res) => {
  res.render("pages/about", {
    title: "Eskişehir Avukat Hakkında | Deneyim ve Uzmanlık",
    description:
      "Eskişehir Barosu üyesi Av. Enes Aktaş hakkında bilgi edinin. Aile, iş, ceza ve icra hukuku alanlarında deneyimli avukatlık ve hukuki danışmanlık hizmeti.",
    noindex: false,
    currentPath: req.path
  });
});

router.get("/services", (req, res) => {
  res.render("pages/services", {
    title: "Eskişehir Avukatlık Hizmetleri | Boşanma, İş, Ceza, İcra Hukuku",
    description:
      "Eskişehir'de aile hukuku, iş hukuku, ceza hukuku, icra-iflas, gayrimenkul ve tüketici hukuku alanlarında profesyonel avukatlık hizmeti. Av. Enes Aktaş, Odunpazarı.",
    noindex: false,
    currentPath: req.path
  });
});

router.get("/contact", (req, res) => {
  const success = req.query.success === "1";
  const error = req.query.error || null;
  res.render("pages/contact", {
    title: "Eskişehir Avukat İletişim | Randevu Alın",
    description:
      "Eskişehir avukat Av. Enes Aktaş ile iletişime geçin. Odunpazarı ofisimizde yüz yüze veya telefon ile hukuki danışmanlık randevusu alın.",
    noindex: false,
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

router.get("/blog", async (req, res) => {
  const allPosts = await listPosts();

  const category = BLOG_CATEGORIES.some((c) => c.value === req.query.category)
    ? req.query.category
    : "all";
  const sort = req.query.sort === "oldest" ? "oldest" : "newest";

  let posts = category === "all" ? allPosts : allPosts.filter((p) => p.category === category);
  posts = [...posts].sort((a, b) =>
    sort === "oldest"
      ? a.publishedAt.localeCompare(b.publishedAt)
      : b.publishedAt.localeCompare(a.publishedAt)
  );
  posts = posts.map((post) => ({ ...post, categoryLabel: categoryLabel(post.category) }));

  res.render("pages/blog-list", {
    title: "Eskişehir Hukuk Blogu | Güncel Hukuki Bilgiler",
    description:
      "Av. Enes Aktaş hukuk blogu. Eskişehir'de güncel hukuki bilgiler, dava süreçleri ve haklarınız hakkında makaleler.",
    noindex: false,
    posts,
    categories: BLOG_CATEGORIES,
    selectedCategory: category,
    selectedSort: sort,
    currentPath: req.path
  });
});

router.get("/blog/:slug", async (req, res) => {
  const post = await getPostBySlug(req.params.slug);
  if (!post) {
    return res.status(404).render("pages/404", {
      title: "Yazı Bulunamadı",
      description: "",
      noindex: true,
      currentPath: req.path
    });
  }

  res.render("pages/blog-detail", {
    title: post.title,
    description: post.summary,
    noindex: false,
    post: { ...post, categoryLabel: categoryLabel(post.category) },
    currentPath: req.path
  });
});

router.get("/sitemap.xml", async (req, res) => {
  const posts = await listPosts();
  const base = process.env.SITE_URL || `${req.protocol}://${req.get("host")}`;

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/about", priority: "0.8", changefreq: "monthly" },
    { loc: "/services", priority: "0.9", changefreq: "monthly" },
    { loc: "/blog", priority: "0.7", changefreq: "weekly" },
    { loc: "/contact", priority: "0.8", changefreq: "monthly" }
  ];

  const postPages = posts.map((post) => ({
    loc: `/blog/${post.slug}`,
    priority: "0.6",
    changefreq: "never",
    lastmod: post.publishedAt
  }));

  const entries = [...staticPages, ...postPages]
    .map(
      (p) =>
        `  <url>\n    <loc>${base}${p.loc}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>${p.lastmod ? `\n    <lastmod>${p.lastmod}</lastmod>` : ""}\n  </url>`
    )
    .join("\n");

  res.set("Content-Type", "application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`);
});

export default router;

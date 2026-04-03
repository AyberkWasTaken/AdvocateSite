import nodemailer from "nodemailer";

/** E-posta iceriginde HTML icin guvenli cikti */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isMailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.MAIL_TO
  );
}

/**
 * Sends contact form content to MAIL_TO. Requires SMTP_* and MAIL_TO in .env.
 * Sets Reply-To to the visitor's email so you can answer in one click.
 */
export async function sendContactEmail({ name, phone, email, message }) {
  if (!isMailConfigured()) {
    const err = new Error("MAIL_NOT_CONFIGURED");
    err.code = "MAIL_NOT_CONFIGURED";
    throw err;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const to = process.env.MAIL_TO;
  const siteName = process.env.MAIL_SITE_NAME || "Web sitesi iletisim";

  const safeName = String(name).trim().slice(0, 200);
  const safePhone = String(phone).trim().slice(0, 50);
  const safeEmail = String(email).trim().slice(0, 320);
  const safeMessage = String(message).trim().slice(0, 20000);

  /*
   * === Iletisim e-posta "tarzi" ===
   * - Asagidaki `text` blokunu duzenleyerek duz metin surumunu degistirin.
   * - `html` sablonundaki renkler, baslik metni ve satir duzenini degistirin.
   * - Konu satiri: `subject` (MAIL_SITE_NAME .env'den gelir).
   */
  const text = [
    "Yeni iletisim formu mesaji",
    "",
    `Ad Soyad: ${safeName}`,
    `Telefon: ${safePhone}`,
    `E-posta: ${safeEmail}`,
    "",
    "Mesaj:",
    safeMessage,
    ""
  ].join("\n");

  const hn = escapeHtml(safeName);
  const hp = escapeHtml(safePhone);
  const he = escapeHtml(safeEmail);
  const hm = escapeHtml(safeMessage).replace(/\r\n|\r|\n/g, "<br/>");

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Segoe UI,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:580px;">

          <!-- HEADER -->
          <tr>
            <td style="background:#1e3a5f;border-radius:12px 12px 0 0;padding:28px 32px;">
              <p style="margin:0;font-size:11px;letter-spacing:2px;color:#93c5fd;text-transform:uppercase;">İletişim Formu</p>
              <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:#ffffff;">${siteName}</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#ffffff;padding:32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

              <!-- Bilgi satırlari -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                    <span style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Ad Soyad</span><br/>
                    <span style="font-size:15px;color:#1e293b;font-weight:600;">${hn}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                    <span style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Telefon</span><br/>
                    <span style="font-size:15px;color:#1e293b;">${hp}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                    <span style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">E-posta</span><br/>
                    <a href="mailto:${encodeURIComponent(safeEmail)}" style="font-size:15px;color:#1d4ed8;text-decoration:none;">${he}</a>
                  </td>
                </tr>
              </table>

              <!-- Mesaj kutusu -->
              <p style="margin:0 0 8px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Mesaj</p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #1e3a5f;border-radius:0 8px 8px 0;padding:16px 20px;font-size:15px;color:#334155;line-height:1.7;">
                ${hm}
              </div>

              <!-- Reply butonu -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:28px;">
                <tr>
                  <td style="background:#1e3a5f;border-radius:8px;padding:12px 24px;">
                    <a href="mailto:${encodeURIComponent(safeEmail)}" style="color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">Yanıtla →</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">Bu e-posta <strong style="color:#64748b;">${siteName}</strong> web sitesi iletişim formu aracılığıyla gönderilmiştir.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"${siteName}" <${from}>`,
    to,
    replyTo: safeEmail,
    subject: `[${siteName}] ${safeName}`,
    text,
    html
  });
}

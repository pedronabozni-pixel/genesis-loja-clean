import nodemailer from "nodemailer";

function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? "",
    to: process.env.NEWSLETTER_RECEIVER_EMAIL ?? "Contato@genesisecom.com.br"
  };
}

export function isNewsletterEmailConfigured() {
  const config = getSmtpConfig();
  return Boolean(config.host && config.port && config.user && config.pass && config.from && config.to);
}

export async function sendNewsletterLeadEmail(email: string, createdAt: string) {
  const config = getSmtpConfig();

  if (!isNewsletterEmailConfigured()) {
    return { ok: false as const, skipped: true as const };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    replyTo: email,
    subject: "Novo lead da newsletter - Genesis Distribuidora",
    text: `Novo lead cadastrado na loja.\n\nE-mail: ${email}\nData: ${createdAt}\nOrigem: Newsletter do site`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111;">
        <h2>Novo lead da newsletter</h2>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Data:</strong> ${createdAt}</p>
        <p><strong>Origem:</strong> Newsletter do site Genesis Distribuidora</p>
      </div>
    `
  });

  return { ok: true as const, skipped: false as const };
}

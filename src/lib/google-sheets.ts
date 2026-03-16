import { google } from "googleapis";

const GOOGLE_SHEETS_SCOPE = ["https://www.googleapis.com/auth/spreadsheets"];

function getPrivateKey() {
  const raw = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  return raw ? raw.replace(/\\n/g, "\n") : "";
}

function getSheetsConfig() {
  return {
    clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL ?? "",
    privateKey: getPrivateKey(),
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? "",
    sheetName: process.env.GOOGLE_SHEETS_SHEET_NAME ?? "Leads"
  };
}

export function isGoogleSheetsConfigured() {
  const config = getSheetsConfig();
  return Boolean(config.clientEmail && config.privateKey && config.spreadsheetId);
}

export async function appendNewsletterLeadToGoogleSheets(email: string, createdAt: string) {
  const config = getSheetsConfig();

  if (!isGoogleSheetsConfigured()) {
    return { ok: false, skipped: true as const };
  }

  const auth = new google.auth.JWT({
    email: config.clientEmail,
    key: config.privateKey,
    scopes: GOOGLE_SHEETS_SCOPE
  });

  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheetId,
    range: `${config.sheetName}!A:C`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[createdAt, email, "Genesis Distribuidora"]]
    }
  });

  return { ok: true as const, skipped: false as const };
}

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

export type InquiryStatus = "new" | "resolved";
export type InquiryTopic = "general" | "in-person" | "custom";

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  topic: InquiryTopic;
  status: InquiryStatus;
  createdAt: string;
}

export interface InquiryInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
  topic?: InquiryTopic;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "inquiries.json");

async function ensureDataFile(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DATA_FILE)) {
    await writeFile(DATA_FILE, "[]", "utf-8");
  }
}

export async function getInquiries(): Promise<Inquiry[]> {
  await ensureDataFile();
  const raw = await readFile(DATA_FILE, "utf-8");
  const list = JSON.parse(raw) as Inquiry[];
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function saveInquiries(inquiries: Inquiry[]): Promise<void> {
  await ensureDataFile();
  await writeFile(DATA_FILE, JSON.stringify(inquiries, null, 2), "utf-8");
}

export async function addInquiry(input: InquiryInput): Promise<Inquiry> {
  const inquiry: Inquiry = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    subject: input.subject?.trim() || undefined,
    message: input.message,
    topic: input.topic ?? "general",
    status: "new",
    createdAt: new Date().toISOString(),
  };
  const all = await getInquiries();
  all.push(inquiry);
  await saveInquiries(all);
  return inquiry;
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus
): Promise<Inquiry | null> {
  const all = await getInquiries();
  const idx = all.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  all[idx].status = status;
  await saveInquiries(all);
  return all[idx];
}

export async function deleteInquiry(id: string): Promise<boolean> {
  const all = await getInquiries();
  const next = all.filter((i) => i.id !== id);
  if (next.length === all.length) return false;
  await saveInquiries(next);
  return true;
}

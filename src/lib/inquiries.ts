import { getRedis, parseRecord } from "@/lib/redis";

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

// inquiries   hash   id -> Inquiry JSON
const INQUIRIES_KEY = "inquiries";

export async function getInquiries(): Promise<Inquiry[]> {
  const redis = getRedis();
  const raw = await redis.hgetall<Record<string, unknown>>(INQUIRIES_KEY);
  if (!raw) return [];

  const list: Inquiry[] = [];
  for (const value of Object.values(raw)) {
    const inquiry = parseRecord<Inquiry>(value);
    if (inquiry) list.push(inquiry);
  }

  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function addInquiry(input: InquiryInput): Promise<Inquiry> {
  const redis = getRedis();
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

  await redis.hset(INQUIRIES_KEY, { [inquiry.id]: JSON.stringify(inquiry) });
  return inquiry;
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus
): Promise<Inquiry | null> {
  const redis = getRedis();
  const existing = parseRecord<Inquiry>(await redis.hget(INQUIRIES_KEY, id));
  if (!existing) return null;

  const updated: Inquiry = { ...existing, status };
  await redis.hset(INQUIRIES_KEY, { [id]: JSON.stringify(updated) });
  return updated;
}

export async function deleteInquiry(id: string): Promise<boolean> {
  const redis = getRedis();
  const removed = await redis.hdel(INQUIRIES_KEY, id);
  return removed > 0;
}

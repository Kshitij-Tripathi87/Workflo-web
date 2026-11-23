import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(160).optional().default(""),
  role: z.string().trim().max(120).optional().default(""),
  inquiryType: z.enum(["product", "security", "partnership", "privacy", "other"]),
  message: z.string().trim().min(10).max(5000),
  consentToReply: z.literal(true),
  website: z.string().max(0).optional().default(""),
}).strict();

export const earlyAccessSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  company: z.string().trim().min(2).max(160),
  role: z.string().trim().max(120).optional().default(""),
  teamSize: z.enum(["1", "2-5", "6-20", "21-50", "51-200", "200+"]),
  useCase: z.string().trim().min(20).max(3000),
  workflow: z.string().trim().max(2000).optional().default(""),
  consentToReply: z.literal(true),
  website: z.string().max(0).optional().default(""),
}).strict();

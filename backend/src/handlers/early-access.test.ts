import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  company: z.string().trim().min(2).max(160),
  role: z.string().trim().max(120).optional().default(""),
  teamSize: z.enum(["1", "2-5", "6-20", "21-50", "51-200", "200+"]),
  useCase: z.string().trim().min(20).max(3000),
  workflow: z.string().trim().max(2000).optional().default(""),
  consentToReply: z.literal(true),
  website: z.string().max(0).optional().default("")
}).strict();

test("accepts an explicit early-access application", () => {
  const parsed = schema.safeParse({
    name: "Ada Example",
    email: "ada@example.com",
    company: "Example Engineering",
    teamSize: "6-20",
    useCase: "We need repeatable isolated verification for code changes.",
    consentToReply: true,
    website: ""
  });
  assert.equal(parsed.success, true);
});

test("rejects malformed email and missing reply consent", () => {
  const parsed = schema.safeParse({
    name: "Ada Example",
    email: "not-an-email",
    company: "Example Engineering",
    teamSize: "6-20",
    useCase: "We need repeatable isolated verification for code changes."
  });
  assert.equal(parsed.success, false);
});

test("rejects unexpected properties", () => {
  const parsed = schema.safeParse({
    name: "Ada Example",
    email: "ada@example.com",
    company: "Example Engineering",
    teamSize: "6-20",
    useCase: "We need repeatable isolated verification for code changes.",
    consentToReply: true,
    isAdmin: true
  });
  assert.equal(parsed.success, false);
});
import test from "node:test";
import assert from "node:assert/strict";
import { contactSchema, earlyAccessSchema } from "../validation/submissions.js";

test("contact enquiry accepts supported categories and normalises optional fields", () => {
  const parsed = contactSchema.safeParse({
    name: "Ada Example",
    email: "ada@example.com",
    inquiryType: "privacy",
    message: "Please explain how my submitted enquiry is stored.",
    consentToReply: true,
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.company, "");
    assert.equal(parsed.data.role, "");
    assert.equal(parsed.data.website, "");
  }
});

test("contact enquiry rejects invalid email, missing consent and unknown fields", () => {
  const invalidEmail = contactSchema.safeParse({
    name: "Ada Example",
    email: "not-an-email",
    inquiryType: "product",
    message: "Please contact me about evaluation.",
    consentToReply: true,
  });
  const missingConsent = contactSchema.safeParse({
    name: "Ada Example",
    email: "ada@example.com",
    inquiryType: "product",
    message: "Please contact me about evaluation.",
  });
  const unexpected = contactSchema.safeParse({
    name: "Ada Example",
    email: "ada@example.com",
    inquiryType: "product",
    message: "Please contact me about evaluation.",
    consentToReply: true,
    isAdmin: true,
  });
  assert.equal(invalidEmail.success, false);
  assert.equal(missingConsent.success, false);
  assert.equal(unexpected.success, false);
});

test("early-access application accepts a complete application", () => {
  const parsed = earlyAccessSchema.safeParse({
    name: "Ada Example",
    email: "ada@example.com",
    company: "Example Engineering",
    teamSize: "6-20",
    useCase: "We need repeatable isolated verification for code changes.",
    consentToReply: true,
  });
  assert.equal(parsed.success, true);
});

test("early-access application rejects malformed requests and unexpected properties", () => {
  const malformed = earlyAccessSchema.safeParse({
    name: "Ada Example",
    email: "not-an-email",
    company: "Example Engineering",
    teamSize: "6-20",
    useCase: "We need repeatable isolated verification for code changes.",
    consentToReply: true,
  });
  const unexpected = earlyAccessSchema.safeParse({
    name: "Ada Example",
    email: "ada@example.com",
    company: "Example Engineering",
    teamSize: "6-20",
    useCase: "We need repeatable isolated verification for code changes.",
    consentToReply: true,
    admin: true,
  });
  assert.equal(malformed.success, false);
  assert.equal(unexpected.success, false);
});

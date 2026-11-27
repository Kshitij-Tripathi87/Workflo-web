import assert from "node:assert/strict";
import test from "node:test";
import { validateContact, validateEarlyAccess } from "../_shared/validation";

test("contact validation accepts the documented payload", () => {
  const result = validateContact({
    name: "Ada Example",
    email: "ada@example.com",
    company: "Example Engineering",
    role: "Engineering Lead",
    inquiryType: "product",
    message: "We need repeatable repository verification.",
    consentToReply: true,
    website: "",
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.name, "Ada Example");
    assert.equal(result.data.consentToReply, true);
  }
});

test("contact validation rejects unexpected fields", () => {
  const result = validateContact({
    name: "Ada Example",
    email: "ada@example.com",
    inquiryType: "product",
    message: "We need repeatable repository verification.",
    consentToReply: true,
    website: "",
    isAdmin: true,
  });
  assert.equal(result.success, false);
  if (!result.success) assert.ok(result.issues.formErrors.length > 0);
});

test("early-access validation accepts the documented payload", () => {
  const result = validateEarlyAccess({
    name: "Ada Example",
    email: "ada@example.com",
    company: "Example Engineering",
    role: "Engineering Lead",
    teamSize: "6-20",
    useCase: "We need repeatable isolated verification for code changes.",
    workflow: "GitHub pull requests and CI pipelines.",
    consentToReply: true,
    website: "",
  });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.teamSize, "6-20");
});

test("early-access validation requires consent and a valid team size", () => {
  const result = validateEarlyAccess({
    name: "Ada Example",
    email: "ada@example.com",
    company: "Example Engineering",
    teamSize: "large",
    useCase: "We need repeatable isolated verification for code changes.",
    consentToReply: false,
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.issues.fieldErrors.consentToReply);
    assert.ok(result.issues.fieldErrors.teamSize);
  }
});

test("both forms reject oversized messages and invalid email addresses", () => {
  const contact = validateContact({
    name: "Ada Example",
    email: "not-an-email",
    inquiryType: "product",
    message: "x".repeat(5001),
    consentToReply: true,
  });
  assert.equal(contact.success, false);
  if (!contact.success) {
    assert.ok(contact.issues.fieldErrors.email);
    assert.ok(contact.issues.fieldErrors.message);
  }
});

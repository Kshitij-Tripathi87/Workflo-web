export type ContactInput = {
  name: string;
  email: string;
  company: string;
  role: string;
  inquiryType: "product" | "security" | "partnership" | "privacy" | "other";
  message: string;
  consentToReply: true;
  website: string;
};

export type EarlyAccessInput = {
  name: string;
  email: string;
  company: string;
  role: string;
  teamSize: "1" | "2-5" | "6-20" | "21-50" | "51-200" | "200+";
  useCase: string;
  workflow: string;
  consentToReply: true;
  website: string;
};

export type ValidationIssues = {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
};

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; issues: ValidationIssues };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail<T>(fieldErrors: Record<string, string[]>, formErrors: string[] = []): ValidationResult<T> {
  return { success: false, issues: { formErrors, fieldErrors } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectUnknownKeys(
  value: Record<string, unknown>,
  allowed: Set<string>,
): string[] {
  return Object.keys(value).filter((key) => !allowed.has(key));
}

function readString(
  value: Record<string, unknown>,
  key: string,
  errors: Record<string, string[]>,
  options: { required?: boolean; min?: number; max: number; trim?: boolean },
): string {
  const candidate = value[key];
  if (candidate === undefined && !options.required) return "";
  if (typeof candidate !== "string") {
    errors[key] = ["Expected a string"];
    return "";
  }

  const result = options.trim === false ? candidate : candidate.trim();
  if (options.required && result.length === 0) errors[key] = ["Required"];
  else if (options.min !== undefined && result.length < options.min) {
    errors[key] = [`String must contain at least ${options.min} character(s)`];
  } else if (result.length > options.max) {
    errors[key] = [`String must contain at most ${options.max} character(s)`];
  }
  return result;
}

function readConsent(value: Record<string, unknown>, errors: Record<string, string[]>): true {
  if (value.consentToReply !== true) errors.consentToReply = ["Invalid literal value, expected true"];
  return true;
}

function readHoneypot(value: Record<string, unknown>, errors: Record<string, string[]>): string {
  const website = readString(value, "website", errors, { max: 0, trim: false });
  return website;
}

export function validateContact(input: unknown): ValidationResult<ContactInput> {
  if (!isRecord(input)) return fail<ContactInput>({}, ["Expected an object"]);

  const allowed = new Set([
    "name", "email", "company", "role", "inquiryType", "message",
    "consentToReply", "website",
  ]);
  const unknownKeys = collectUnknownKeys(input, allowed);
  const errors: Record<string, string[]> = {};
  const formErrors = unknownKeys.length ? [`Unrecognized key(s): ${unknownKeys.join(", ")}`] : [];

  const name = readString(input, "name", errors, { required: true, min: 2, max: 120 });
  const email = readString(input, "email", errors, { required: true, max: 254 });
  if (email && !EMAIL_PATTERN.test(email)) errors.email = ["Invalid email"];
  const company = readString(input, "company", errors, { max: 160 });
  const role = readString(input, "role", errors, { max: 120 });
  const message = readString(input, "message", errors, { required: true, min: 10, max: 5000 });
  const inquiryType = input.inquiryType;
  const allowedTypes = ["product", "security", "partnership", "privacy", "other"] as const;
  if (!allowedTypes.includes(inquiryType as (typeof allowedTypes)[number])) {
    errors.inquiryType = ["Invalid enum value"];
  }
  const consentToReply = readConsent(input, errors);
  const website = readHoneypot(input, errors);

  if (formErrors.length || Object.keys(errors).length) return fail<ContactInput>(errors, formErrors);
  return {
    success: true,
    data: {
      name, email, company, role,
      inquiryType: inquiryType as ContactInput["inquiryType"],
      message, consentToReply, website,
    },
  };
}

export function validateEarlyAccess(input: unknown): ValidationResult<EarlyAccessInput> {
  if (!isRecord(input)) return fail<EarlyAccessInput>({}, ["Expected an object"]);

  const allowed = new Set([
    "name", "email", "company", "role", "teamSize", "useCase",
    "workflow", "consentToReply", "website",
  ]);
  const unknownKeys = collectUnknownKeys(input, allowed);
  const errors: Record<string, string[]> = {};
  const formErrors = unknownKeys.length ? [`Unrecognized key(s): ${unknownKeys.join(", ")}`] : [];

  const name = readString(input, "name", errors, { required: true, min: 2, max: 120 });
  const email = readString(input, "email", errors, { required: true, max: 254 });
  if (email && !EMAIL_PATTERN.test(email)) errors.email = ["Invalid email"];
  const company = readString(input, "company", errors, { required: true, min: 2, max: 160 });
  const role = readString(input, "role", errors, { max: 120 });
  const useCase = readString(input, "useCase", errors, { required: true, min: 20, max: 3000 });
  const workflow = readString(input, "workflow", errors, { max: 2000 });
  const teamSize = input.teamSize;
  const allowedSizes = ["1", "2-5", "6-20", "21-50", "51-200", "200+"] as const;
  if (!allowedSizes.includes(teamSize as (typeof allowedSizes)[number])) {
    errors.teamSize = ["Invalid enum value"];
  }
  const consentToReply = readConsent(input, errors);
  const website = readHoneypot(input, errors);

  if (formErrors.length || Object.keys(errors).length) return fail<EarlyAccessInput>(errors, formErrors);
  return {
    success: true,
    data: {
      name, email, company, role,
      teamSize: teamSize as EarlyAccessInput["teamSize"],
      useCase, workflow, consentToReply, website,
    },
  };
}

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseProperties } from "@/lib/properties";

export type ContactInfo = {
  linkedinUrl: string;
  email: string;
  phone: string;
};

export const CONTACT_PROPERTIES_PATH = join(
  process.cwd(),
  "config",
  "contact.properties",
);

export function contactFromProperties(
  props: Record<string, string>,
): ContactInfo {
  return {
    linkedinUrl: props["linkedin.url"] ?? "",
    email: props["contact.email"] ?? "",
    phone: props["contact.phone"] ?? "",
  };
}

export function loadContact(): ContactInfo {
  const source = readFileSync(CONTACT_PROPERTIES_PATH, "utf8");
  return contactFromProperties(parseProperties(source));
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function mailtoHref(email: string) {
  return `mailto:${email}`;
}

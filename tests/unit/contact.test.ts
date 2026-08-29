import { describe, expect, it } from "vitest";
import {
  contactFromProperties,
  loadContact,
  mailtoHref,
  telHref,
} from "@/lib/contact";

describe("contactFromProperties", () => {
  it("reads the contact contract from parsed properties", () => {
    // Arrange
    const props = {
      "linkedin.url": "https://www.linkedin.com/in/facundokrens",
      "contact.email": "facundokrens@outlook.com",
      "contact.phone": "+54 11 2478 9582",
    };

    // Act
    const contact = contactFromProperties(props);

    // Assert
    expect(contact).toEqual({
      linkedinUrl: "https://www.linkedin.com/in/facundokrens",
      email: "facundokrens@outlook.com",
      phone: "+54 11 2478 9582",
    });
  });

  it("defaults missing keys to empty strings", () => {
    // Arrange
    const props = {};

    // Act
    const contact = contactFromProperties(props);

    // Assert
    expect(contact).toEqual({
      linkedinUrl: "",
      email: "",
      phone: "",
    });
  });
});

describe("loadContact", () => {
  it("loads the committed contact.properties file", () => {
    // Arrange / Act
    const contact = loadContact();

    // Assert
    expect(contact.email).toBe("facundokrens@outlook.com");
    expect(contact.phone).toBe("+54 11 2478 9582");
    expect(contact.linkedinUrl).toMatch(/^https:\/\/(www\.)?linkedin\.com\//);
  });
});

describe("contact hrefs", () => {
  it("builds a tel href without spaces", () => {
    // Arrange
    const phone = "+54 11 2478 9582";

    // Act
    const href = telHref(phone);

    // Assert
    expect(href).toBe("tel:+541124789582");
  });

  it("builds a mailto href", () => {
    // Arrange
    const email = "facundokrens@outlook.com";

    // Act
    const href = mailtoHref(email);

    // Assert
    expect(href).toBe("mailto:facundokrens@outlook.com");
  });
});

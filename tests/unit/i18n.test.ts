import { describe, expect, it } from "vitest";
import { copy, isLocale, messages, numberLocale } from "@/lib/i18n";

describe("isLocale", () => {
  it("accepts es and en only", () => {
    // Arrange
    const values = ["es", "en", "pt", "", undefined];

    // Act
    const accepted = values.filter((value) => isLocale(value));

    // Assert
    expect(accepted).toEqual(["es", "en"]);
  });
});

describe("copy", () => {
  it("returns the Spanish dictionary for es", () => {
    // Arrange
    const locale = "es" as const;

    // Act
    const t = copy(locale);

    // Assert
    expect(t).toBe(messages.es);
    expect(t.sql.kicker).toContain("Ejercicio 1");
    expect(t.apis.kicker).toContain("Ejercicio 2");
    expect(t.tech.kicker).toContain("Ejercicio 3");
    expect(t.processesI.kicker).toContain("Ejercicio 4");
    expect(t.processesII.kicker).toContain("Ejercicio 5");
    expect(t.apis.items).toHaveLength(3);
    expect(t.apis.items[1].a).toMatch(/no asocia las compras/i);
    expect(t.apis.items[2].a).toMatch(/Banco Boquita/);
    expect(t.processesI.items).toHaveLength(5);
    expect(t.processesI.items[0].a).toMatch(/entidad externa/i);
    expect(t.processesI.items[1].a).toMatch(/usuario final/i);
    expect(t.processesI.items[2].a).toMatch(/origen de sus fondos/i);
    expect(t.processesI.items[3].a).toMatch(/tipo de documento/i);
    expect(t.processesI.items[4].a).toMatch(/empleo informal/i);
    expect(t.contact.cta).toBeTruthy();
    expect(t.contact.role).toBeTruthy();
    expect(t.contact.deck).toBeTruthy();
    expect(t.nav.print).toBe("Imprimir");
    expect(t.sql.blocks).toHaveLength(3);
    expect(t.sql.intro).toMatch(/no materializo/i);
    expect(t.sql.queryLabel).toBe("Consulta");
    expect(t.tech.ticket.from).toBe("Facundo Krens");
    expect(t.tech.ticket.to).toBe("TECH");
    expect(t.tech.ticket.client).toBe("Banco Boquita");
    expect(t.tech.ticket.letterBefore).toMatch(
      /^Estimado equipo de Tech,\n\nBuen día/,
    );
    expect(t.tech.ticket.letterBefore).toMatch(/fechaFin no incluye/);
    expect(t.tech.ticket.letterBefore).not.toMatch(/grafico/i);
    expect(t.tech.ticket.letterAfter).toMatch(/idempotente/i);
    expect(t.tech.ticket.letterAfter).toMatch(/20\/03\/2020/);
    expect(t.tech.ticket.letterAfter).toMatch(
      /Saludos cordiales,\nFacundo Krens\./,
    );
    expect(t.challenge.title).toMatch(/primero el objetivo/i);
    expect(t.challenge.body).toMatch(/caso real/i);
    expect(t.challenge.body).not.toMatch(/pdf/i);
    expect(t.challenge.items).toHaveLength(5);
    expect(t.challenge.items[4].href).toBe("#procesos-2");
    expect(t).not.toHaveProperty("communication");
  });

  it("returns the English dictionary for en", () => {
    // Arrange
    const locale = "en" as const;

    // Act
    const t = copy(locale);

    // Assert
    expect(t).toBe(messages.en);
    expect(t.sql.kicker).toContain("Exercise 1");
    expect(t.apis.kicker).toContain("Exercise 2");
    expect(t.tech.kicker).toContain("Exercise 3");
    expect(t.processesI.kicker).toContain("Exercise 4");
    expect(t.processesII.kicker).toContain("Exercise 5");
    expect(t.contact.cta).toBeTruthy();
    expect(t.contact.role).toBeTruthy();
    expect(t.contact.deck).toBeTruthy();
    expect(t.nav.print).toBe("Print");
    expect(t.sql.blocks).toHaveLength(3);
    expect(t.sql.intro).toMatch(/do not materialize/i);
    expect(t.sql.queryLabel).toBe("Query");
    expect(t.apis.items[1].a).toMatch(/does not tie purchases/i);
    expect(t.apis.items[2].a).toMatch(/Banco Boquita/);
    expect(t.tech.ticket.from).toBe("Facundo Krens");
    expect(t.tech.ticket.letterBefore).toMatch(/^Dear Tech team,\n\nGood morning/);
    expect(t.tech.ticket.letterAfter).toMatch(/idempotent/i);
    expect(t.tech.ticket.letterAfter).toMatch(/20\/03\/2020/);
    expect(t.challenge.title).toMatch(/objective first/i);
    expect(t.challenge.body).toMatch(/real case/i);
    expect(t.challenge.body).not.toMatch(/pdf/i);
    expect(t.challenge.items).toHaveLength(5);
    expect(t.processesI.items[0].a).toMatch(/external entity/i);
    expect(t.processesI.items[2].a).toMatch(/origin of their funds/i);
    expect(t.processesI.items[4].a).toMatch(/informal employment/i);
    expect(t).not.toHaveProperty("communication");
  });
});

describe("database error copy", () => {
  it("keeps Spanish and English errors free of vendor jargon", () => {
    // Arrange
    const es = copy("es").sql;
    const en = copy("en").sql;
    const jargon = /schema cache|pgrst|NEXT_PUBLIC_/i;

    // Act
    const snippets = [
      es.errorTitle,
      es.errorMissingCredentials,
      es.errorUnavailable,
      en.errorTitle,
      en.errorMissingCredentials,
      en.errorUnavailable,
    ];

    // Assert
    expect(es.errorTitle).toMatch(/base de datos/i);
    expect(en.errorTitle).toMatch(/database/i);
    for (const snippet of snippets) {
      expect(snippet.length).toBeGreaterThan(10);
      expect(snippet).not.toMatch(jargon);
    }
  });
});

describe("numberLocale", () => {
  it("maps es to es-AR and en to en-US", () => {
    // Arrange
    const es = "es" as const;
    const en = "en" as const;

    // Act
    const esTag = numberLocale(es);
    const enTag = numberLocale(en);

    // Assert
    expect(esTag).toBe("es-AR");
    expect(enTag).toBe("en-US");
  });
});

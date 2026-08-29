export const NAV_SECTION_IDS = [
  "sql",
  "apis",
  "tech",
  "procesos-1",
  "contact",
] as const;

export type NavSectionId = (typeof NAV_SECTION_IDS)[number];

export type SectionAnchor = {
  id: string;
  top: number;
};

export type ViewportProbe = {
  scrollY: number;
  offset: number;
  height: number;
  documentHeight: number;
};

const NAV_SECTION_ID_SET = new Set<string>(NAV_SECTION_IDS);

export function sectionIdFromHash(hash: string): NavSectionId | null {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  return NAV_SECTION_ID_SET.has(id) ? (id as NavSectionId) : null;
}

export function resolveActiveSection(
  sections: readonly SectionAnchor[],
  viewport: ViewportProbe,
): string | null {
  if (sections.length === 0) return null;

  const ordered = [...sections].sort((a, b) => a.top - b.top);
  const last = ordered[ordered.length - 1];

  if (viewport.scrollY + viewport.height >= viewport.documentHeight - 1) {
    return last.id;
  }

  const probe = viewport.scrollY + viewport.offset;
  let active: string | null = null;
  for (const section of ordered) {
    if (section.top <= probe) active = section.id;
    else break;
  }
  return active;
}

export const SECTIONS = [
  { id: 'strategie-marque', label: 'Stratégie de marque', order: 1 },
  { id: 'logo-identite', label: 'Logo & identité', order: 2 },
  { id: 'palette-couleurs', label: 'Palette chromatique', order: 3 },
  { id: 'typographie', label: 'Typographie', order: 4 },
  { id: 'univers-visuel', label: 'Univers visuel', order: 5 },
  { id: 'tonalite-communication', label: 'Tonalité & communication', order: 6 },
  { id: 'structures-organisation', label: 'Structures organisationnelles', order: 7 },
];

const SECTION_MAP = Object.fromEntries(SECTIONS.map((section) => [section.id, section]));

export function getSectionLabel(sectionId) {
  return SECTION_MAP[sectionId]?.label ?? 'Autre';
}

export function getOrderedSectionsWithCounts(cards) {
  const counts = cards.reduce((acc, card) => {
    const id = card.section || 'autre';
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  return SECTIONS
    .filter((section) => counts[section.id] > 0)
    .map((section) => ({
      ...section,
      count: counts[section.id],
    }));
}

export type CvLayout = 'classic' | 'modern' | 'minimal';

// How a section's content is entered and drawn:
// text = a paragraph, list = one bullet per line, entries = dated items with details,
// tags = short words, pairs = label and value rows
export type CvSectionKind = 'text' | 'list' | 'entries' | 'tags' | 'pairs';

export type CvTextSize = 'small' | 'normal' | 'large';

// the two columns of the Modern layout
export type CvColumn = 'side' | 'main';

export interface CvEntry {
  title: string;
  subtitle: string;
  period: string;
  // one point per line
  details: string;
}

export interface CvPair {
  label: string;
  value: string;
}

export interface CvSection {
  key: string;
  // which ready-made section this started as; it only decides the field labels in the form
  preset: string;
  title: string;
  kind: CvSectionKind;
  // Modern layout only: the column the section was dragged to. Empty means the usual place for its kind.
  column: CvColumn | '';
  // the paragraph of a text section, or the lines of a list section
  text: string;
  entries: CvEntry[];
  tags: string[];
  pairs: CvPair[];
}

export interface CvData {
  layout: CvLayout;
  accent: string;
  textSize: CvTextSize;
  fullName: string;
  jobTitle: string;
  // a small square JPEG data URL; it never leaves the browser
  photo: string;
  contacts: CvPair[];
  sections: CvSection[];
}

export const CV_LAYOUTS: {
  id: CvLayout;
  name: string;
  description: string;
}[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'One column, centred heading',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Coloured side panel with photo',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, with labels on the left',
  },
];

export const CV_ACCENTS = [
  '#1e3a8a',
  '#0f766e',
  '#9f1239',
  '#b45309',
  '#374151',
];

export const CV_TEXT_SIZES: { id: CvTextSize; name: string; scale: number }[] =
  [
    { id: 'small', name: 'Small', scale: 0.92 },
    { id: 'normal', name: 'Normal', scale: 1 },
    { id: 'large', name: 'Large', scale: 1.08 },
  ];

interface EntryLabels {
  item: string;
  title: string;
  subtitle: string;
  period: string;
  details: string;
}

const genericEntryLabels: EntryLabels = {
  item: 'Item',
  title: 'Title',
  subtitle: 'Subtitle',
  period: 'Dates',
  details: 'Details (one per line)',
};

interface SectionPreset {
  preset: string;
  title: string;
  kind: CvSectionKind;
  // shown in the "Add section" menu
  menuLabel?: string;
  entryLabels?: EntryLabels;
  // rows a new pairs section starts with
  pairLabels?: string[];
  text?: string;
}

// The sections offered in the "Add section" menu. Any of them can be renamed, and the custom
// ones at the end cover anything not listed.
export const CV_SECTION_PRESETS: SectionPreset[] = [
  { preset: 'profile', title: 'Profile', kind: 'text' },
  { preset: 'objective', title: 'Career Objective', kind: 'text' },
  {
    preset: 'experience',
    title: 'Work Experience',
    kind: 'entries',
    entryLabels: {
      item: 'Job',
      title: 'Job title',
      subtitle: 'Company and city',
      period: 'Dates',
      details: 'Duties (one per line)',
    },
  },
  {
    preset: 'education',
    title: 'Education',
    kind: 'entries',
    entryLabels: {
      item: 'Education',
      title: 'Qualification',
      subtitle: 'School or university',
      period: 'Years',
      details: 'Details (optional, one per line)',
    },
  },
  { preset: 'skills', title: 'Skills', kind: 'tags' },
  { preset: 'languages', title: 'Languages', kind: 'tags' },
  {
    preset: 'certifications',
    title: 'Certifications & Courses',
    kind: 'entries',
    entryLabels: {
      item: 'Certificate',
      title: 'Certificate or course',
      subtitle: 'Issued by',
      period: 'Year',
      details: 'Details (optional, one per line)',
    },
  },
  {
    preset: 'projects',
    title: 'Projects',
    kind: 'entries',
    entryLabels: {
      item: 'Project',
      title: 'Project name',
      subtitle: 'Role or client',
      period: 'Dates',
      details: 'What was done (one per line)',
    },
  },
  { preset: 'achievements', title: 'Achievements', kind: 'list' },
  {
    preset: 'references',
    title: 'References',
    kind: 'entries',
    entryLabels: {
      item: 'Reference',
      title: 'Name',
      subtitle: 'Position and company',
      period: 'Phone or email',
      details: 'Notes (optional, one per line)',
    },
  },
  { preset: 'hobbies', title: 'Hobbies & Interests', kind: 'tags' },
  {
    preset: 'personal',
    title: 'Personal Details',
    kind: 'pairs',
    pairLabels: [
      'Nationality',
      'Date of birth',
      'Gender',
      'Marital status',
      'Visa status',
      'Driving licence',
    ],
  },
  {
    preset: 'declaration',
    title: 'Declaration',
    kind: 'text',
    text: 'I hereby declare that the information given above is true and correct to the best of my knowledge.',
  },
  {
    preset: 'custom-text',
    title: 'Custom Section',
    kind: 'text',
    menuLabel: 'Custom: paragraph',
  },
  {
    preset: 'custom-list',
    title: 'Custom Section',
    kind: 'list',
    menuLabel: 'Custom: bullet list',
  },
  {
    preset: 'custom-entries',
    title: 'Custom Section',
    kind: 'entries',
    menuLabel: 'Custom: dated items',
  },
  {
    preset: 'custom-tags',
    title: 'Custom Section',
    kind: 'tags',
    menuLabel: 'Custom: short words',
  },
  {
    preset: 'custom-pairs',
    title: 'Custom Section',
    kind: 'pairs',
    menuLabel: 'Custom: label and value',
  },
];

export const entryLabelsFor = (preset: string): EntryLabels =>
  CV_SECTION_PRESETS.find((option) => option.preset === preset)?.entryLabels ??
  genericEntryLabels;

export const emptyEntry: CvEntry = {
  title: '',
  subtitle: '',
  period: '',
  details: '',
};

const newKey = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const newSection = (preset: string): CvSection => {
  const option =
    CV_SECTION_PRESETS.find((candidate) => candidate.preset === preset) ??
    CV_SECTION_PRESETS[0];
  return {
    key: newKey(),
    preset: option.preset,
    title: option.title,
    kind: option.kind,
    column: '',
    text: option.text ?? '',
    entries: option.kind === 'entries' ? [{ ...emptyEntry }] : [],
    tags: [],
    pairs:
      option.kind === 'pairs'
        ? (option.pairLabels ?? ['']).map((label) => ({ label, value: '' }))
        : [],
  };
};

// Where a section sits in the Modern layout: short facts go in the side panel and running text
// in the main column, unless it has been dragged to the other one.
export const sectionColumn = (section: CvSection): CvColumn =>
  section.column ||
  (section.kind === 'tags' || section.kind === 'pairs' ? 'side' : 'main');

// The sections with one of them moved next to `targetKey` (before or after it), or to the end
// when there is no target. `column` also moves it to that column of the Modern layout.
export const moveSection = (
  sections: CvSection[],
  key: string,
  targetKey: string | null,
  after: boolean,
  column?: CvColumn,
): CvSection[] => {
  const dragged = sections.find((current) => current.key === key);
  if (!dragged || key === targetKey) return sections;
  const rest = sections.filter((current) => current.key !== key);
  const targetIndex = targetKey
    ? rest.findIndex((current) => current.key === targetKey)
    : -1;
  const index =
    targetIndex === -1 ? rest.length : targetIndex + (after ? 1 : 0);
  return [
    ...rest.slice(0, index),
    column ? { ...dragged, column } : dragged,
    ...rest.slice(index),
  ];
};

// whether a section has anything to show; empty ones are left off the CV
export const sectionHasContent = (section: CvSection) => {
  if (section.kind === 'text' || section.kind === 'list') {
    return !!section.text.trim();
  }
  if (section.kind === 'entries') {
    return section.entries.some(
      (entry) => entry.title || entry.subtitle || entry.period || entry.details,
    );
  }
  if (section.kind === 'tags') return section.tags.length > 0;
  return section.pairs.some((pair) => pair.value.trim());
};

const section = (preset: string, content: Partial<CvSection>): CvSection => ({
  ...newSection(preset),
  key: preset,
  ...content,
});

const pairs = (rows: [string, string][]): CvPair[] =>
  rows.map(([label, value]) => ({ label, value }));

// what a built-in layout starts with, so it shows how a filled-in CV looks
export const sampleCv: CvData = {
  layout: 'classic',
  accent: CV_ACCENTS[0],
  textSize: 'normal',
  fullName: 'Mohammed Rashid',
  jobTitle: 'Sales Executive',
  photo: '',
  contacts: pairs([
    ['Phone', '+971 50 123 4567'],
    ['Email', 'mohammed.rashid@example.com'],
    ['Address', 'Abu Dhabi, United Arab Emirates'],
  ]),
  sections: [
    section('profile', {
      text: 'Sales executive with 5 years of experience in retail and customer service in the UAE. Good at building customer relationships, meeting monthly targets and handling day-to-day store operations.',
    }),
    section('experience', {
      entries: [
        {
          title: 'Sales Executive',
          subtitle: 'Gulf Trading LLC, Abu Dhabi',
          period: 'Mar 2021 - Present',
          details:
            'Serve walk-in and corporate customers and follow up on enquiries\nPrepare quotations and invoices and collect payments\nMet or passed the monthly sales target in most months',
        },
        {
          title: 'Customer Service Assistant',
          subtitle: 'City Hypermarket, Dubai',
          period: 'Jun 2019 - Feb 2021',
          details:
            'Handled customer questions, returns and complaints\nKept the shelves stocked and the price labels up to date',
        },
      ],
    }),
    section('education', {
      entries: [
        {
          title: 'Bachelor of Commerce',
          subtitle: 'University of Calicut, India',
          period: '2016 - 2019',
          details: '',
        },
      ],
    }),
    section('skills', {
      tags: [
        'Customer service',
        'Sales and negotiation',
        'MS Office',
        'Cash handling',
        'Teamwork',
      ],
    }),
    section('languages', {
      tags: ['English', 'Arabic', 'Hindi', 'Malayalam'],
    }),
    section('personal', {
      pairs: pairs([
        ['Nationality', 'Indian'],
        ['Date of birth', '12 May 1997'],
        ['Gender', 'Male'],
        ['Marital status', 'Single'],
        ['Visa status', 'Employment visa'],
        ['Driving licence', 'UAE light vehicle'],
      ]),
    }),
  ],
};

// The same CV with every value emptied. Sections, their titles and the row labels are kept,
// so the structure stays ready for the next customer.
export const clearedCv = (cv: CvData): CvData => ({
  ...cv,
  fullName: '',
  jobTitle: '',
  photo: '',
  contacts: cv.contacts.map((contact) => ({ ...contact, value: '' })),
  sections: cv.sections.map((current) => ({
    ...current,
    text: '',
    entries: current.kind === 'entries' ? [{ ...emptyEntry }] : [],
    tags: [],
    pairs: current.pairs.map((pair) => ({ ...pair, value: '' })),
  })),
});

const text = (value: any) => (typeof value === 'string' ? value : '');

const pairList = (value: any): CvPair[] =>
  (Array.isArray(value) ? value : []).map((pair: any) => ({
    label: text(pair?.label),
    value: text(pair?.value),
  }));

const KINDS: CvSectionKind[] = ['text', 'list', 'entries', 'tags', 'pairs'];

// A CV opened from a saved template: the template's sections and text, with no photo
export const cvFromTemplate = (template: any): CvData => ({
  layout: CV_LAYOUTS.some((layout) => layout.id === template?.layout)
    ? template.layout
    : 'classic',
  accent: text(template?.accent) || CV_ACCENTS[0],
  textSize: CV_TEXT_SIZES.some((size) => size.id === template?.textSize)
    ? template.textSize
    : 'normal',
  fullName: text(template?.fullName),
  jobTitle: text(template?.jobTitle),
  photo: '',
  contacts: pairList(template?.contacts),
  sections: (Array.isArray(template?.sections) ? template.sections : [])
    .filter((saved: any) => KINDS.includes(saved?.kind))
    .map((saved: any) => ({
      key: text(saved.key) || newKey(),
      preset: text(saved.preset),
      title: text(saved.title),
      kind: saved.kind,
      column:
        saved.column === 'side' || saved.column === 'main' ? saved.column : '',
      text: text(saved.text),
      entries: (Array.isArray(saved.entries) ? saved.entries : []).map(
        (entry: any) => ({
          title: text(entry?.title),
          subtitle: text(entry?.subtitle),
          period: text(entry?.period),
          details: text(entry?.details),
        }),
      ),
      tags: (Array.isArray(saved.tags) ? saved.tags : []).filter(
        (tag: any) => typeof tag === 'string',
      ),
      pairs: pairList(saved.pairs),
    })),
});

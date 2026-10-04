import React, { createContext, useContext, useState } from 'react';
import {
  CV_TEXT_SIZES,
  CvColumn,
  CvData,
  CvEntry,
  CvPair,
  CvSection,
  sectionColumn,
  sectionHasContent,
} from './types';

// A4 at 96 dpi. The height is a hair under a full page so rounding never adds a blank second page.
export const CV_PAGE_WIDTH = 794;
const CV_PAGE_HEIGHT = 1122;

// Every element marked with this attribute is kept whole when the PDF is split into pages
const block = { 'data-cv-block': true };

// Called when a section is dropped: next to `targetKey` (before or after it), or at the end of
// `column` when it was dropped on empty space.
export type MoveSectionHandler = (
  key: string,
  targetKey: string | null,
  after: boolean,
  column?: CvColumn,
) => void;

interface DragState {
  move: MoveSectionHandler;
  dragging: string | null;
  setDragging: (key: string | null) => void;
  // where the dragged section would land: a section's key, or a column's name for empty space
  over: { key: string; after: boolean } | null;
  setOver: (over: { key: string; after: boolean } | null) => void;
}

// Only the editor's preview provides this. Without it (the print copy, the template cards)
// the CV is a plain page with nothing draggable.
const DragContext = createContext<DragState | null>(null);

const DROP_MARK = '#f59e0b';

// One section of the CV. In the editor's preview it can be picked up and dropped on another one.
const SectionShell = ({
  section,
  column,
  isBlock = false,
  style,
  children,
}: {
  section: CvSection;
  column?: CvColumn;
  isBlock?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) => {
  const drag = useContext(DragContext);
  const blockProps = isBlock ? block : {};
  if (!drag) {
    return (
      <div {...blockProps} style={style}>
        {children}
      </div>
    );
  }

  const isDragged = drag.dragging === section.key;
  const mark =
    drag.dragging && !isDragged && drag.over?.key === section.key
      ? drag.over.after
        ? `0 3px 0 ${DROP_MARK}`
        : `0 -3px 0 ${DROP_MARK}`
      : undefined;

  return (
    <div
      {...blockProps}
      draggable
      title="Drag to move this section"
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', section.key);
        drag.setDragging(section.key);
      }}
      onDragEnd={() => {
        drag.setDragging(null);
        drag.setOver(null);
      }}
      onDragOver={(event) => {
        if (!drag.dragging) return;
        event.preventDefault();
        event.stopPropagation();
        const box = event.currentTarget.getBoundingClientRect();
        const after = event.clientY > box.top + box.height / 2;
        if (drag.over?.key !== section.key || drag.over.after !== after) {
          drag.setOver({ key: section.key, after });
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (drag.dragging && drag.over) {
          drag.move(drag.dragging, section.key, drag.over.after, column);
        }
        drag.setDragging(null);
        drag.setOver(null);
      }}
      style={{
        ...style,
        cursor: 'grab',
        opacity: isDragged ? 0.4 : 1,
        boxShadow: mark,
      }}
    >
      {children}
    </div>
  );
};

// Lets a section be dropped on the empty part of a Modern column, which moves it to the end of that column
const useColumnDrop = (column: CvColumn) => {
  const drag = useContext(DragContext);
  if (!drag) return {};
  return {
    onDragOver: (event: React.DragEvent) => {
      if (!drag.dragging) return;
      event.preventDefault();
      if (drag.over?.key !== column) drag.setOver({ key: column, after: true });
    },
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      if (drag.dragging) drag.move(drag.dragging, null, true, column);
      drag.setDragging(null);
      drag.setOver(null);
    },
  };
};

const lines = (text: string) =>
  text
    .split('\n')
    .map((line) => line.replace(/^[\s\-•*]+/, '').trim())
    .filter(Boolean);

const filledEntries = (section: CvSection) =>
  section.entries.filter(
    (entry) => entry.title || entry.subtitle || entry.period || entry.details,
  );

const filledPairs = (section: CvSection) =>
  section.pairs.filter((pair) => pair.value.trim());

const visibleSections = (cv: CvData) => cv.sections.filter(sectionHasContent);

const filledContacts = (cv: CvData) =>
  cv.contacts.filter((contact) => contact.value.trim());

// every font size on the page goes through this, so the text size setting scales the whole CV
const sizer = (cv: CvData) => {
  const scale =
    CV_TEXT_SIZES.find((size) => size.id === cv.textSize)?.scale ?? 1;
  return (px: number) => Math.round(px * scale * 10) / 10;
};

const page = (fs: (px: number) => number): React.CSSProperties => ({
  width: CV_PAGE_WIDTH,
  minHeight: CV_PAGE_HEIGHT,
  boxSizing: 'border-box',
  background: '#ffffff',
  color: '#1f2937',
  fontSize: fs(13.5),
  lineHeight: 1.5,
  textAlign: 'left',
  wordBreak: 'break-word',
  WebkitPrintColorAdjust: 'exact',
  printColorAdjust: 'exact',
});

// The dot is typed as text instead of a list marker, because the PDF renderer draws markers out of line
const bulletList: React.CSSProperties = {
  margin: '4px 0 0',
  padding: 0,
  listStyleType: 'none',
};

const BulletItem = ({ children }: { children: React.ReactNode }) => (
  <li style={{ display: 'flex', gap: 8, paddingLeft: 4 }}>
    <span>•</span>
    <span style={{ flex: 1, minWidth: 0 }}>{children}</span>
  </li>
);

const Bullets = ({
  items,
  style,
}: {
  items: string[];
  style?: React.CSSProperties;
}) => {
  if (items.length === 0) return null;
  return (
    <ul style={{ ...bulletList, ...style }}>
      {items.map((line, index) => (
        <BulletItem key={index}>{line}</BulletItem>
      ))}
    </ul>
  );
};

// label and value rows laid out two to a line
const PairGrid = ({
  pairs,
  labelStyle,
}: {
  pairs: CvPair[];
  labelStyle: React.CSSProperties;
}) => (
  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
    {pairs.map((pair, index) => (
      <div key={index} style={{ width: '50%', padding: '2px 0' }}>
        {pair.label && <span style={labelStyle}>{pair.label}: </span>}
        {pair.value}
      </div>
    ))}
  </div>
);

const Classic = ({ cv }: { cv: CvData }) => {
  const fs = sizer(cv);
  const contacts = filledContacts(cv);

  const heading: React.CSSProperties = {
    margin: '20px 0 8px',
    paddingBottom: 8,
    borderBottom: '1px solid #d1d5db',
    color: cv.accent,
    fontSize: fs(13),
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  };
  const meta: React.CSSProperties = { fontSize: fs(12.5), color: '#4b5563' };

  const entry = (item: CvEntry) => (
    <>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}
      >
        <div style={{ fontWeight: 700, color: '#111827' }}>{item.title}</div>
        <div style={{ ...meta, whiteSpace: 'nowrap' }}>{item.period}</div>
      </div>
      {item.subtitle && (
        <div style={{ fontStyle: 'italic', color: '#4b5563' }}>
          {item.subtitle}
        </div>
      )}
      <Bullets items={lines(item.details)} />
    </>
  );

  const section = (current: CvSection) => {
    const title = <div style={heading}>{current.title}</div>;
    if (current.kind === 'entries') {
      // the heading travels with the first item, so it is never left alone at the foot of a page
      return (
        <SectionShell key={current.key} section={current}>
          {filledEntries(current).map((item, index) => (
            <div key={index} {...block} style={{ paddingBottom: 10 }}>
              {index === 0 && title}
              {entry(item)}
            </div>
          ))}
        </SectionShell>
      );
    }
    return (
      <SectionShell key={current.key} section={current} isBlock>
        {title}
        {current.kind === 'text' && (
          <div style={{ whiteSpace: 'pre-wrap' }}>{current.text}</div>
        )}
        {current.kind === 'list' && (
          <Bullets items={lines(current.text)} style={{ margin: 0 }} />
        )}
        {current.kind === 'tags' && <div>{current.tags.join('  •  ')}</div>}
        {current.kind === 'pairs' && (
          <PairGrid
            pairs={filledPairs(current)}
            labelStyle={{ fontWeight: 600, color: '#111827' }}
          />
        )}
      </SectionShell>
    );
  };

  return (
    <div style={{ ...page(fs), padding: '48px 56px' }}>
      <div
        {...block}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        {cv.photo && (
          <img
            src={cv.photo}
            alt=""
            style={{ width: 96, height: 96, borderRadius: 8 }}
          />
        )}
        <div style={{ textAlign: cv.photo ? 'left' : 'center' }}>
          <div
            style={{
              color: cv.accent,
              fontSize: fs(30),
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {cv.fullName || 'Full name'}
          </div>
          {cv.jobTitle && (
            <div style={{ marginTop: 2, fontSize: fs(16), color: '#4b5563' }}>
              {cv.jobTitle}
            </div>
          )}
          {contacts.length > 0 && (
            <div style={{ ...meta, marginTop: 6 }}>
              {contacts.map((contact) => contact.value).join('  |  ')}
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 18, height: 2, background: cv.accent }} />
      {visibleSections(cv).map(section)}
    </div>
  );
};

const Modern = ({ cv }: { cv: CvData }) => {
  const fs = sizer(cv);
  const contacts = filledContacts(cv);
  const sections = visibleSections(cv);
  const side = sections.filter((current) => sectionColumn(current) === 'side');
  const main = sections.filter((current) => sectionColumn(current) === 'main');
  const sideDrop = useColumnDrop('side');
  const mainDrop = useColumnDrop('main');

  const sideHeading: React.CSSProperties = {
    margin: '24px 0 10px',
    paddingBottom: 8,
    borderBottom: '1px solid rgba(255,255,255,0.4)',
    fontSize: fs(12.5),
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  };
  const sideLabel: React.CSSProperties = {
    fontSize: fs(11),
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.75,
  };
  const heading: React.CSSProperties = {
    margin: '22px 0 10px',
    color: cv.accent,
    fontSize: fs(14),
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  };

  const sidePairs = (rows: CvPair[]) =>
    rows.map((row, index) => (
      <div key={index} style={{ marginBottom: 8 }}>
        {row.label && <div style={sideLabel}>{row.label}</div>}
        <div>{row.value}</div>
      </div>
    ));

  // any kind of section can be dragged into the side panel, so each has a narrow form
  const sideSection = (current: CvSection, first: boolean) => {
    const title = (
      <div style={{ ...sideHeading, marginTop: first ? 0 : 24 }}>
        {current.title}
      </div>
    );
    if (current.kind === 'entries') {
      return (
        <SectionShell key={current.key} section={current} column="side">
          {filledEntries(current).map((item, index) => (
            <div key={index} {...block} style={{ paddingBottom: 10 }}>
              {index === 0 && title}
              <div style={{ fontWeight: 700 }}>{item.title}</div>
              {item.subtitle && <div>{item.subtitle}</div>}
              {item.period && <div style={sideLabel}>{item.period}</div>}
              <Bullets items={lines(item.details)} />
            </div>
          ))}
        </SectionShell>
      );
    }
    return (
      <SectionShell key={current.key} section={current} column="side" isBlock>
        {title}
        {current.kind === 'pairs' && sidePairs(filledPairs(current))}
        {current.kind === 'tags' && (
          <Bullets items={current.tags} style={{ margin: 0 }} />
        )}
        {current.kind === 'list' && (
          <Bullets items={lines(current.text)} style={{ margin: 0 }} />
        )}
        {current.kind === 'text' && (
          <div style={{ whiteSpace: 'pre-wrap' }}>{current.text}</div>
        )}
      </SectionShell>
    );
  };

  const mainSection = (current: CvSection) => {
    const title = <div style={heading}>{current.title}</div>;
    if (current.kind === 'entries') {
      return (
        <SectionShell key={current.key} section={current} column="main">
          {filledEntries(current).map((item, index) => (
            <div key={index} {...block}>
              {index === 0 && title}
              <div
                style={{
                  marginBottom: 14,
                  paddingLeft: 12,
                  borderLeft: `2px solid ${cv.accent}`,
                }}
              >
                <div style={{ fontWeight: 700, color: '#111827' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: fs(12.5), color: '#4b5563' }}>
                  {[item.subtitle, item.period].filter(Boolean).join('  |  ')}
                </div>
                <Bullets items={lines(item.details)} />
              </div>
            </div>
          ))}
        </SectionShell>
      );
    }
    return (
      <SectionShell key={current.key} section={current} column="main" isBlock>
        {title}
        {current.kind === 'text' && (
          <div style={{ whiteSpace: 'pre-wrap' }}>{current.text}</div>
        )}
        {current.kind === 'list' && (
          <Bullets items={lines(current.text)} style={{ margin: 0 }} />
        )}
        {current.kind === 'tags' && <div>{current.tags.join('  •  ')}</div>}
        {current.kind === 'pairs' && (
          <PairGrid
            pairs={filledPairs(current)}
            labelStyle={{ fontWeight: 600, color: '#111827' }}
          />
        )}
      </SectionShell>
    );
  };

  return (
    <div style={{ ...page(fs), display: 'flex' }}>
      <div
        {...sideDrop}
        style={{
          width: 250,
          flexShrink: 0,
          boxSizing: 'border-box',
          padding: '40px 24px',
          background: cv.accent,
          color: '#ffffff',
          fontSize: fs(12.5),
        }}
      >
        {cv.photo && (
          <div {...block} style={{ textAlign: 'center', paddingBottom: 24 }}>
            <img
              src={cv.photo}
              alt=""
              style={{
                display: 'inline-block',
                width: 140,
                height: 140,
                borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.7)',
              }}
            />
          </div>
        )}

        {contacts.length > 0 && (
          <div {...block}>
            <div style={{ ...sideHeading, marginTop: 0 }}>Contact</div>
            {sidePairs(contacts)}
          </div>
        )}

        {side.map((current, index) =>
          sideSection(current, index === 0 && contacts.length === 0),
        )}
      </div>

      <div {...mainDrop} style={{ flex: 1, minWidth: 0, padding: '40px 36px' }}>
        <div {...block}>
          <div
            style={{
              fontSize: fs(32),
              fontWeight: 700,
              lineHeight: 1.15,
              color: '#111827',
            }}
          >
            {cv.fullName || 'Full name'}
          </div>
          {cv.jobTitle && (
            <div
              style={{
                marginTop: 4,
                fontSize: fs(16),
                fontWeight: 600,
                color: cv.accent,
              }}
            >
              {cv.jobTitle}
            </div>
          )}
        </div>
        {main.map(mainSection)}
      </div>
    </div>
  );
};

const Minimal = ({ cv }: { cv: CvData }) => {
  const fs = sizer(cv);
  const contacts = filledContacts(cv);

  const row: React.CSSProperties = {
    display: 'flex',
    gap: 24,
    padding: '16px 0',
    borderTop: '1px solid #e5e7eb',
  };
  const label: React.CSSProperties = {
    width: 130,
    flexShrink: 0,
    paddingTop: 2,
    color: cv.accent,
    fontSize: fs(11.5),
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  };
  const body: React.CSSProperties = { flex: 1, minWidth: 0 };
  const meta: React.CSSProperties = { fontSize: fs(12.5), color: '#6b7280' };

  const section = (current: CvSection) => {
    if (current.kind === 'entries') {
      const entries = filledEntries(current);
      return (
        <SectionShell key={current.key} section={current} style={row}>
          <div style={label}>{current.title}</div>
          <div style={body}>
            {entries.map((item, index) => (
              <div
                key={index}
                {...block}
                style={{
                  paddingBottom: index < entries.length - 1 ? 14 : 0,
                }}
              >
                <div style={{ fontWeight: 700, color: '#111827' }}>
                  {item.title}
                </div>
                <div style={meta}>
                  {[item.subtitle, item.period].filter(Boolean).join('   ·   ')}
                </div>
                <Bullets items={lines(item.details)} />
              </div>
            ))}
          </div>
        </SectionShell>
      );
    }
    return (
      <SectionShell key={current.key} section={current} isBlock style={row}>
        <div style={label}>{current.title}</div>
        {current.kind === 'text' && (
          <div style={{ ...body, whiteSpace: 'pre-wrap' }}>{current.text}</div>
        )}
        {current.kind === 'list' && (
          <div style={body}>
            <Bullets items={lines(current.text)} style={{ margin: 0 }} />
          </div>
        )}
        {current.kind === 'tags' && (
          <div style={body}>{current.tags.join(', ')}</div>
        )}
        {current.kind === 'pairs' && (
          <div style={body}>
            <PairGrid
              pairs={filledPairs(current)}
              labelStyle={{ color: '#6b7280' }}
            />
          </div>
        )}
      </SectionShell>
    );
  };

  return (
    <div style={{ ...page(fs), padding: '52px 56px' }}>
      <div
        {...block}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          paddingBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: fs(34),
              fontWeight: 300,
              lineHeight: 1.15,
              color: '#111827',
            }}
          >
            {cv.fullName || 'Full name'}
          </div>
          {cv.jobTitle && (
            <div
              style={{
                marginTop: 6,
                fontSize: fs(13),
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: '#6b7280',
              }}
            >
              {cv.jobTitle}
            </div>
          )}
          {contacts.length > 0 && (
            <div
              style={{ marginTop: 10, fontSize: fs(12.5), color: '#4b5563' }}
            >
              {contacts.map((contact) => contact.value).join('   ·   ')}
            </div>
          )}
        </div>
        {cv.photo && (
          <img
            src={cv.photo}
            alt=""
            style={{ width: 96, height: 96, borderRadius: '50%' }}
          />
        )}
      </div>
      {visibleSections(cv).map(section)}
    </div>
  );
};

const Layout = ({ cv }: { cv: CvData }) => {
  if (cv.layout === 'modern') return <Modern cv={cv} />;
  if (cv.layout === 'minimal') return <Minimal cv={cv} />;
  return <Classic cv={cv} />;
};

// With `onMoveSection`, the sections can be dragged to a new place (the editor's preview).
// Without it the CV is a plain page (the print copy and the template cards).
const CvDocument = ({
  cv,
  onMoveSection,
}: {
  cv: CvData;
  onMoveSection?: MoveSectionHandler;
}) => {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<DragState['over']>(null);

  if (!onMoveSection) return <Layout cv={cv} />;
  return (
    <DragContext.Provider
      value={{ move: onMoveSection, dragging, setDragging, over, setOver }}
    >
      <Layout cv={cv} />
    </DragContext.Provider>
  );
};

export default CvDocument;

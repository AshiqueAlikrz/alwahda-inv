import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Dropdown, Input, Modal, Popconfirm, Select } from 'antd';
import { toast } from 'react-toastify';
import {
  IoAdd,
  IoArrowBack,
  IoArrowDown,
  IoArrowUp,
  IoDownloadOutline,
  IoPersonOutline,
  IoPrintOutline,
  IoSaveOutline,
} from 'react-icons/io5';
import { MdDeleteOutline, MdDragIndicator } from 'react-icons/md';
import Card from '../../components/ui/Card';
import Loading from '../../components/Loading';
import {
  useCreateCvTemplateMutation,
  useGetCvTemplatesQuery,
  useUpdateCvTemplateMutation,
} from '../../store/slice/reportSlice';
import { saveElementAsPagedPdf } from '../../utils/pdf';
import CvDocument, { CV_PAGE_WIDTH } from './CvDocument';
import {
  CV_ACCENTS,
  CV_LAYOUTS,
  CV_SECTION_PRESETS,
  CV_TEXT_SIZES,
  CvData,
  CvEntry,
  CvLayout,
  CvPair,
  CvSection,
  clearedCv,
  cvFromTemplate,
  emptyEntry,
  entryLabelsFor,
  moveSection,
  newSection,
  sampleCv,
} from './types';

const PHOTO_SIZE = 400;

// Crops the picked image to a centred square and shrinks it, so it stays light in the PDF
const readPhoto = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const side = Math.min(image.width, image.height);
      const canvas = document.createElement('canvas');
      canvas.width = PHOTO_SIZE;
      canvas.height = PHOTO_SIZE;
      canvas
        .getContext('2d')!
        .drawImage(
          image,
          (image.width - side) / 2,
          (image.height - side) / 2,
          side,
          side,
          0,
          0,
          PHOTO_SIZE,
          PHOTO_SIZE,
        );
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read the image'));
    };
    image.src = url;
  });

// a copy of the list with the item at `index` moved one place up (-1) or down (+1)
const moved = <T,>(list: T[], index: number, step: -1 | 1): T[] => {
  const target = index + step;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
};

const Field = ({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <label className={`block ${className}`}>
    <span className="mb-1.5 block text-sm font-medium text-black dark:text-white">
      {label}
    </span>
    {children}
  </label>
);

// Up, down and delete, used on sections and on the items inside them
const RowActions = ({
  name,
  isFirst,
  isLast,
  onMove,
  onRemove,
  confirmRemove = false,
}: {
  name: string;
  isFirst: boolean;
  isLast: boolean;
  onMove: (step: -1 | 1) => void;
  onRemove: () => void;
  confirmRemove?: boolean;
}) => {
  const remove = (
    <Button
      type="text"
      danger
      size="small"
      aria-label={`Remove ${name}`}
      icon={<MdDeleteOutline size={18} />}
      onClick={confirmRemove ? undefined : onRemove}
    />
  );
  return (
    <div className="flex shrink-0 items-center">
      <Button
        type="text"
        size="small"
        disabled={isFirst}
        aria-label={`Move ${name} up`}
        icon={<IoArrowUp size={16} />}
        onClick={() => onMove(-1)}
      />
      <Button
        type="text"
        size="small"
        disabled={isLast}
        aria-label={`Move ${name} down`}
        icon={<IoArrowDown size={16} />}
        onClick={() => onMove(1)}
      />
      {confirmRemove ? (
        <Popconfirm
          title={`Remove ${name}?`}
          description="Everything typed in it is removed too."
          okText="Remove"
          okButtonProps={{ danger: true }}
          onConfirm={onRemove}
        >
          {remove}
        </Popconfirm>
      ) : (
        remove
      )}
    </div>
  );
};

// Rows of a label and its value, used for the contact details and for "label and value" sections
const PairRows = ({
  name,
  pairs,
  onChange,
}: {
  name: string;
  pairs: CvPair[];
  onChange: (pairs: CvPair[]) => void;
}) => (
  <div className="flex flex-col gap-2">
    {pairs.map((pair, index) => (
      <div key={index} className="flex items-center gap-2">
        <Input
          aria-label={`${name} ${index + 1} label`}
          className="w-2/5"
          placeholder="Label"
          maxLength={60}
          value={pair.label}
          onChange={(e) =>
            onChange(
              pairs.map((row, rowIndex) =>
                rowIndex === index ? { ...row, label: e.target.value } : row,
              ),
            )
          }
        />
        <Input
          aria-label={`${name} ${index + 1} value`}
          placeholder="Value"
          maxLength={200}
          value={pair.value}
          onChange={(e) =>
            onChange(
              pairs.map((row, rowIndex) =>
                rowIndex === index ? { ...row, value: e.target.value } : row,
              ),
            )
          }
        />
        <RowActions
          name={`${name} ${index + 1}`}
          isFirst={index === 0}
          isLast={index === pairs.length - 1}
          onMove={(step) => onChange(moved(pairs, index, step))}
          onRemove={() =>
            onChange(pairs.filter((_, rowIndex) => rowIndex !== index))
          }
        />
      </div>
    ))}
    <div>
      <Button
        size="small"
        icon={<IoAdd size={16} />}
        onClick={() => onChange([...pairs, { label: '', value: '' }])}
      >
        Add row
      </Button>
    </div>
  </div>
);

// The CV being made lives only on this page: it is never sent to the server. The only thing that
// can be saved is a template, a reusable starting point without the photo.
const CvEditor = () => {
  const [searchParams] = useSearchParams();
  const startTemplateId = searchParams.get('template');
  const startLayout = CV_LAYOUTS.find(
    (layout) => layout.id === searchParams.get('layout'),
  )?.id as CvLayout | undefined;

  const { data, isLoading, isError } = useGetCvTemplatesQuery(undefined, {
    skip: !startTemplateId,
  });
  const [createTemplate, { isLoading: creating }] =
    useCreateCvTemplateMutation();
  const [updateTemplate, { isLoading: updating }] =
    useUpdateCvTemplateMutation();

  const [cv, setCv] = useState<CvData>({
    ...sampleCv,
    layout: startLayout ?? sampleCv.layout,
  });
  // the saved template this CV started from, or was saved as; saving again updates it
  const [template, setTemplate] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const previewRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const loadedTemplateRef = useRef(false);
  // Dragging section cards in the form. A card only becomes draggable while its handle is held,
  // so selecting text in its fields still works.
  const [armedSection, setArmedSection] = useState<string | null>(null);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    key: string;
    after: boolean;
  } | null>(null);

  const startTemplate = startTemplateId
    ? (data?.data ?? []).find((saved: any) => saved._id === startTemplateId)
    : undefined;

  // the chosen template fills the form once; later refetches must not wipe what has been typed
  useEffect(() => {
    if (!startTemplate || loadedTemplateRef.current) return;
    loadedTemplateRef.current = true;
    setCv(cvFromTemplate(startTemplate));
    setTemplate({ id: startTemplate._id, name: startTemplate.name });
  }, [startTemplate]);

  // The preview is a full-size A4 page shrunk to fit the space next to the form.
  // A CV of several pages scrolls inside its own box, so it stays beside the form.
  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;
    const fit = () =>
      setPreviewZoom(Math.min(1, container.clientWidth / CV_PAGE_WIDTH));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [isLoading]);

  const set = (patch: Partial<CvData>) =>
    setCv((current) => ({ ...current, ...patch }));

  const setSection = (key: string, patch: Partial<CvSection>) =>
    set({
      sections: cv.sections.map((section) =>
        section.key === key ? { ...section, ...patch } : section,
      ),
    });

  const setEntry = (
    section: CvSection,
    index: number,
    patch: Partial<CvEntry>,
  ) =>
    setSection(section.key, {
      entries: section.entries.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, ...patch } : entry,
      ),
    });

  const endSectionDrag = () => {
    setArmedSection(null);
    setDraggedSection(null);
    setDropTarget(null);
  };

  const pickPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // lets the same file be picked again after removing it
    event.target.value = '';
    if (!file) return;
    try {
      set({ photo: await readPhoto(file) });
    } catch {
      toast.error('Could not read that image');
    }
  };

  const openTemplateModal = () => {
    setTemplateName(template?.name ?? '');
    setTemplateModalOpen(true);
  };

  const saveTemplate = async () => {
    const name = templateName.trim();
    if (!name) {
      toast.error('Enter a name for the template');
      return;
    }
    // the photo belongs to one person, so it is never part of a template
    const { photo, ...content } = cv;
    const body = { ...content, name };
    try {
      if (template) {
        const response = await updateTemplate({
          templateId: template.id,
          body,
        }).unwrap();
        setTemplate({ id: template.id, name });
        toast.success(response.message);
      } else {
        const response = await createTemplate(body).unwrap();
        setTemplate({ id: response.data._id, name });
        toast.success(response.message);
      }
      setTemplateModalOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Could not save the template');
    }
  };

  const downloadPdf = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      await saveElementAsPagedPdf(printRef.current, {
        filename: `${cv.fullName.trim() || 'CV'} - CV.pdf`,
        breakSelector: '[data-cv-block]',
      });
    } catch {
      toast.error('Could not create the PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (startTemplateId && isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (startTemplateId && !template && (isError || !startTemplate)) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-lg font-semibold text-black dark:text-white">
            Template not found
          </p>
          <p className="text-sm text-body dark:text-bodydark">
            It may have been deleted, or belongs to another company.
          </p>
          <Link to="/cvs">
            <Button type="primary">Back to templates</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const sectionBody = (section: CvSection) => {
    const name = section.title || 'section';

    if (section.kind === 'text') {
      return (
        <Input.TextArea
          aria-label={`${name} text`}
          value={section.text}
          maxLength={5000}
          autoSize={{ minRows: 3, maxRows: 10 }}
          onChange={(e) => setSection(section.key, { text: e.target.value })}
        />
      );
    }

    if (section.kind === 'list') {
      return (
        <Input.TextArea
          aria-label={`${name} points`}
          value={section.text}
          maxLength={5000}
          autoSize={{ minRows: 3, maxRows: 10 }}
          placeholder="One point per line"
          onChange={(e) => setSection(section.key, { text: e.target.value })}
        />
      );
    }

    if (section.kind === 'tags') {
      return (
        <Field label="Press Enter after each one">
          <Select
            mode="tags"
            open={false}
            suffixIcon={null}
            tokenSeparators={[',']}
            className="w-full"
            value={section.tags}
            onChange={(tags) => setSection(section.key, { tags })}
          />
        </Field>
      );
    }

    if (section.kind === 'pairs') {
      return (
        <PairRows
          name={`${name} row`}
          pairs={section.pairs}
          onChange={(pairs) => setSection(section.key, { pairs })}
        />
      );
    }

    const labels = entryLabelsFor(section.preset);
    return (
      <div className="flex flex-col gap-4">
        {section.entries.map((entry, index) => (
          <div
            key={index}
            className="rounded-xl border border-stroke p-4 dark:border-strokedark"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-black dark:text-white">
                {labels.item} {index + 1}
              </span>
              <RowActions
                name={`${labels.item.toLowerCase()} ${index + 1}`}
                isFirst={index === 0}
                isLast={index === section.entries.length - 1}
                onMove={(step) =>
                  setSection(section.key, {
                    entries: moved(section.entries, index, step),
                  })
                }
                onRemove={() =>
                  setSection(section.key, {
                    entries: section.entries.filter(
                      (_, entryIndex) => entryIndex !== index,
                    ),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={labels.title}>
                <Input
                  value={entry.title}
                  maxLength={160}
                  onChange={(e) =>
                    setEntry(section, index, { title: e.target.value })
                  }
                />
              </Field>
              <Field label={labels.period}>
                <Input
                  value={entry.period}
                  maxLength={60}
                  onChange={(e) =>
                    setEntry(section, index, { period: e.target.value })
                  }
                />
              </Field>
              <Field label={labels.subtitle} className="sm:col-span-2">
                <Input
                  value={entry.subtitle}
                  maxLength={160}
                  onChange={(e) =>
                    setEntry(section, index, { subtitle: e.target.value })
                  }
                />
              </Field>
              <Field label={labels.details} className="sm:col-span-2">
                <Input.TextArea
                  value={entry.details}
                  maxLength={3000}
                  autoSize={{ minRows: 2, maxRows: 8 }}
                  onChange={(e) =>
                    setEntry(section, index, { details: e.target.value })
                  }
                />
              </Field>
            </div>
          </div>
        ))}
        <div>
          <Button
            size="small"
            icon={<IoAdd size={16} />}
            onClick={() =>
              setSection(section.key, {
                entries: [...section.entries, { ...emptyEntry }],
              })
            }
          >
            Add {labels.item.toLowerCase()}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* when printing, the app is hidden and only the full-size copy of the CV is left on the page */}
      <style>
        {`
          @media print {
            @page { size: A4; margin: 0; }
            body > *:not(#cv-print) { display: none !important; }
            html, body { height: auto !important; overflow: visible !important; background: #ffffff !important; }
            #cv-print { position: static !important; }
            [data-cv-block] { break-inside: avoid; }
          }
        `}
      </style>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/cvs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-body hover:text-primary dark:text-bodydark"
        >
          <IoArrowBack size={16} />
          All templates
        </Link>
        <div className="flex flex-wrap gap-3">
          <Button
            icon={<IoSaveOutline size={16} />}
            onClick={openTemplateModal}
          >
            {template ? 'Update template' : 'Save as template'}
          </Button>
          <Button
            icon={<IoPrintOutline size={16} />}
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button
            type="primary"
            icon={<IoDownloadOutline size={16} />}
            loading={downloading}
            onClick={downloadPdf}
          >
            Download as PDF
          </Button>
        </div>
      </div>
      <p className="mb-4 text-sm text-body dark:text-bodydark">
        This CV is not saved anywhere. Download or print it before leaving this
        page.
      </p>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Card
            title="Design"
            subtitle={template ? `Template: ${template.name}` : undefined}
          >
            <div className="grid grid-cols-3 gap-3">
              {CV_LAYOUTS.map((layout) => {
                const active = cv.layout === layout.id;
                return (
                  <button
                    key={layout.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => set({ layout: layout.id })}
                    className={`rounded-xl border px-3 py-2.5 text-left transition ${
                      active
                        ? 'border-primary bg-primary/10'
                        : 'border-stroke hover:border-primary dark:border-strokedark'
                    }`}
                  >
                    <span className="block text-sm font-semibold text-black dark:text-white">
                      {layout.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-body dark:text-bodydark">
                      {layout.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="w-16 text-sm font-medium text-black dark:text-white">
                Colour
              </span>
              {CV_ACCENTS.map((accent) => (
                <button
                  key={accent}
                  type="button"
                  aria-label={`Use colour ${accent}`}
                  aria-pressed={cv.accent === accent}
                  onClick={() => set({ accent })}
                  className={`h-7 w-7 rounded-full border-2 border-white ring-2 transition dark:border-boxdark ${
                    cv.accent === accent ? 'ring-primary' : 'ring-transparent'
                  }`}
                  style={{ backgroundColor: accent }}
                />
              ))}
              <label className="flex items-center gap-2 text-sm text-body dark:text-bodydark">
                <input
                  type="color"
                  aria-label="Pick any colour"
                  value={cv.accent}
                  onChange={(e) => set({ accent: e.target.value })}
                  className="h-7 w-9 cursor-pointer rounded border border-stroke bg-transparent p-0 dark:border-strokedark"
                />
                Any colour
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="w-16 text-sm font-medium text-black dark:text-white">
                Text size
              </span>
              {CV_TEXT_SIZES.map((size) => (
                <Button
                  key={size.id}
                  size="small"
                  type={cv.textSize === size.id ? 'primary' : 'default'}
                  aria-pressed={cv.textSize === size.id}
                  onClick={() => set({ textSize: size.id })}
                >
                  {size.name}
                </Button>
              ))}
            </div>
          </Card>

          <Card
            title="Name and photo"
            extra={
              <Popconfirm
                title="Clear every field?"
                description="All typed details are emptied. The sections and their labels stay, ready for the next customer."
                okText="Clear"
                onConfirm={() => setCv(clearedCv(cv))}
              >
                <Button size="small">Clear all</Button>
              </Popconfirm>
            }
          >
            <div className="mb-5 flex items-center gap-4">
              {cv.photo ? (
                <img
                  src={cv.photo}
                  alt="CV photo"
                  className="h-20 w-20 rounded-xl"
                />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-stroke text-3xl text-body dark:border-strokedark dark:text-bodydark">
                  <IoPersonOutline />
                </span>
              )}
              <div>
                <p className="text-sm font-medium text-black dark:text-white">
                  Photo
                </p>
                <p className="mb-2 text-xs text-body dark:text-bodydark">
                  Shown on the CV and cropped to a square. It is not saved.
                </p>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={pickPhoto}
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="small"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    {cv.photo ? 'Change photo' : 'Add photo'}
                  </Button>
                  {cv.photo && (
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={() => set({ photo: '' })}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <Input
                  value={cv.fullName}
                  maxLength={120}
                  onChange={(e) => set({ fullName: e.target.value })}
                />
              </Field>
              <Field label="Job title">
                <Input
                  value={cv.jobTitle}
                  maxLength={120}
                  onChange={(e) => set({ jobTitle: e.target.value })}
                />
              </Field>
            </div>
          </Card>

          <Card
            title="Contact details"
            subtitle="Add a row for anything else, like LinkedIn or a second phone"
          >
            <PairRows
              name="Contact"
              pairs={cv.contacts}
              onChange={(contacts) => set({ contacts })}
            />
          </Card>

          {cv.sections.map((section, index) => (
            <div
              key={section.key}
              draggable={armedSection === section.key}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', section.key);
                setDraggedSection(section.key);
              }}
              onDragEnd={endSectionDrag}
              onDragOver={(event) => {
                if (!draggedSection) return;
                event.preventDefault();
                const box = event.currentTarget.getBoundingClientRect();
                const after = event.clientY > box.top + box.height / 2;
                if (
                  dropTarget?.key !== section.key ||
                  dropTarget.after !== after
                ) {
                  setDropTarget({ key: section.key, after });
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedSection && dropTarget) {
                  set({
                    sections: moveSection(
                      cv.sections,
                      draggedSection,
                      section.key,
                      dropTarget.after,
                    ),
                  });
                }
                endSectionDrag();
              }}
              className={`rounded-2xl transition ${
                draggedSection === section.key ? 'opacity-40' : ''
              }`}
              style={{
                boxShadow:
                  draggedSection &&
                  draggedSection !== section.key &&
                  dropTarget?.key === section.key
                    ? dropTarget.after
                      ? '0 4px 0 #f59e0b'
                      : '0 -4px 0 #f59e0b'
                    : undefined,
              }}
            >
              <Card>
                <div className="mb-4 flex items-center gap-2">
                  <span
                    role="img"
                    aria-label="Drag to move this section"
                    title="Drag to move this section"
                    className="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center text-xl text-body hover:text-primary dark:text-bodydark"
                    onMouseDown={() => setArmedSection(section.key)}
                    onMouseUp={() => setArmedSection(null)}
                  >
                    <MdDragIndicator />
                  </span>
                  <Input
                    aria-label="Section heading"
                    className="font-semibold"
                    placeholder="Section heading"
                    maxLength={60}
                    value={section.title}
                    onChange={(e) =>
                      setSection(section.key, { title: e.target.value })
                    }
                  />
                  <RowActions
                    name={`the ${section.title || 'untitled'} section`}
                    isFirst={index === 0}
                    isLast={index === cv.sections.length - 1}
                    confirmRemove
                    onMove={(step) =>
                      set({ sections: moved(cv.sections, index, step) })
                    }
                    onRemove={() =>
                      set({
                        sections: cv.sections.filter(
                          (current) => current.key !== section.key,
                        ),
                      })
                    }
                  />
                </div>
                {sectionBody(section)}
              </Card>
            </div>
          ))}

          <Dropdown
            trigger={['click']}
            menu={{
              style: { maxHeight: 360, overflowY: 'auto' },
              items: CV_SECTION_PRESETS.map((option) => ({
                key: option.preset,
                label: option.menuLabel ?? option.title,
              })),
              onClick: ({ key }) =>
                set({ sections: [...cv.sections, newSection(key)] }),
            }}
          >
            <Button size="large" type="dashed" icon={<IoAdd size={18} />} block>
              Add section
            </Button>
          </Dropdown>
          <p className="-mt-3 text-sm text-body dark:text-bodydark">
            Sections left empty are not shown on the CV. A long CV simply
            continues onto more pages.
          </p>
        </div>

        <div className="xl:sticky xl:top-24">
          <div
            ref={previewRef}
            className="overflow-y-auto overflow-x-hidden rounded-lg border border-stroke shadow-lg dark:border-strokedark xl:max-h-[calc(100vh-8rem)]"
          >
            <div style={{ zoom: previewZoom }}>
              <CvDocument
                cv={cv}
                onMoveSection={(key, targetKey, after, column) =>
                  set({
                    sections: moveSection(
                      cv.sections,
                      key,
                      targetKey,
                      after,
                      column,
                    ),
                  })
                }
              />
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-body dark:text-bodydark">
            Drag a section in the preview to move it
            {cv.layout === 'modern'
              ? ', including between the side panel and the main column.'
              : '.'}
          </p>
        </div>
      </div>

      <Modal
        title={template ? 'Update template' : 'Save as template'}
        open={templateModalOpen}
        okText="Save template"
        confirmLoading={creating || updating}
        onOk={saveTemplate}
        onCancel={() => setTemplateModalOpen(false)}
      >
        <Field label="Template name">
          <Input
            value={templateName}
            maxLength={80}
            placeholder="e.g. Driver CV"
            onChange={(e) => setTemplateName(e.target.value)}
            onPressEnter={saveTemplate}
          />
        </Field>
        <p className="mt-3 text-sm text-body dark:text-bodydark">
          The design, the sections and the text now in the form are saved as a
          starting point for future CVs. The photo is not saved. Remove a
          customer's personal details first if they shouldn't be kept.
        </p>
      </Modal>

      {/* Full-size copy kept off screen: the PDF and the printout are made from this one.
          It sits directly under <body> so printing can hide the rest of the app around it. */}
      {createPortal(
        <div
          id="cv-print"
          ref={printRef}
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: -10000,
            top: 0,
            width: CV_PAGE_WIDTH,
          }}
        >
          <CvDocument cv={cv} />
        </div>,
        document.body,
      )}
    </div>
  );
};

export default CvEditor;

import React from 'react';
import { Button, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdDeleteOutline } from 'react-icons/md';
import Card from '../../components/ui/Card';
import Loading from '../../components/Loading';
import {
  useDeleteCvTemplateMutation,
  useGetCvTemplatesQuery,
} from '../../store/slice/reportSlice';
import CvDocument, { CV_PAGE_WIDTH } from './CvDocument';
import { CV_LAYOUTS, CvData, cvFromTemplate, sampleCv } from './types';

const THUMB_WIDTH = 220;
// an A4 page, shrunk to the width of a card
const THUMB_HEIGHT = Math.round((THUMB_WIDTH * 297) / 210);

interface TemplateCardProps {
  name: string;
  description: string;
  cv: CvData;
  onUse: () => void;
  action?: React.ReactNode;
}

const TemplateCard = ({
  name,
  description,
  cv,
  onUse,
  action,
}: TemplateCardProps) => (
  <div
    className="overflow-hidden rounded-xl border border-stroke transition hover:border-primary hover:shadow-md dark:border-strokedark"
    style={{ width: THUMB_WIDTH + 2 }}
  >
    <button
      type="button"
      aria-label={`Make a CV with the ${name} template`}
      onClick={onUse}
      className="block overflow-hidden bg-white"
      style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
    >
      {/* a real, tiny copy of the CV; it is only a picture here, so it takes no clicks */}
      <div
        aria-hidden="true"
        style={{ zoom: THUMB_WIDTH / CV_PAGE_WIDTH, pointerEvents: 'none' }}
      >
        <CvDocument cv={cv} />
      </div>
    </button>
    <div className="flex items-start justify-between gap-2 border-t border-stroke px-3 py-2.5 dark:border-strokedark">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-black dark:text-white">
          {name}
        </p>
        <p className="truncate text-xs text-body dark:text-bodydark">
          {description}
        </p>
      </div>
      {action}
    </div>
  </div>
);

const CvTemplates = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetCvTemplatesQuery();
  const [deleteTemplate] = useDeleteCvTemplateMutation();

  const saved: any[] = data?.data ?? [];

  const remove = async (templateId: string) => {
    try {
      const response = await deleteTemplate({ templateId }).unwrap();
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Could not delete the template');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card
        title="CV Maker"
        subtitle="Pick a template, fill in the details and download the PDF. The CVs themselves are not saved."
      >
        <div className="flex flex-wrap gap-5">
          {CV_LAYOUTS.map((layout) => (
            <TemplateCard
              key={layout.id}
              name={layout.name}
              description={layout.description}
              cv={{ ...sampleCv, layout: layout.id }}
              onUse={() => navigate(`/cvs/new?layout=${layout.id}`)}
            />
          ))}
        </div>
      </Card>

      <Card
        title="Your templates"
        subtitle="Starting points saved by your company. Make one with “Save as template” while editing a CV."
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loading />
          </div>
        ) : isError ? (
          <p className="text-sm text-body dark:text-bodydark">
            Couldn't load your templates.
          </p>
        ) : saved.length === 0 ? (
          <p className="text-sm text-body dark:text-bodydark">
            No saved templates yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-5">
            {saved.map((template) => (
              <TemplateCard
                key={template._id}
                name={template.name}
                description={
                  CV_LAYOUTS.find((layout) => layout.id === template.layout)
                    ?.name ?? ''
                }
                cv={cvFromTemplate(template)}
                onUse={() => navigate(`/cvs/new?template=${template._id}`)}
                action={
                  <Popconfirm
                    title="Delete this template?"
                    description="This can't be undone."
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => remove(template._id)}
                  >
                    <Button
                      type="text"
                      danger
                      size="small"
                      aria-label={`Delete template ${template.name}`}
                      icon={<MdDeleteOutline size={18} />}
                    />
                  </Popconfirm>
                }
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CvTemplates;

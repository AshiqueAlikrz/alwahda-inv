import React, { useEffect, useState } from 'react';
import { Input, Modal } from 'antd';
import { toast } from 'react-toastify';
import {
  useCreateServiceMutation,
  useUpdateServiceMutation,
} from '../store/slice/reportSlice';

interface ServiceData {
  name: string;
  price: number;
}

interface ServiceModalProps {
  open: boolean;
  mode?: 'Add' | 'Edit';
  serviceId?: string;
  initialData?: ServiceData;
  zIndex?: number;
  onClose: () => void;
  onSaved?: (service: any) => void;
}

const emptyService: ServiceData = { name: '', price: 0 };

const ServiceModal: React.FC<ServiceModalProps> = ({
  open,
  mode = 'Add',
  serviceId = '',
  initialData = emptyService,
  zIndex,
  onClose,
  onSaved,
}) => {
  const [serviceData, setServiceData] = useState<ServiceData>(initialData);
  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();

  useEffect(() => {
    if (open) setServiceData(initialData);
  }, [open]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServiceData({
      ...serviceData,
      [e.target.name]:
        e.target.name === 'name' ? e.target.value : Number(e.target.value),
    });
  };

  const handleOk = async () => {
    if (!serviceData.name.trim()) {
      toast.error('Service name is required');
      return;
    }
    try {
      if (mode === 'Edit') {
        const response = await updateService({
          serviceId,
          body: serviceData,
        }).unwrap();
        toast.success(response.message);
        onSaved?.(response.data);
      } else {
        const response = await createService(serviceData).unwrap();
        toast.success(response.message);
        onSaved?.(response.data);
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Error saving service');
    }
  };

  return (
    <Modal
      title={`${mode} Service`}
      closable={{ 'aria-label': 'Custom Close Button' }}
      open={open}
      zIndex={zIndex}
      confirmLoading={isCreating || isUpdating}
      onOk={handleOk}
      onCancel={onClose}
    >
      <div className="flex gap-3 flex-col">
        <div className="flex gap-1">
          <label className="text-nowrap">Service Name :</label>
          <Input
            type="text"
            onChange={onChange}
            name="name"
            placeholder="Service Name"
            value={serviceData.name}
          />
        </div>
        <div className="flex gap-1">
          <label className="text-nowrap">Price :</label>
          <Input
            onChange={onChange}
            type="number"
            placeholder="price"
            name="price"
            value={serviceData.price}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ServiceModal;

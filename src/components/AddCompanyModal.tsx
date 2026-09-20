import React, { useEffect, useState } from 'react';
import { Input, Modal } from 'antd';
import { toast } from 'react-toastify';
import {
  CreateCompanyBody,
  useCreateCompanyMutation,
} from '../store/slice/companySlice';

interface AddCompanyModalProps {
  open: boolean;
  onClose: () => void;
  onSaved?: (company: any) => void;
}

const emptyCompany: CreateCompanyBody = {
  companyName: '',
  businessType: '',
  phoneNumber: '',
  purchaseDate: '',
  expiryDate: '',
};

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({
  open,
  onClose,
  onSaved,
}) => {
  const [company, setCompany] = useState<CreateCompanyBody>(emptyCompany);
  const [createCompany, { isLoading }] = useCreateCompanyMutation();

  useEffect(() => {
    if (open) setCompany(emptyCompany);
  }, [open]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const handleOk = async () => {
    if (!company.companyName.trim() || !company.businessType.trim()) {
      toast.error('Company name and business type are required');
      return;
    }
    if (
      company.purchaseDate &&
      company.expiryDate &&
      company.expiryDate < company.purchaseDate
    ) {
      toast.error('Expiry date cannot be before purchase date');
      return;
    }
    try {
      const response = await createCompany(company).unwrap();
      toast.success(response.message);
      onSaved?.(response.data);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Error creating company');
    }
  };

  return (
    <Modal
      title="Add Company"
      open={open}
      okText="Add Company"
      confirmLoading={isLoading}
      onOk={handleOk}
      onCancel={onClose}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label>Company Name *</label>
          <Input
            name="companyName"
            placeholder="Company name"
            value={company.companyName}
            onChange={onChange}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label>Business Type *</label>
          <Input
            name="businessType"
            placeholder="e.g. Typing Center"
            value={company.businessType}
            onChange={onChange}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label>Phone Number</label>
          <Input
            name="phoneNumber"
            type="tel"
            placeholder="Phone number"
            value={company.phoneNumber}
            onChange={onChange}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <label>Purchase Date</label>
            <Input
              name="purchaseDate"
              type="date"
              value={company.purchaseDate}
              onChange={onChange}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label>Expiry Date</label>
            <Input
              name="expiryDate"
              type="date"
              value={company.expiryDate}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddCompanyModal;

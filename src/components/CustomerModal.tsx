import React, { useEffect, useState } from 'react';
import { Input, Modal } from 'antd';
import { toast } from 'react-toastify';
import { useCreateCustomerMutation } from '../store/slice/reportSlice';

interface CustomerData {
  name: string;
  contact: string;
  trn: string;
  address: string;
  email: string;
}

interface CustomerModalProps {
  open: boolean;
  initialName?: string;
  zIndex?: number;
  onClose: () => void;
  onSaved?: (customer: any) => void;
}

const emptyCustomer: CustomerData = {
  name: '',
  contact: '',
  trn: '',
  address: '',
  email: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CustomerModal: React.FC<CustomerModalProps> = ({
  open,
  initialName = '',
  zIndex,
  onClose,
  onSaved,
}) => {
  const [customer, setCustomer] = useState<CustomerData>(emptyCustomer);
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  useEffect(() => {
    if (open) setCustomer({ ...emptyCustomer, name: initialName });
  }, [open]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleOk = async () => {
    if (!customer.name.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (customer.email.trim() && !EMAIL_PATTERN.test(customer.email.trim())) {
      toast.error('Enter a valid email address');
      return;
    }
    try {
      const response = await createCustomer({
        name: customer.name.trim(),
        contact: customer.contact ? Number(customer.contact) : undefined,
        trn: customer.trn ? Number(customer.trn) : undefined,
        address: customer.address.trim() || undefined,
        email: customer.email.trim() || undefined,
      }).unwrap();
      toast.success(response.message);
      onSaved?.(response.data);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Error adding customer');
    }
  };

  return (
    <Modal
      title="Add Customer"
      open={open}
      zIndex={zIndex}
      okText="Add"
      confirmLoading={isLoading}
      onOk={handleOk}
      onCancel={onClose}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label>Name :</label>
          <Input
            name="name"
            placeholder="Customer name"
            value={customer.name}
            onChange={onChange}
            autoFocus
          />
        </div>
        <div className="flex gap-3">
          <div className="flex w-1/2 flex-col gap-1">
            <label>Contact :</label>
            <Input
              name="contact"
              type="number"
              placeholder="Phone number"
              value={customer.contact}
              onChange={onChange}
            />
          </div>
          <div className="flex w-1/2 flex-col gap-1">
            <label>TRN :</label>
            <Input
              name="trn"
              type="number"
              placeholder="Tax registration no."
              value={customer.trn}
              onChange={onChange}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label>Address :</label>
          <Input
            name="address"
            placeholder="Address"
            value={customer.address}
            onChange={onChange}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label>Email :</label>
          <Input
            name="email"
            type="email"
            placeholder="customer@example.com (optional)"
            value={customer.email}
            onChange={onChange}
          />
        </div>
      </div>
    </Modal>
  );
};

export default CustomerModal;

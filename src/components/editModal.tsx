import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { Input } from 'antd';

const EditModal = ({ open, setOpen, onChange, handleOk }: any) => {
  // const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState('Content of the modal');

  const showModal = () => {
    setOpen(true);
  };

  // const handleOk = () => {
  //   setModalText('The modal will be closed after two seconds');
  //   setConfirmLoading(true);
  //   setTimeout(() => {
  //     setOpen(false);
  //     setConfirmLoading(false);
  //   }, 2000);
  // };

  const handleCancel = () => {
    console.log('Clicked cancel button');
    setOpen(false);
  };

  return (
    <>
      <Modal
        title="Edit"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <div className="flex gap-3 flex-col">
          <div className="flex gap-1">
            <label className="text-nowrap">Service Chr :</label>
            <Input
              type="number"
              onChange={onChange}
              name="serviceCharge"
              placeholder="Service Charge"
            />
          </div>
          {/* <div className="flex gap-1">
            <label className="text-nowrap">Tax :</label>
            <Input
              onChange={onChange}
              type="number"
              placeholder="Tax"
              name="tax"
            />
          </div> */}
        </div>
      </Modal>
    </>
  );
};

export default EditModal;

import React, { useState, useMemo } from 'react';
import axios from 'axios'; // make sure axios is installed
import {
  Card,
  Typography,
  Row,
  Col,
  Input,
  Table,
  InputNumber,
  Button,
  Divider,
  Space,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Item {
  key: string;
  description: string;
  qty: number;
  price: number;
}

const Quotation = () => {
  const [company, setCompany] = useState({
    name: 'MOOSA AL NOOR GENERAL TRADING L.L.C',
    address: 'Dubai, UAE',
    phone: '+971-000000000',
    email: 'info@company.com',
  });

  const [client, setClient] = useState('');
  const [quoteNo, setQuoteNo] = useState('QT-001');
  const [date, setDate] = useState('');

  const [items, setItems] = useState<Item[]>([
    { key: '1', description: '', qty: 1, price: 0 },
  ]);

  const vatPercent = 5;

  const terms = [
    'Payment should be made within 7 days.',
    'Prices include VAT.',
    'Quotation valid for 15 days only.',
    'Delivery timeline will be confirmed after approval.',
  ];

  const updateItem = (key: string, field: keyof Item, value: any) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, [field]: value } : i)),
    );
  };

  const addRow = () => {
    setItems([
      ...items,
      { key: Date.now().toString(), description: '', qty: 1, price: 0 },
    ]);
  };

  const deleteRow = (key: string) => {
    setItems(items.filter((i) => i.key !== key));
  };

  const updateCompany = (field: keyof typeof company, value: string) => {
    setCompany((prev) => ({ ...prev, [field]: value }));
  };

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * i.price, 0),
    [items],
  );
  const vatAmount = (subtotal * vatPercent) / 100;
  const total = subtotal + vatAmount;

  const columns = [
    {
      title: '#',
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
    },
    {
      title: 'Description',
      render: (_: any, record: Item) => (
        <Input
          value={record.description}
          onChange={(e) =>
            updateItem(record.key, 'description', e.target.value)
          }
        />
      ),
    },
    {
      title: 'Qty',
      width: 120,
      render: (_: any, record: Item) => (
        <InputNumber
          min={1}
          style={{ width: '100%' }}
          value={record.qty}
          onChange={(v) => updateItem(record.key, 'qty', v || 0)}
        />
      ),
    },
    {
      title: 'Price',
      width: 150,
      render: (_: any, record: Item) => (
        <InputNumber
          min={0}
          precision={2}
          style={{ width: '100%' }}
          value={record.price}
          onChange={(v) => updateItem(record.key, 'price', v || 0)}
        />
      ),
    },
    {
      title: 'Amount',
      width: 150,
      render: (_: any, record: Item) => (
        <Text strong>{(record.qty * record.price).toFixed(2)}</Text>
      ),
    },
    {
      title: '',
      width: 60,
      render: (_: any, record: Item) => (
        <Button danger onClick={() => deleteRow(record.key)}>
          <DeleteOutlined />
        </Button>
      ),
    },
  ];

  // -----------------------
  // API Call
  // -----------------------
  const saveQuotation = async () => {
    try {
      const data = {
        company,
        client,
        quoteNo,
        date,
        items: items.map((i) => ({
          description: i.description,
          qty: i.qty,
          price: i.price,
          amount: i.qty * i.price,
        })),
        subtotal,
        vatPercent,
        vatAmount,
        total,
        terms,
      };

      const response = await axios.post('/api/quotations', data); // your API endpoint
      message.success('Quotation saved successfully!');
      console.log('Saved Quotation:', response.data);
    } catch (err: any) {
      console.error(err);
      message.error('Failed to save quotation!');
    }
  };

  return (
    <Card style={{ minWidth: 1100, margin: 'auto' }}>
      {/* ===== Company Info ===== */}
      <Row justify="space-between" gutter={16}>
        <Col span={12}>
          <Input
            placeholder="Company Name"
            value={company.name}
            onChange={(e) => updateCompany('name', e.target.value)}
            style={{ marginBottom: 4 }}
          />
          <Input
            placeholder="Address"
            value={company.address}
            onChange={(e) => updateCompany('address', e.target.value)}
            style={{ marginBottom: 4 }}
          />
          <Input
            placeholder="Phone"
            value={company.phone}
            onChange={(e) => updateCompany('phone', e.target.value)}
            style={{ marginBottom: 4 }}
          />
          <Input
            placeholder="Email"
            value={company.email}
            onChange={(e) => updateCompany('email', e.target.value)}
          />
        </Col>

        <Col span={12} style={{ textAlign: 'right' }}>
          <Title level={2}>QUOTATION</Title>
        </Col>
      </Row>

      <Divider />

      {/* ===== Client Info ===== */}
      <Row gutter={16}>
        <Col span={8}>
          <Text strong>Client Name</Text>
          <Input value={client} onChange={(e) => setClient(e.target.value)} />
        </Col>

        <Col span={8}>
          <Text strong>Quotation No</Text>
          <Input value={quoteNo} onChange={(e) => setQuoteNo(e.target.value)} />
        </Col>

        <Col span={8}>
          <Text strong>Date</Text>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Col>
      </Row>

      <Divider />

      {/* ===== Items Table ===== */}
      <Table
        columns={columns}
        dataSource={items}
        pagination={false}
        rowKey="key"
      />

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addRow}
        style={{ marginTop: 10 }}
      >
        Add Item
      </Button>

      {/* ===== Totals ===== */}
      <Row justify="end" style={{ marginTop: 30 }}>
        <Col span={8}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Row justify="space-between">
              <Text>Subtotal</Text>
              <Text>{subtotal.toFixed(2)}</Text>
            </Row>

            <Row justify="space-between">
              <Text>VAT (5%)</Text>
              <Text>{vatAmount.toFixed(2)}</Text>
            </Row>

            <Row justify="space-between">
              <Title level={5}>Total</Title>
              <Title level={5}>{total.toFixed(2)}</Title>
            </Row>
          </Space>
        </Col>
      </Row>

      <Divider />

      <Title level={5}>Terms & Conditions</Title>
      {terms.map((t, i) => (
        <Text key={i} style={{ display: 'block' }}>
          • {t}
        </Text>
      ))}

      <Divider />
      <Button type="primary" onClick={saveQuotation}>
        Save Quotation
      </Button>
    </Card>
  );
};

export default Quotation;

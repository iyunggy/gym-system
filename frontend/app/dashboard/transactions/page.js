"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  InputNumber,
  Row,
  Col,
  Modal,
  Form,
  message,
  Typography,
  Tooltip,
  Select,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { BASE_API_URL } from "@/lib/contants"; // Import dari constants.js

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTransactionsAndMembers();
  }, []);

  const fetchTransactionsAndMembers = async () => {
    setLoading(true);
    try {
      const transactionsResponse = await fetch(`${BASE_API_URL}/transaksi/`);
      if (!transactionsResponse.ok)
        throw new Error("Failed to fetch transactions");
      const transactionsData = await transactionsResponse.json();
      setTransactions(transactionsData);

      const membersResponse = await fetch(`${BASE_API_URL}/members/`);
      if (!membersResponse.ok) throw new Error("Failed to fetch members");
      const membersData = await membersResponse.json();
      setMembers(membersData);
    } catch (error) {
      message.error("Error fetching data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Transaction ID",
      dataIndex: "id_transaksi",
      key: "id_transaksi",
      render: (text) => <span style={{ fontWeight: "bold" }}>{text}</span>,
    },
    {
      title: "Member Name",
      dataIndex: "member_name",
      key: "member_name",
    },
    {
      title: "Transaction Date",
      dataIndex: "transaction_date",
      key: "transaction_date",
      render: (date) => dayjs(date).format("DD MMMM YYYY"),
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amount) =>
        `Rp ${Number.parseFloat(amount).toLocaleString("id-ID")}`,
      align: "right",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Tooltip title='Edit Transaction'>
            <Button
              type='text'
              icon={<EditOutlined />}
              size='small'
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title='Delete Transaction'>
            <Button
              type='text'
              icon={<DeleteOutlined />}
              size='small'
              danger
              onClick={() => handleDelete(record.id_transaksi)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingTransaction(null);
    form.resetFields();
    form.setFieldsValue({ transaction_date: dayjs() });
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTransaction(record);
    form.setFieldsValue({
      ...record,
      member: record.member,
      transaction_date: dayjs(record.transaction_date),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id_transaksi) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this transaction?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `${BASE_API_URL}/transaksi/${id_transaksi}/`,
            {
              method: "DELETE",
            }
          );
          if (!response.ok) throw new Error("Failed to delete transaction");
          message.success("Transaction deleted successfully!");
          fetchTransactionsAndMembers();
        } catch (error) {
          message.error("Error deleting transaction: " + error.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const transactionData = {
        member: values.member,
        transaction_date: values.transaction_date
          ? values.transaction_date.format("YYYY-MM-DD")
          : null,
        total_amount: values.total_amount,
      };

      let response;
      if (editingTransaction) {
        response = await fetch(
          `${BASE_API_URL}/transaksi/${editingTransaction.id_transaksi}/`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transactionData),
          }
        );
        if (!response.ok) throw new Error("Failed to update transaction");
        message.success("Transaction updated successfully!");
      } else {
        response = await fetch(`${BASE_API_URL}/transaksi/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transactionData),
        });
        if (!response.ok) throw new Error("Failed to add transaction");
        message.success("Transaction added successfully!");
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingTransaction(null);
      fetchTransactionsAndMembers();
    } catch (error) {
      message.error("Operation failed: " + error.message);
      console.log("Validation failed or API error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingTransaction(null);
  };

  return (
    <div className='fade-in'>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Transaction Management</Title>
        <Paragraph>
          Manage all financial transactions within your gym.
        </Paragraph>
      </div>

      <Card title='Transaction List' className='gym-card'>
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col xs={24} sm={12}>
            <Search
              placeholder='Search transactions...'
              prefix={<SearchOutlined />}
              allowClear
              size='large'
            />
          </Col>
          <Col xs={24} sm={6}>
            <Button
              icon={<ReloadOutlined />}
              size='large'
              style={{ width: "100%" }}
              onClick={fetchTransactionsAndMembers}>
              Refresh
            </Button>
          </Col>
          <Col xs={24} sm={6}>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size='large'
              style={{ width: "100%" }}>
              Add Transaction
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={transactions}
          pagination={{
            total: transactions.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} transactions`,
          }}
          scroll={{ x: 800 }}
          className='gym-table'
          loading={loading}
          rowKey='id_transaksi'
        />
      </Card>

      {/* Add/Edit Transaction Modal */}
      <Modal
        title={editingTransaction ? "Edit Transaction" : "Add New Transaction"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        confirmLoading={loading}
        okText={editingTransaction ? "Update Transaction" : "Add Transaction"}
        cancelText='Cancel'>
        <Form form={form} layout='vertical' name='transactionForm'>
          <Form.Item
            name='member'
            label='Member'
            rules={[{ required: true, message: "Please select a member" }]}>
            <Select placeholder='Select a member' size='large'>
              {members.map((member) => (
                <Option key={member.id_member} value={member.id_member}>
                  {member.name} ({member.id_member})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name='total_amount'
            label='Total Amount (IDR)'
            rules={[{ required: true, message: "Please enter total amount" }]}>
            <InputNumber
              min={0}
              formatter={(value) =>
                `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/Rp\s?|(,*)/g, "")}
              placeholder='e.g., 250000'
              style={{ width: "100%" }}
              size='large'
            />
          </Form.Item>

          <Form.Item
            name='transaction_date'
            label='Transaction Date'
            rules={[
              { required: true, message: "Please select transaction date" },
            ]}>
            <DatePicker
              style={{ width: "100%" }}
              placeholder='Select date'
              size='large'
              format='YYYY-MM-DD'
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

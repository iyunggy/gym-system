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
  PlusOutlined, // Ini bisa dihapus jika tombol Add benar-benar hilang
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { BASE_API_URL } from "@/lib/contants"; // Import dari constants.js
import { API_ALL_TRANSAKSI } from "@/utils/endPoint"; // Pastikan ini adalah endpoint yang benar
import axios from "axios";

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  // const [members, setMembers] = useState([]); // Hapus state members karena tidak lagi diambil
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTransactions(); // Ubah nama fungsi panggilannya
  }, []);

  // Fungsi untuk mendapatkan header otentikasi
  const getAuthHeaders = () => {
    const authToken = localStorage.getItem("authToken"); // Asumsi token disimpan di localStorage
    return authToken
      ? { Authorization: `Token ${authToken}` }
      : {};
  };

  const fetchTransactions = async () => { // Ubah nama fungsi
    setLoading(true);
    try {
      const transactionsResponse = await axios.get(`${API_ALL_TRANSAKSI}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(), // Tambahkan header otentikasi
        },
      });
      const transactionsData = transactionsResponse.data.results;
      console.log("🚀 ~ fetchMembers ~ data:", transactionsData);
      setTransactions(transactionsData);

      // --- BARIS INI DIHAPUS SESUAI PERMINTAAN ---
      // const membersResponse = await fetch(`${BASE_API_URL}/members/`);
      // if (!membersResponse.ok) throw new Error("Failed to fetch members");
      // const membersData = await membersResponse.json();
      // setMembers(membersData);
      // --- AKHIR BARIS YANG DIHAPUS ---

    } catch (error) {
      message.error("Error fetching data: " + error.message);
      console.error("Error details:", error.response || error);
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
      render: (text, record) => <span style={{ fontWeight: "bold" }}>{record?.member_detail?.first_name}</span>,
    },
    {
      title: "Transaction Date",
      dataIndex: "transaction_date",
      key: "transaction_date",
      render: (date) => dayjs(date).format("DD MMMM YYYY"),
    },
    {
      title: "Total Amount",
      dataIndex: "total_bayar",
      key: "total_bayar",
      render: (amount) =>
        `Rp ${Number.parseFloat(amount).toLocaleString("id-ID")}`,
      align: "right",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          {/* <Tooltip title='Edit Transaction'>
            <Button
              type='text'
              icon={<EditOutlined />}
              size='small'
              onClick={() => handleEdit(record)}
            />
          </Tooltip> */}
          <Tooltip title='Delete Transaction'>
            <Button
              type='text'
              icon={<DeleteOutlined />}
              size='small'
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // --- FUNGSI handleAdd DIHAPUS KARENA TIDAK ADA LAGI FITUR TAMBAH TRANSAKSI ---
  // const handleAdd = () => {
  //   setEditingTransaction(null);
  //   form.resetFields();
  //   form.setFieldsValue({ transaction_date: dayjs() });
  //   setIsModalVisible(true);
  // };

  const handleEdit = (record) => {
    setEditingTransaction(record);
    form.setFieldsValue({
      ...record,
      member: record.member, // Pastikan `record.member` adalah ID member
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
            `${BASE_API_URL}/transaksi/${id_transaksi}/`, {
              headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
              },
              method: "DELETE",
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to delete transaction");
          }
          message.success("Transaction deleted successfully!");
          fetchTransactions(); // Ubah nama fungsi panggilannya
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
        member: values.member, // Ini adalah ID member yang dipilih
        transaction_date: values.transaction_date
          ? values.transaction_date.format("YYYY-MM-DD")
          : null,
        total_amount: values.total_amount,
      };

      let response;
      // Karena fitur "Add Transaction" dihilangkan, hanya ada logika PUT
      if (editingTransaction) {
        response = await fetch(
          `${BASE_API_URL}/transaksi/${editingTransaction.id_transaksi}/`,
          {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                ...getAuthHeaders(), // Tambahkan header otentikasi
            },
            body: JSON.stringify(transactionData),
          }
        );
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to update transaction");
        }
        message.success("Transaction updated successfully!");
      } 
      // --- BARIS INI DIHAPUS KARENA TIDAK ADA LAGI FITUR TAMBAH TRANSAKSI ---
      // else {
      //   response = await fetch(`${BASE_API_URL}/transaksi/`, {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(transactionData),
      //   });
      //   if (!response.ok) throw new Error("Failed to add transaction");
      //   message.success("Transaction added successfully!");
      // }
      // --- AKHIR BARIS YANG DIHAPUS ---

      setIsModalVisible(false);
      form.resetFields();
      setEditingTransaction(null);
      fetchTransactions(); // Ubah nama fungsi panggilannya
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
          <Col xs={24} sm={18}> {/* Ubah col-span jika tombol Add dihilangkan */}
            <Search
              placeholder='Search transactions...'
              prefix={<SearchOutlined />}
              allowClear
              size='large'
            />
          </Col>
          <Col xs={24} sm={6}> {/* Ubah col-span jika tombol Add dihilangkan */}
            <Button
              icon={<ReloadOutlined />}
              size='large'
              style={{ width: "100%" }}
              onClick={fetchTransactions}> {/* Ubah nama fungsi panggilannya */}
              Refresh
            </Button>
          </Col>
          {/* --- TOMBOL "ADD TRANSACTION" DIHAPUS SESUAI PERMINTAAN --- */}
          {/* <Col xs={24} sm={6}>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size='large'
              style={{ width: "100%" }}>
              Add Transaction
            </Button>
          </Col> */}
          {/* --- AKHIR BAGIAN YANG DIHAPUS --- */}
        </Row>

        <Table
          columns={columns}
          dataSource={transactions}
          // pagination={{
          //   total: transactions.length,
          //   pageSize: 10,
          //   showSizeChanger: true,
          //   showQuickJumper: true,
          //   showTotal: (total, range) =>
          //     `${range[0]}-${range[1]} of ${total} transactions`,
          // }}
          scroll={{ x: 800 }}
          className='gym-table'
          loading={loading}
          rowKey='id_transaksi'
        />
      </Card>

      {/* Edit Transaction Modal */}
      <Modal
        title={"Edit Transaction"} 
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        confirmLoading={loading}
        okText={"Update Transaction"}
        cancelText='Cancel'>
        <Form form={form} layout='vertical' name='transactionForm'>
          <Form.Item
            name='member'
            label='Member'
            rules={[{ required: true, message: "Please select a member" }]}>
            <Select placeholder='Select a member' size='large' disabled> {/* Member non-editable */}
            
               {editingTransaction && (
                  <Option key={editingTransaction.member} value={editingTransaction.member}>
                    {editingTransaction.member_name} ({editingTransaction.member})
                  </Option>
              )}
              {/* members.map((member) => (
                <Option key={member.id_member} value={member.id_member}>
                  {member.name} ({member.id_member})
                </Option>
              ))*/}
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
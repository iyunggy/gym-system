"use client"

import { useState, useEffect } from "react"
import {
  Card,
  Table,
  Button,
  Space,
  Avatar,
  Input,
  Row,
  Col,
  Modal,
  Form,
  message,
  Typography,
  Tooltip,
  InputNumber,
} from "antd"
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons"
import axios from "axios"

const { Title, Paragraph } = Typography
const { Search } = Input

// Definisikan BASE_URL API Anda
// Sesuaikan dengan URL backend Django Anda
const BASE_API_URL = "http://localhost:8000/api" // Contoh: Sesuaikan dengan URL API Anda

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingTrainer, setEditingTrainer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchTrainers()
  }, [])

  const getAuthHeaders = () => {
    const authToken = localStorage.getItem("authToken")
    return authToken
      ? { Authorization: `Token ${authToken}` }
      : {}
  }

  const fetchTrainers = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BASE_API_URL}/personal-trainers/`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      })
      
      const data = response.data
      if (data && typeof data === "object" && Array.isArray(data.results)) {
        setTrainers(data.results)
      } else if (Array.isArray(data)) {
        setTrainers(data)
      } else {
        console.error("Unexpected API response format for trainers:", data)
        setTrainers([])
        message.error("Failed to load trainers: Unexpected data format.")
      }
    } catch (error) {
      message.error(
        "Error fetching trainers: " +
          (error.response?.data?.detail || error.message)
      )
      setTrainers([])
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: "Trainer",
      dataIndex: "nama",
      key: "nama",
      render: (text, record) => (
        <Space>
          <Avatar style={{ backgroundColor: "#722ed1" }}>{record.username.charAt(0).toUpperCase()}</Avatar>
          <div>
            <div style={{ fontWeight: "bold" }}>{text}</div>
            <div style={{ color: "#666", fontSize: "12px" }}>{record.id_pt}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact",
      dataIndex: "email",
      key: "contact",
      render: (email, record) => (
        <div>
          <div>{record?.profile?.email}</div>
          <div style={{ color: "#666", fontSize: "12px" }}>{record?.profile?.phone}</div>
        </div>
      ),
    },
    {
      title: "Certification",
      dataIndex: "sertifikasi_pt",
      key: "sertifikasi_pt",
      ellipsis: true,
    },
    {
      // Kolom ini tetap menampilkan masa_kerja (total bulan)
      // Atau bisa diubah untuk format "X Years Y Months" jika diinginkan
      title: "Tahun Kerja",
      dataIndex: "tahun_kerja",
      key: "tahun_kerja",
      align: "center",
    },
    {
      // Kolom ini tetap menampilkan masa_kerja (total bulan)
      // Atau bisa diubah untuk format "X Years Y Months" jika diinginkan
      title: "Bulan Kerja",
      dataIndex: "bulan_kerja",
      key: "bulan_kerja",
      align: "center",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Tooltip title="Edit Trainer">
            <Button type="text" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete Trainer">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const handleAdd = () => {
    setEditingTrainer(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingTrainer(record)
    // Pisahkan masa_kerja (total bulan) menjadi tahun dan bulan
    const years = record.masa_kerja ? Math.floor(record.masa_kerja / 12) : 0;
    const months = record.masa_kerja ? record.masa_kerja % 12 : 0;

    form.setFieldsValue({
      ...record,
      nama: record.nama,
      email: record.email,
      phone: record.phone,
      sertifikasi: record.sertifikasi,
      // Mengisi form dengan nilai tahun dan bulan terpisah
      years_of_experience: years,
      months_of_experience: months,
    })
    setIsModalVisible(true)
  }

  const handleDelete = async (id_pt) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this personal trainer?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        setLoading(true)
        try {
          await axios.delete(`${BASE_API_URL}/personal-trainers/${id_pt}/`, {
            headers: getAuthHeaders(),
          })
          message.success("Personal trainer deleted successfully!")
          fetchTrainers()
        } catch (error) {
          message.error(
            "Error deleting trainer: " +
              (error.response?.data?.detail || error.message)
          )
        } finally {
          setLoading(false)
        }
      },
    })
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // Gabungkan tahun dan bulan menjadi total masa_kerja dalam bulan
      const totalMonths = (values.years_of_experience * 12) + values.months_of_experience;

      const trainerData = {
        first_name: values.first_name,
        last_name: values.last_name,
        username: values.email,
        email: values.email,
        phone: values.phone,
        sertifikasi_pt: values.sertifikasi,
        // masa_kerja: totalMonths, // Kirim total bulan ke backend
        tahun_kerja: values.years_of_experience,
        bulan_kerja: values.months_of_experience
      }
      console.log("🚀 ~ handleModalOk ~ trainerData:", trainerData)

      let response
      if (editingTrainer) {
        response = await axios.patch(
          `${BASE_API_URL}/personal-trainers/${editingTrainer.id}/`,
          trainerData,
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          }
        )
        message.success("Personal trainer updated successfully!")
      } else {
        response = await axios.post(
          `${BASE_API_URL}/personal-trainers/`,
          trainerData,
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          }
        )
        message.success("Personal trainer added successfully!")
      }
      setIsModalVisible(false)
      form.resetFields()
      setEditingTrainer(null)
      fetchTrainers()
    } catch (error) {
      let errorMessage = "Operation failed: "
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage += error.response.data
        } else if (typeof error.response.data === 'object') {
          errorMessage += Object.values(error.response.data).flat().join('; ')
        }
      } else {
        errorMessage += error.message
      }
      message.error(errorMessage)
      console.log("Validation failed or API error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setEditingTrainer(null)
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Personal Trainers Management</Title>
        <Paragraph>Manage your gym&apos;s personal trainers and their details.</Paragraph>
      </div>

      <Card title="Personal Trainers List" className="gym-card">
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col xs={24} sm={12}>
            <Search placeholder="Search trainers..." prefix={<SearchOutlined />} allowClear size="large" />
          </Col>
          <Col xs={24} sm={6}>
            <Button icon={<ReloadOutlined />} size="large" style={{ width: "100%" }} onClick={fetchTrainers}>
              Refresh
            </Button>
          </Col>
          <Col xs={24} sm={6}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" style={{ width: "100%" }}>
              Add Trainer
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={trainers}
          pagination={{
            total: trainers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} trainers`,
          }}
          scroll={{ x: 800 }}
          className="gym-table"
          loading={loading}
          rowKey="id_pt"
        />
      </Card>

      {/* Add/Edit Trainer Modal */}
      <Modal
        title={editingTrainer ? "Edit Personal Trainer" : "Add New Personal Trainer"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
        confirmLoading={loading}
        okText={editingTrainer ? "Update Trainer" : "Add Trainer"}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" name="trainerForm">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Please enter full name" }]}>
                <Input placeholder="Enter first name" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Please enter full name" }]}>
                <Input placeholder="Enter last name" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input placeholder="Enter email address" size="large" />
              </Form.Item>
            </Col>
          </Row>
          

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: "Please enter phone number" }]}
              >
                <Input placeholder="Enter phone number" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sertifikasi_pt"
                label="Certification"
                rules={[{ required: true, message: "Please enter certification" }]}
              >
                <Input placeholder="e.g., NASM Certified Personal Trainer" size="large" />
              </Form.Item>
            </Col>
          </Row>

          {/* PERUBAHAN DI SINI: Dua InputNumber terpisah untuk Tahun dan Bulan */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="years_of_experience"
                label="Years of Experience"
                rules={[{ required: true, message: "Please enter years" }]}
                initialValue={0} // Default value
              >
                <InputNumber min={0} placeholder="Years" style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="months_of_experience"
                label="Months of Experience"
                rules={[{ required: true, message: "Please enter months" }]}
                initialValue={0} // Default value
              >
                <InputNumber min={0} max={11} placeholder="Months" style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
          </Row>
          {/* AKHIR PERUBAHAN */}
        </Form>
      </Modal>
    </div>
  )
}
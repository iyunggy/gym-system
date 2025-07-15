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
import { authenticatedFetch } from "@/lib/api"

const { Title, Paragraph } = Typography
const { Search } = Input

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingTrainer, setEditingTrainer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchTrainers()
  }, [])

  const fetchTrainers = async () => {
    setLoading(true)
    try {
      const data = await authenticatedFetch("/personal-trainers/")
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
      message.error("Error fetching trainers: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: "Trainer",
      dataIndex: "nama", // Diubah dari 'name' ke 'nama'
      key: "nama",
      render: (text, record) => (
        <Space>
          <Avatar style={{ backgroundColor: "#722ed1" }}>{text.charAt(0).toUpperCase()}</Avatar>
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
          <div>{email}</div>
          <div style={{ color: "#666", fontSize: "12px" }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: "Certification",
      dataIndex: "sertifikasi", // Diubah dari 'certification' ke 'sertifikasi'
      key: "sertifikasi",
      ellipsis: true,
    },
    {
      title: "Experience (Months)", // Diubah dari 'Years' ke 'Months'
      dataIndex: "masa_kerja", // Diubah dari 'years_of_experience' ke 'masa_kerja'
      key: "masa_kerja",
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
              onClick={() => handleDelete(record.id_pt)}
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
    form.setFieldsValue({
      ...record,
      // Mapping field dari backend ke nama field di form frontend
      nama: record.nama,
      email: record.email,
      phone: record.phone,
      sertifikasi: record.sertifikasi,
      masa_kerja: record.masa_kerja, // Sesuaikan dengan nama field di form
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
          await authenticatedFetch(`/personal-trainers/${id_pt}/`, { method: "DELETE" })
          message.success("Personal trainer deleted successfully!")
          fetchTrainers()
        } catch (error) {
          message.error("Error deleting trainer: " + error.message)
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

      const trainerData = {
        // Pastikan nama field sesuai dengan model Django Anda
        nama: values.nama,
        email: values.email,
        phone: values.phone,
        sertifikasi: values.sertifikasi,
        masa_kerja: values.masa_kerja, // Sesuaikan dengan nama field di form
      }

      let response
      if (editingTrainer) {
        await authenticatedFetch(`/personal-trainers/${editingTrainer.id_pt}/`, {
          method: "PUT",
          body: JSON.stringify(trainerData),
        })
        message.success("Personal trainer updated successfully!")
      } else {
        await authenticatedFetch("/personal-trainers/", {
          method: "POST",
          body: JSON.stringify(trainerData),
        })
        message.success("Personal trainer added successfully!")
      }
      setIsModalVisible(false)
      form.resetFields()
      setEditingTrainer(null)
      fetchTrainers()
    } catch (error) {
      message.error("Operation failed: " + error.message)
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
              <Form.Item name="nama" label="Full Name" rules={[{ required: true, message: "Please enter full name" }]}>
                <Input placeholder="Enter full name" size="large" />
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
                name="sertifikasi" // Diubah dari 'certification' ke 'sertifikasi'
                label="Certification"
                rules={[{ required: true, message: "Please enter certification" }]}
              >
                <Input placeholder="e.g., NASM Certified Personal Trainer" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="masa_kerja" // Diubah dari 'yearsOfExperience' ke 'masa_kerja'
            label="Experience (Months)" // Label diubah
            rules={[{ required: true, message: "Please enter years of experience" }]}
          >
            <InputNumber min={0} placeholder="e.g., 60" style={{ width: "100%" }} size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

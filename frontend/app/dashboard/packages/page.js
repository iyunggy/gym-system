"use client"

import { useState, useEffect } from "react"
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
} from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons"
import { authenticatedFetch } from "@/lib/api" // Perbaikan: Import dari "@/lib/api"

const { Title, Paragraph, Text } = Typography
const { Search } = Input

export default function PackagesPage() {
  const [packages, setPackages] = useState([])
  const [ptPrice, setPtPrice] = useState(0)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isPtPriceModalVisible, setIsPtPriceModalVisible] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchPackagesAndPtPrice()
  }, [])

  const fetchPackagesAndPtPrice = async () => {
    setLoading(true)
    try {
      const packagesData = await authenticatedFetch("/packages/")
      setPackages(packagesData)

      const ptPriceData = await authenticatedFetch("/pt-price/")
      setPtPrice(ptPriceData.ptPrice)
    } catch (error) {
      message.error("Error fetching data: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: "Package Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ color: "#666", fontSize: "12px" }}>{record.id_package}</div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Duration (Days)",
      dataIndex: "duration_days",
      key: "duration_days",
      align: "center",
    },
    {
      title: "Price (IDR)",
      dataIndex: "price",
      key: "price",
      render: (price) => `Rp ${Number.parseFloat(price).toLocaleString("id-ID")}`,
      align: "right",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Tooltip title="Edit Package">
            <Button type="text" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete Package">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDelete(record.id_package)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const handleAdd = () => {
    setEditingPackage(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingPackage(record)
    form.setFieldsValue({
      ...record,
      durationDays: record.duration_days,
    })
    setIsModalVisible(true)
  }

  const handleDelete = async (id_package) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this package?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        setLoading(true)
        try {
          await authenticatedFetch(`/packages/${id_package}/`, { method: "DELETE" })
          message.success("Package deleted successfully!")
          fetchPackagesAndPtPrice()
        } catch (error) {
          message.error("Error deleting package: " + error.message)
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

      const packageData = {
        ...values,
        duration_days: values.durationDays,
      }

      let response
      if (editingPackage) {
        await authenticatedFetch(`/packages/${editingPackage.id_package}/`, {
          method: "PUT",
          body: JSON.stringify(packageData),
        })
        message.success("Package updated successfully!")
      } else {
        await authenticatedFetch("/packages/", { method: "POST", body: JSON.stringify(packageData) })
        message.success("Package added successfully!")
      }
      setIsModalVisible(false)
      form.resetFields()
      setEditingPackage(null)
      fetchPackagesAndPtPrice()
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
    setEditingPackage(null)
  }

  const handlePtPriceModalOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      await authenticatedFetch("/pt-price/", { method: "PUT", body: JSON.stringify({ newPrice: values.ptPrice }) })
      message.success("Personal Trainer price updated successfully!")
      setIsPtPriceModalVisible(false)
      fetchPackagesAndPtPrice()
    } catch (error) {
      message.error("Error updating PT price: " + error.message)
      console.log("Validation failed or API error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePtPriceModalCancel = () => {
    setIsPtPriceModalVisible(false)
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Packages & Promos Management</Title>
        <Paragraph>Manage your gym membership packages and personal trainer pricing.</Paragraph>
      </div>

      {/* PT Price Card */}
      <Card title="Personal Trainer Pricing" className="gym-card" style={{ marginBottom: "24px" }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <Paragraph style={{ margin: 0, fontSize: "1.1em" }}>
                Current PT Session Price: <Text strong>Rp {ptPrice.toLocaleString("id-ID")}</Text>
              </Paragraph>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                form.setFieldsValue({ ptPrice: ptPrice })
                setIsPtPriceModalVisible(true)
              }}
            >
              Edit PT Price
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Packages Table */}
      <Card title="Membership Packages" className="gym-card">
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col xs={24} sm={12}>
            <Search placeholder="Search packages..." prefix={<SearchOutlined />} allowClear size="large" />
          </Col>
          <Col xs={24} sm={6}>
            <Button icon={<ReloadOutlined />} size="large" style={{ width: "100%" }} onClick={fetchPackagesAndPtPrice}>
              Refresh
            </Button>
          </Col>
          <Col xs={24} sm={6}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" style={{ width: "100%" }}>
              Add Package
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={packages}
          pagination={{
            total: packages.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} packages`,
          }}
          scroll={{ x: 800 }}
          className="gym-table"
          loading={loading}
          rowKey="id_package"
        />
      </Card>

      {/* Add/Edit Package Modal */}
      <Modal
        title={editingPackage ? "Edit Package" : "Add New Package"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        confirmLoading={loading}
        okText={editingPackage ? "Update Package" : "Add Package"}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" name="packageForm">
          <Form.Item
            name="name"
            label="Package Name"
            rules={[{ required: true, message: "Please enter package name" }]}
          >
            <Input placeholder="e.g., Basic Package" size="large" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter package description" }]}
          >
            <Input.TextArea rows={3} placeholder="Describe package features" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="durationDays"
                label="Duration (Days)"
                rules={[{ required: true, message: "Please enter duration" }]}
              >
                <InputNumber min={1} placeholder="e.g., 30" style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="price" label="Price (IDR)" rules={[{ required: true, message: "Please enter price" }]}>
                <InputNumber
                  min={0}
                  formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value.replace(/Rp\s?|(,*)/g, "")}
                  placeholder="e.g., 150000"
                  style={{ width: "100%" }}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Edit PT Price Modal */}
      <Modal
        title="Edit Personal Trainer Price"
        open={isPtPriceModalVisible}
        onOk={handlePtPriceModalOk}
        onCancel={handlePtPriceModalCancel}
        width={400}
        confirmLoading={loading}
        okText="Update Price"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" name="ptPriceForm">
          <Form.Item
            name="ptPrice"
            label="Price per PT Session (IDR)"
            rules={[{ required: true, message: "Please enter PT session price" }]}
          >
            <InputNumber
              min={0}
              formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/Rp\s?|(,*)/g, "")}
              placeholder="e.g., 75000"
              style={{ width: "100%" }}
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

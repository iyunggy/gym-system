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
  Select,
  Tag,
  Switch,
} from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons"
import { API_PRODUK } from "@/utils/endPoint"

const { Title, Paragraph, Text } = Typography
const { Search } = Input
const { Option } = Select

export default function PackagesPage() {
  const [packages, setPackages] = useState([])
  const [ptPrice, setPtPrice] = useState(0)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isPtPriceModalVisible, setIsPtPriceModalVisible] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  // Package choices sesuai dengan model Django
  const PAKET_CHOICES = [
    { value: "Stater Pack", label: "Stater Pack" },
    { value: "Power Boost", label: "Power Boost" },
    { value: "Ultimate Transform", label: "Ultimate Transform" },
  ]

  useEffect(() => {
    fetchPackagesAndPtPrice()
  }, [])

  const fetchPackagesAndPtPrice = async () => {
    setLoading(true)
    try {
      const authToken = localStorage.getItem("authToken")

      // Fetch packages
      const packagesResponse = await fetch(API_PRODUK, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Authorization: `Token ${authToken}` }),
        },
      })

      if (!packagesResponse.ok) {
        throw new Error(`HTTP error! status: ${packagesResponse.status}`)
      }

      const packagesData = await packagesResponse.json()

      // Handle DRF pagination or direct array
      if (packagesData && typeof packagesData === "object" && Array.isArray(packagesData.results)) {
        setPackages(packagesData.results)
      } else if (Array.isArray(packagesData)) {
        setPackages(packagesData)
      } else {
        setPackages([])
      }

      // Fetch PT price
      try {
        const ptPriceResponse = await fetch("/api/pt-price/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Token ${authToken}` }),
          },
        })

        if (ptPriceResponse.ok) {
          const ptPriceData = await ptPriceResponse.json()
          setPtPrice(ptPriceData.ptPrice || 0)
        }
      } catch (ptError) {
        console.warn("PT Price not available:", ptError.message)
        setPtPrice(0)
      }
    } catch (error) {
      message.error("Error fetching data: " + error.message)
      setPackages([])
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: "Package Name",
      dataIndex: "nama_paket", // Sesuai dengan model Django
      key: "nama_paket",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ color: "#666", fontSize: "12px" }}>ID: {record.id}</div>
        </div>
      ),
    },
    {
      title: "Package Features",
      dataIndex: "fitur_paket", // Sesuai dengan model Django
      key: "fitur_paket",
      render: (features) => {
        if (!features || !Array.isArray(features) || features.length === 0) {
          return <Text type="secondary">No features</Text>
        }
        return (
          <div>
            {features.slice(0, 3).map((feature, index) => (
              <Tag key={index} color="blue" style={{ marginBottom: "4px", marginRight: "4px" }}>
                {feature}
              </Tag>
            ))}
            {features.length > 3 && (
              <Tag color="default" style={{ marginBottom: "4px" }}>
                +{features.length - 3} more
              </Tag>
            )}
          </div>
        )
      },
    },
    {
      title: "Duration (Days)",
      dataIndex: "durasi_hari", // Sesuai dengan model Django
      key: "durasi_hari",
      align: "center",
    },
    {
      title: "Price (IDR)",
      dataIndex: "harga", // Sesuai dengan model Django
      key: "harga",
      render: (price) => `Rp ${Number.parseFloat(price).toLocaleString("id-ID")}`,
      align: "right",
    },
    {
      title: "Status",
      dataIndex: "is_active", // Sesuai dengan model Django
      key: "is_active",
      render: (isActive) => <Tag color={isActive ? "green" : "red"}>{isActive ? "Active" : "Inactive"}</Tag>,
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
            <Button type="text" icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} />
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
      nama_paket: record.nama_paket,
      fitur_paket: record.fitur_paket || [],
      harga: record.harga,
      durasi_hari: record.durasi_hari,
      is_active: record.is_active,
    })
    setIsModalVisible(true)
  }

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this package?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        setLoading(true)
        try {
          const authToken = localStorage.getItem("authToken")

          const response = await fetch(`${API_PRODUK}${id}/`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...(authToken && { Authorization: `Token ${authToken}` }),
            },
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

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
        nama_paket: values.nama_paket,
        fitur_paket: values.fitur_paket || [],
        harga: values.harga,
        durasi_hari: values.durasi_hari,
        is_active: values.is_active !== undefined ? values.is_active : true,
      }

      const authToken = localStorage.getItem("authToken")

      let response
      if (editingPackage) {
        response = await fetch(`${API_PRODUK}${editingPackage.id}/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Token ${authToken}` }),
          },
          body: JSON.stringify(packageData),
        })
        message.success("Package updated successfully!")
      } else {
        response = await fetch(API_PRODUK, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Token ${authToken}` }),
          },
          body: JSON.stringify(packageData),
        })
        message.success("Package added successfully!")
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
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

      const authToken = localStorage.getItem("authToken")

      const response = await fetch("/api/pt-price/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Authorization: `Token ${authToken}` }),
        },
        body: JSON.stringify({ newPrice: values.ptPrice }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

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
          rowKey="id"
        />
      </Card>

      {/* Add/Edit Package Modal */}
      <Modal
        title={editingPackage ? "Edit Package" : "Add New Package"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
        confirmLoading={loading}
        okText={editingPackage ? "Update Package" : "Add Package"}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" name="packageForm">
          <Form.Item
            name="nama_paket"
            label="Package Name"
            rules={[{ required: true, message: "Please select package name" }]}
          >
            <Select placeholder="Select package name" size="large">
              {PAKET_CHOICES.map((choice) => (
                <Option key={choice.value} value={choice.value}>
                  {choice.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="fitur_paket"
            label="Package Features"
            rules={[{ required: true, message: "Please add at least one feature" }]}
            help="Add package features (press Enter to add each feature)"
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Add package features (e.g., Akses gym 24/7, Locker gratis, etc.)"
              size="large"
              tokenSeparators={[","]}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="durasi_hari"
                label="Duration (Days)"
                rules={[{ required: true, message: "Please enter duration" }]}
              >
                <InputNumber min={1} placeholder="e.g., 30" style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="harga" label="Price (IDR)" rules={[{ required: true, message: "Please enter price" }]}>
                <InputNumber
                  min={0}
                  formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value.replace(/Rp\s?|(,*)/g, "")}
                  placeholder="e.g., 299000"
                  style={{ width: "100%" }}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="is_active" valuePropName="checked" label="Is Active">
            <Switch defaultChecked />
          </Form.Item>
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

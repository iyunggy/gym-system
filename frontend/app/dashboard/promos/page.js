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
  DatePicker,
  Switch,
  Statistic,
  Alert,
  Badge,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  GiftOutlined,
  PercentageOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons"
import { API_PROMO, API_PRODUK } from "@/utils/endPoint"
import dayjs from "dayjs"

const { Title, Paragraph, Text } = Typography
const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input

export default function PromoManagement() {
  const [promos, setPromos] = useState([])
  const [packages, setPackages] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [form] = Form.useForm()

  useEffect(() => {
    fetchPromos()
    fetchPackages()
  }, [])

  const fetchPromos = async () => {
    setLoading(true)
    try {
      const authToken = localStorage.getItem("authToken")

      const response = await fetch(API_PROMO, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Authorization: `Token ${authToken}` }),
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("🚀 ~ fetchPromos ~ data:", data)

      if (data && typeof data === "object" && Array.isArray(data.results)) {
        setPromos(data.results)
      } else if (Array.isArray(data)) {
        setPromos(data)
      } else {
        setPromos([])
      }
    } catch (error) {
      message.error("Error fetching promos: " + error.message)
      setPromos([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPackages = async () => {
    try {
      const authToken = localStorage.getItem("authToken")

      const response = await fetch(API_PRODUK, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Authorization: `Token ${authToken}` }),
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data && typeof data === "object" && Array.isArray(data.results)) {
        setPackages(data.results)
      } else if (Array.isArray(data)) {
        setPackages(data)
      } else {
        setPackages([])
      }
    } catch (error) {
      console.warn("Error fetching packages:", error.message)
      setPackages([])
    }
  }

  // Get promo status with logic
  const getPromoStatus = (promo) => {
    const now = dayjs()
    const startDate = promo.tanggal_mulai ? dayjs(promo.tanggal_mulai) : null
    const endDate = promo.tanggal_berakhir ? dayjs(promo.tanggal_berakhir) : null

    if (!promo.is_active) {
      return { status: "inactive", color: "default", text: "Inactive" }
    }

    if (startDate && now.isBefore(startDate)) {
      return { status: "scheduled", color: "blue", text: "Scheduled" }
    }

    if (endDate && now.isAfter(endDate)) {
      return { status: "expired", color: "orange", text: "Expired" }
    }

    return { status: "active", color: "green", text: "Active" }
  }

  // Filter promos based on search and status
  const filteredPromos = promos.filter((promo) => {
    const matchesSearch =
      promo.nama_promo?.toLowerCase().includes(searchText.toLowerCase()) ||
      promo.id_promo?.toLowerCase().includes(searchText.toLowerCase()) ||
      promo.produk?.nama_paket?.toLowerCase().includes(searchText.toLowerCase())

    if (statusFilter === "all") return matchesSearch

    const promoStatus = getPromoStatus(promo)
    return matchesSearch && promoStatus.status === statusFilter
  })

  // Statistics
  const totalPromos = promos.length
  const activePromos = promos.filter((promo) => getPromoStatus(promo).status === "active").length
  const expiredPromos = promos.filter((promo) => getPromoStatus(promo).status === "expired").length
  const scheduledPromos = promos.filter((promo) => getPromoStatus(promo).status === "scheduled").length

  const columns = [
    {
      title: "Promo Details",
      key: "details",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "4px" }}>{record.nama_promo}</div>
          <div style={{ color: "#666", fontSize: "12px", marginBottom: "4px" }}>ID: {record.id_promo}</div>
          <div style={{ color: "#888", fontSize: "12px" }}>
            {record.deskripsi?.substring(0, 50)}
            {record.deskripsi?.length > 50 ? "..." : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Package",
      dataIndex: "produk",
      key: "produk",
      render: (produk, record) => (
        <div>
          <Tag color="blue" style={{ marginBottom: "4px" }}>
            {record?.product_detail?.nama_paket || "N/A"}
          </Tag>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record?.product_detail?.harga ? `Rp ${Number.parseFloat(record?.product_detail.harga).toLocaleString("id-ID")}` : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Discount",
      dataIndex: "diskon_persen",
      key: "diskon_persen",
      render: (discount, record) => {
        const originalPrice = record.produk?.harga || 0
        const discountAmount = (originalPrice * discount) / 100
        const finalPrice = originalPrice - discountAmount

        return (
          <div style={{ textAlign: "center" }}>
            <Tag color="red" icon={<PercentageOutlined />} style={{ fontSize: "14px", padding: "4px 8px" }}>
              {discount}% OFF
            </Tag>
            {originalPrice > 0 && (
              <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
                <div>Save: Rp {discountAmount.toLocaleString("id-ID")}</div>
                <div>Final: Rp {finalPrice.toLocaleString("id-ID")}</div>
              </div>
            )}
          </div>
        )
      },
      align: "center",
    },
    {
      title: "Period",
      key: "period",
      render: (text, record) => {
        const startDate = record.tanggal_mulai ? dayjs(record.tanggal_mulai) : null
        const endDate = record.tanggal_berakhir ? dayjs(record.tanggal_berakhir) : null
        const now = dayjs()

        return (
          <div>
            <div style={{ fontSize: "12px", marginBottom: "2px" }}>
              <CalendarOutlined style={{ marginRight: "4px", color: "#52c41a" }} />
              Start: {startDate ? startDate.format("DD/MM/YYYY") : "N/A"}
            </div>
            <div style={{ fontSize: "12px", marginBottom: "4px" }}>
              <CalendarOutlined style={{ marginRight: "4px", color: "#ff4d4f" }} />
              End: {endDate ? endDate.format("DD/MM/YYYY") : "N/A"}
            </div>
            {endDate && (
              <div style={{ fontSize: "11px", color: "#666" }}>
                {now.isBefore(endDate)
                  ? `${endDate.diff(now, "day")} days left`
                  : `Expired ${now.diff(endDate, "day")} days ago`}
              </div>
            )}
          </div>
        )
      },
    },
    {
      title: "Status",
      key: "status",
      render: (text, record) => {
        const statusInfo = getPromoStatus(record)
        const IconComponent =
          statusInfo.status === "active"
            ? CheckCircleOutlined
            : statusInfo.status === "expired"
              ? ExclamationCircleOutlined
              : statusInfo.status === "scheduled"
                ? CalendarOutlined
                : CloseCircleOutlined

        return (
          <Tag color={statusInfo.color} icon={<IconComponent />}>
            {statusInfo.text}
          </Tag>
        )
      },
      filters: [
        { text: "Active", value: "active" },
        { text: "Expired", value: "expired" },
        { text: "Scheduled", value: "scheduled" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value, record) => getPromoStatus(record).status === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Tooltip title="Edit Promo">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              style={{ color: "#1890ff" }}
            />
          </Tooltip>
          <Tooltip title="Delete Promo">
            <Button type="text" icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} />
          </Tooltip>
          <Tooltip title={record.is_active ? "Deactivate" : "Activate"}>
            <Button
              type="text"
              icon={record.is_active ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
              size="small"
              onClick={() => handleToggleStatus(record)}
              style={{ color: record.is_active ? "#ff4d4f" : "#52c41a" }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const handleAdd = () => {
    setEditingPromo(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingPromo(record)
    form.setFieldsValue({
      nama_promo: record.nama_promo,
      deskripsi: record.deskripsi,
      diskon_persen: Number.parseFloat(record.diskon_persen), // Convert to number for InputNumber
      produk: record.produk?.id,
      date_range:
        record.tanggal_mulai && record.tanggal_berakhir
          ? [dayjs(record.tanggal_mulai), dayjs(record.tanggal_berakhir)]
          : null,
      is_active: record.is_active,
    })
    setIsModalVisible(true)
  }

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this promo? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        setLoading(true)
        try {
          const authToken = localStorage.getItem("authToken")

          const response = await fetch(`${API_PROMO}${id}/`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...(authToken && { Authorization: `Token ${authToken}` }),
            },
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          message.success("Promo deleted successfully!")
          fetchPromos()
        } catch (error) {
          message.error("Error deleting promo: " + error.message)
        } finally {
          setLoading(false)
        }
      },
    })
  }

  const handleToggleStatus = async (record) => {
    setLoading(true)
    try {
      const authToken = localStorage.getItem("authToken")

      const response = await fetch(`${API_PROMO}${record.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Authorization: `Token ${authToken}` }),
        },
        body: JSON.stringify({ is_active: !record.is_active }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      message.success(`Promo ${!record.is_active ? "activated" : "deactivated"} successfully!`)
      fetchPromos()
    } catch (error) {
      message.error("Error updating promo status: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // Prepare data according to Django model fields
      const promoData = {
        nama_promo: values.nama_promo,
        deskripsi: values.deskripsi,
        diskon_persen: Number.parseFloat(values.diskon_persen), // Ensure it's a decimal
        produk: Number.parseInt(values.produk), // Ensure it's an integer for ForeignKey
        tanggal_mulai: values.date_range ? values.date_range[0].format("YYYY-MM-DD") : null,
        tanggal_berakhir: values.date_range ? values.date_range[1].format("YYYY-MM-DD") : null,
        is_active: values.is_active !== undefined ? values.is_active : true,
      }

      const authToken = localStorage.getItem("authToken")

      let response
      if (editingPromo) {
        response = await fetch(`${API_PROMO}${editingPromo.id}/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Token ${authToken}` }),
          },
          body: JSON.stringify(promoData),
        })
        message.success("Promo updated successfully!")
      } else {
        response = await fetch(API_PROMO, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Token ${authToken}` }),
          },
          body: JSON.stringify(promoData),
        })
        message.success("Promo created successfully!")
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(JSON.stringify(errorData))
      }

      setIsModalVisible(false)
      form.resetFields()
      setEditingPromo(null)
      fetchPromos()
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
    setEditingPromo(null)
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>
          <GiftOutlined style={{ marginRight: "12px", color: "#1890ff" }} />
          Promo Management
        </Title>
        <Paragraph>Manage promotional campaigns and discounts for your gym membership packages.</Paragraph>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card className="gym-card">
            <Statistic
              title="Total Promos"
              value={totalPromos}
              prefix={<GiftOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="gym-card">
            <Statistic
              title="Active Promos"
              value={activePromos}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="gym-card">
            <Statistic
              title="Scheduled"
              value={scheduledPromos}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="gym-card">
            <Statistic
              title="Expired"
              value={expiredPromos}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Active Promos Alert */}
      {activePromos > 0 && (
        <Alert
          message={`You have ${activePromos} active promo${activePromos > 1 ? "s" : ""} running`}
          description="Monitor your active promotions to ensure they're performing well."
          type="success"
          showIcon
          style={{ marginBottom: "24px" }}
          closable
        />
      )}

      {/* Main Content */}
      <Card title="Promotional Campaigns" className="gym-card">
        {/* Filters and Actions */}
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search promos, packages..."
              prefix={<SearchOutlined />}
              allowClear
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Filter Status"
              size="large"
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">All Status</Option>
              <Option value="active">
                <Badge status="success" text="Active" />
              </Option>
              <Option value="scheduled">
                <Badge status="processing" text="Scheduled" />
              </Option>
              <Option value="expired">
                <Badge status="warning" text="Expired" />
              </Option>
              <Option value="inactive">
                <Badge status="default" text="Inactive" />
              </Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Button
              icon={<ReloadOutlined />}
              size="large"
              style={{ width: "100%" }}
              onClick={fetchPromos}
              loading={loading}
            >
              Refresh
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" style={{ width: "100%" }}>
              Create New Promo
            </Button>
          </Col>
        </Row>

        {/* Promos Table */}
        <Table
          columns={columns}
          dataSource={filteredPromos}
          pagination={{
            total: filteredPromos.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} promos`,
          }}
          scroll={{ x: 1000 }}
          className="gym-table"
          loading={loading}
          rowKey="id"
          rowClassName={(record) => {
            const status = getPromoStatus(record)
            return status.status === "active" ? "active-row" : ""
          }}
        />
      </Card>

      {/* Add/Edit Promo Modal */}
      <Modal
        title={
          <span>
            <GiftOutlined style={{ marginRight: "8px" }} />
            {editingPromo ? "Edit Promo Campaign" : "Create New Promo Campaign"}
          </span>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        confirmLoading={loading}
        okText={editingPromo ? "Update Promo" : "Create Promo"}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" name="promoForm">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nama_promo"
                label="Promo Name"
                rules={[
                  { required: true, message: "Please enter promo name" },
                  { max: 100, message: "Promo name cannot exceed 100 characters" },
                ]}
              >
                <Input placeholder="e.g., New Year Special 2024" size="large" prefix={<GiftOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="produk"
                label="Target Package"
                rules={[{ required: true, message: "Please select package" }]}
              >
                <Select placeholder="Select package to apply discount" size="large" showSearch>
                  {packages.map((pkg) => (
                    <Option key={pkg.id} value={pkg.id}>
                      <div>
                        <div>{pkg.nama_paket}</div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          Rp {Number.parseFloat(pkg.harga).toLocaleString("id-ID")}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="deskripsi"
            label="Promo Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea
              rows={3}
              placeholder="Describe the promo details, terms, and conditions..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="diskon_persen"
                label="Discount Percentage"
                rules={[
                  { required: true, message: "Please enter discount percentage" },
                  { type: "number", min: 0, max: 100, message: "Discount must be between 0-100%" },
                ]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.01} // Allow decimal values
                  formatter={(value) => `${value}%`}
                  parser={(value) => value.replace("%", "")}
                  placeholder="e.g., 25.50"
                  style={{ width: "100%" }}
                  size="large"
                  prefix={<PercentageOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_active" valuePropName="checked" label="Promo Status">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" size="default" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="date_range"
            label="Promo Campaign Period"
            rules={[{ required: true, message: "Please select promo period" }]}
          >
            <RangePicker
              style={{ width: "100%" }}
              size="large"
              format="DD/MM/YYYY"
              placeholder={["Campaign Start Date", "Campaign End Date"]}
              disabledDate={(current) => current && current < dayjs().startOf("day")}
            />
          </Form.Item>

          {/* Preview Section */}
          {form.getFieldValue("produk") && form.getFieldValue("diskon_persen") && (
            <Card size="small" title="Promo Preview" style={{ backgroundColor: "#f8f9fa", marginTop: "16px" }}>
              {(() => {
                const selectedPackage = packages.find((pkg) => pkg.id === form.getFieldValue("produk"))
                const discount = form.getFieldValue("diskon_persen") || 0
                const originalPrice = selectedPackage?.harga || 0
                const discountAmount = (originalPrice * discount) / 100
                const finalPrice = originalPrice - discountAmount

                return (
                  <Row gutter={16}>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "12px", color: "#666" }}>Original Price</div>
                        <div style={{ fontSize: "16px", textDecoration: "line-through", color: "#999" }}>
                          Rp {originalPrice.toLocaleString("id-ID")}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "12px", color: "#666" }}>You Save</div>
                        <div style={{ fontSize: "16px", color: "#52c41a", fontWeight: "bold" }}>
                          Rp {discountAmount.toLocaleString("id-ID")}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "12px", color: "#666" }}>Final Price</div>
                        <div style={{ fontSize: "18px", color: "#1890ff", fontWeight: "bold" }}>
                          Rp {finalPrice.toLocaleString("id-ID")}
                        </div>
                      </div>
                    </Col>
                  </Row>
                )
              })()}
            </Card>
          )}
        </Form>
      </Modal>

      <style jsx>{`
        .active-row {
          background-color: #f6ffed !important;
        }
        .gym-card {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .gym-table .ant-table-thead > tr > th {
          background-color: #fafafa;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}

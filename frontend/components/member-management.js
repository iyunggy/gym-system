"use client"

import { useState } from "react"
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Avatar,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  DatePicker,
  message,
  Tooltip,
} from "antd"
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons"

const { Search } = Input
const { Option } = Select

export default function MemberManagement() {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  // Sample data - In real app, this would come from API
  const memberData = [
    {
      key: "1",
      id: "MBR001",
      name: "John Doe",
      email: "john@example.com",
      phone: "+62812345678",
      package: "Premium",
      status: "Active",
      joinDate: "2024-01-15",
      expiryDate: "2024-07-15",
      avatar: "J",
      address: "Jl. Sudirman No. 123, Jakarta",
    },
    {
      key: "2",
      id: "MBR002",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+62812345679",
      package: "Basic",
      status: "Active",
      joinDate: "2024-02-01",
      expiryDate: "2024-08-01",
      avatar: "J",
      address: "Jl. Thamrin No. 456, Jakarta",
    },
    {
      key: "3",
      id: "MBR003",
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+62812345680",
      package: "Standard",
      status: "Expired",
      joinDate: "2023-12-01",
      expiryDate: "2024-06-01",
      avatar: "M",
      address: "Jl. Gatot Subroto No. 789, Jakarta",
    },
  ]

  const columns = [
    {
      title: "Member",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar style={{ backgroundColor: "#1890ff" }}>{record.avatar}</Avatar>
          <div>
            <div style={{ fontWeight: "bold" }}>{text}</div>
            <div style={{ color: "#666", fontSize: "12px" }}>{record.id}</div>
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
      title: "Package",
      dataIndex: "package",
      key: "package",
      render: (packageName) => {
        const colors = {
          Basic: "blue",
          Standard: "green",
          Premium: "gold",
        }
        return <Tag color={colors[packageName]}>{packageName}</Tag>
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>,
    },
    {
      title: "Membership Period",
      key: "period",
      render: (record) => (
        <div>
          <div style={{ fontSize: "12px" }}>
            <strong>Join:</strong> {record.joinDate}
          </div>
          <div style={{ fontSize: "12px" }}>
            <strong>Expires:</strong> {record.expiryDate}
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Edit Member">
            <Button type="text" icon={<EditOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Delete Member">
            <Button type="text" icon={<DeleteOutlined />} size="small" danger />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const handleAddMember = () => {
    setIsModalVisible(true)
  }

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        setLoading(true)
        // Simulate API call
        setTimeout(() => {
          console.log("New member data:", values)
          message.success("Member added successfully!")
          setIsModalVisible(false)
          form.resetFields()
          setLoading(false)
        }, 1000)
      })
      .catch((error) => {
        console.log("Validation failed:", error)
      })
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  return (
    <div className="fade-in">
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card className="gym-card">
            <Statistic title="Total Members" value={1234} prefix={<UserOutlined />} valueStyle={{ color: "#1890ff" }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="gym-card">
            <Statistic title="Active Members" value={1156} valueStyle={{ color: "#52c41a" }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="gym-card">
            <Statistic title="Expired Members" value={78} valueStyle={{ color: "#ff4d4f" }} />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card title="Member Management" className="gym-card">
        {/* Filters and Actions */}
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col xs={24} sm={8}>
            <Search placeholder="Search members..." prefix={<SearchOutlined />} allowClear size="large" />
          </Col>
          <Col xs={24} sm={5}>
            <Select placeholder="Filter by package" style={{ width: "100%" }} allowClear size="large">
              <Option value="basic">Basic</Option>
              <Option value="standard">Standard</Option>
              <Option value="premium">Premium</Option>
            </Select>
          </Col>
          <Col xs={24} sm={5}>
            <Select placeholder="Filter by status" style={{ width: "100%" }} allowClear size="large">
              <Option value="active">Active</Option>
              <Option value="expired">Expired</Option>
              <Option value="suspended">Suspended</Option>
            </Select>
          </Col>
          <Col xs={24} sm={3}>
            <Button icon={<ReloadOutlined />} size="large" style={{ width: "100%" }}>
              Refresh
            </Button>
          </Col>
          <Col xs={24} sm={3}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddMember}
              size="large"
              style={{ width: "100%" }}
            >
              Add Member
            </Button>
          </Col>
        </Row>

        {/* Members Table */}
        <Table
          columns={columns}
          dataSource={memberData}
          pagination={{
            total: memberData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} members`,
          }}
          scroll={{ x: 800 }}
          className="gym-table"
        />
      </Card>

      {/* Add Member Modal */}
      <Modal
        title="Add New Member"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
        confirmLoading={loading}
        okText="Add Member"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" name="addMemberForm">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true, message: "Please enter full name" }]}>
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
              <Form.Item name="package" label="Package" rules={[{ required: true, message: "Please select package" }]}>
                <Select placeholder="Select package" size="large">
                  <Option value="basic">Basic Package</Option>
                  <Option value="standard">Standard Package</Option>
                  <Option value="premium">Premium Package</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Address" rules={[{ required: true, message: "Please enter address" }]}>
            <Input.TextArea rows={3} placeholder="Enter full address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="birthPlace"
                label="Birth Place"
                rules={[{ required: true, message: "Please enter birth place" }]}
              >
                <Input placeholder="Birth place" size="large" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="birthDate"
                label="Birth Date"
                rules={[{ required: true, message: "Please select birth date" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Select birth date"
                  size="large"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
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
import dayjs from "dayjs"
import { authenticatedFetch } from "@/lib/api" // Perbaikan: Import dari "@/lib/api"

const { Search } = Input
const { Option } = Select

export default function MemberManagement() {
const [members, setMembers] = useState([])
const [isModalVisible, setIsModalVisible] = useState(false)
const [loading, setLoading] = useState(false)
const [form] = Form.useForm()
const [editingMember, setEditingMember] = useState(null)

useEffect(() => {
  fetchMembers()
}, [])

const fetchMembers = async () => {
  setLoading(true)
  try {
    const data = await authenticatedFetch("/members/")
    setMembers(data)
  } catch (error) {
    message.error("Error fetching members: " + error.message)
  } finally {
    setLoading(false)
  }
}

const columns = [
  {
    title: "Member",
    dataIndex: "name",
    key: "name",
    render: (text, record) => (
      <Space>
        <Avatar style={{ backgroundColor: "#1890ff" }}>{record.avatar || text.charAt(0).toUpperCase()}</Avatar>
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ color: "#666", fontSize: "12px" }}>{record.id_member}</div>
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
          <strong>Join:</strong> {record.join_date}
        </div>
        <div style={{ fontSize: "12px" }}>
          <strong>Expires:</strong> {record.expiry_date}
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
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => handleEditMember(record)} />
        </Tooltip>
        <Tooltip title="Delete Member">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeleteMember(record.id_member)}
          />
        </Tooltip>
      </Space>
    ),
  },
]

const handleAddMember = () => {
  setEditingMember(null)
  form.resetFields()
  setIsModalVisible(true)
}

const handleEditMember = (record) => {
  setEditingMember(record)
  form.setFieldsValue({
    ...record,
    birth_date: record.birth_date ? dayjs(record.birth_date) : null,
  })
  setIsModalVisible(true)
}

const handleDeleteMember = async (id_member) => {
  Modal.confirm({
    title: "Confirm Delete",
    content: "Are you sure you want to delete this member?",
    okText: "Delete",
    okType: "danger",
    onOk: async () => {
      setLoading(true)
      try {
        await authenticatedFetch(`/members/${id_member}/`, { method: "DELETE" })
        message.success("Member deleted successfully!")
        fetchMembers()
      } catch (error) {
        message.error("Error deleting member: " + error.message)
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

    const memberData = {
      ...values,
      birth_date: values.birth_date ? values.birth_date.format("YYYY-MM-DD") : null,
    }

    let response
    if (editingMember) {
      await authenticatedFetch(`/members/${editingMember.id_member}/`, {
        method: "PUT",
        body: JSON.stringify(memberData),
      })
      message.success("Member updated successfully!")
    } else {
      await authenticatedFetch("/members/", { method: "POST", body: JSON.stringify(memberData) })
      message.success("Member added successfully!")
    }

    setIsModalVisible(false)
    form.resetFields()
    setEditingMember(null)
    fetchMembers()
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
  setEditingMember(null)
}

const totalMembers = members.length
const activeMembers = members.filter((m) => m.status === "Active").length
const expiredMembers = members.filter((m) => m.status === "Expired").length

return (
  <div className="fade-in">
    {/* Statistics */}
    <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
      <Col xs={24} sm={8}>
        <Card className="gym-card">
          <Statistic
            title="Total Members"
            value={totalMembers}
            prefix={<UserOutlined />}
            valueStyle={{ color: "#1890ff" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card className="gym-card">
          <Statistic title="Active Members" value={activeMembers} valueStyle={{ color: "#52c41a" }} />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card className="gym-card">
          <Statistic title="Expired Members" value={expiredMembers} valueStyle={{ color: "#ff4d4f" }} />
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
            <Option value="Basic">Basic</Option>
            <Option value="Standard">Standard</Option>
            <Option value="Premium">Premium</Option>
          </Select>
        </Col>
        <Col xs={24} sm={5}>
          <Select placeholder="Filter by status" style={{ width: "100%" }} allowClear size="large">
            <Option value="Active">Active</Option>
            <Option value="Expired">Expired</Option>
            <Option value="Suspended">Suspended</Option>
          </Select>
        </Col>
        <Col xs={24} sm={3}>
          <Button icon={<ReloadOutlined />} size="large" style={{ width: "100%" }} onClick={fetchMembers}>
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
        dataSource={members}
        pagination={{
          total: members.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} members`,
        }}
        scroll={{ x: 800 }}
        className="gym-table"
        loading={loading}
        rowKey="id_member"
      />
    </Card>

    {/* Add Member Modal */}
    <Modal
      title={editingMember ? "Edit Member" : "Add New Member"}
      open={isModalVisible}
      onOk={handleModalOk}
      onCancel={handleModalCancel}
      width={700}
      confirmLoading={loading}
      okText={editingMember ? "Update Member" : "Add Member"}
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
                <Option value="Basic">Basic Package</Option>
                <Option value="Standard">Standard Package</Option>
                <Option value="Premium">Premium Package</Option>
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
              name="birth_place"
              label="Birth Place"
              rules={[{ required: true, message: "Please enter birth place" }]}
            >
              <Input placeholder="Birth place" size="large" />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item
              name="birth_date"
              label="Birth Date"
              rules={[{ required: true, message: "Please select birth date" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Select birth date"
                size="large"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  </div>
)
}

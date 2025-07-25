"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Avatar,
  Input,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  DatePicker,
  message,
  Tooltip,
  Switch,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  EyeOutlined, // Pastikan EyeOutlined sudah diimpor
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { API_MEMBERS } from "@/utils/endPoint";
import axios from "axios";

const { Search } = Input;

export default function MemberManagement() {
  const [members, setMembers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const getAuthHeaders = () => {
    const authToken = localStorage.getItem("authToken");
    return authToken ? { Authorization: `Token ${authToken}` } : {};
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_MEMBERS, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      const data = response.data;
      console.log("🚀 ~ fetchMembers ~ data:", data);

      if (data && typeof data === "object" && Array.isArray(data.results)) {
        setMembers(data.results);
      } else if (Array.isArray(data)) {
        setMembers(data);
      } else {
        console.warn(
          "Unexpected API response format for members, defaulting to empty array:",
          data
        );
        setMembers([]);
      }
    } catch (error) {
      message.error(
        "Error fetching members: " +
          (error.response?.data?.detail || error.message)
      );
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Member",
      key: "member_info",
      render: (text, record) => (
        <Space>
          <Avatar style={{ backgroundColor: "#1890ff" }}>
            {record.first_name?.charAt(0).toUpperCase() || "M"}
          </Avatar>
          <div>
            <div style={{ fontWeight: "bold" }}>
              {record.first_name} {record.last_name}
            </div>
            <div style={{ color: "#666", fontSize: "12px" }}>
              {record.profile?.id_member}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (text, record) => (
        <div>
          <div>{record.profile?.phone}</div>
          <div>{record.email}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>{isActive ? "Active" : "Inactive"}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Tooltip title="View Details">
            {/* PERUBAHAN UTAMA DI SINI: Panggil handleEditMember */}
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleEditMember(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Member">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditMember(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Member">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDeleteMember(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleAddMember = () => {
    setEditingMember(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditMember = (record) => {
    setEditingMember(record);
    form.setFieldsValue({
      first_name: record.first_name,
      last_name: record.last_name,
      email: record.email,
      phone: record.profile?.phone,
      alamat: record.profile?.address,
      tempat_lahir: record.profile?.tempat_lahir,
      birth_date: record.profile?.tanggal_lahir ? dayjs(record.profile.tanggal_lahir) : null,
      is_active: record.is_active,
    });
    setIsModalVisible(true);
  };

  const handleDeleteMember = async (userId) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this member? This will also delete their profile.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        setLoading(true);
        try {
          await axios.delete(`${API_MEMBERS}${userId}/`, {
            headers: getAuthHeaders(),
          });

          message.success("Member deleted successfully!");
          fetchMembers();
        } catch (error) {
          message.error(
            "Error deleting member: " +
              (error.response?.data?.detail || error.message)
          );
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

      const payload = {
        username: values.email,
        email: values.email,
        first_name: values.first_name,
        last_name: values.last_name,
        is_active: values.is_active !== undefined ? values.is_active : true,

        profile: {
          phone: values.phone,
          address: values.alamat,
          tempat_lahir: values.tempat_lahir,
          tanggal_lahir: values.birth_date ? values.birth_date.format("YYYY-MM-DD") : null,
          role: 'member'
        }
      };

      let response;
      if (editingMember) {
        response = await axios.put(
          `${API_MEMBERS}${editingMember.id}/`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          }
        );
        message.success("Member updated successfully!");
      } else {
        response = await axios.post(API_MEMBERS, payload, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        });
        message.success("Member added successfully!");
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingMember(null);
      fetchMembers();
    } catch (error) {
      let errorMessage = "Operation failed: ";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage += error.response.data;
        } else if (typeof error.response.data === 'object') {
          errorMessage += Object.values(error.response.data).flat().join('; ');
        }
      } else {
        errorMessage += error.message;
      }
      message.error(errorMessage);
      console.log("Validation failed or API error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingMember(null);
  };

  const totalMembers = Array.isArray(members) ? members.length : 0;
  const activeMembers = Array.isArray(members) ? members.filter((m) => m.is_active).length : 0;
  const inactiveMembers = Array.isArray(members) ? members.filter((m) => !m.is_active).length : 0;

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
            <Statistic title="Inactive Members" value={inactiveMembers} valueStyle={{ color: "#ff4d4f" }} />
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
            total: totalMembers,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} members`,
          }}
          scroll={{ x: 800 }}
          className="gym-table"
          loading={loading}
          rowKey={(record) => record.id}
        />
      </Card>

      {/* Add/Edit/View Member Modal */}
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
              <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Please enter first name" }]}>
                <Input placeholder="Enter first name" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Please enter last name" }]}>
                <Input placeholder="Enter last name" size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter email" size="large" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: "Please enter phone number" },
              {
                pattern: /^62\d{8,12}$/,
                message: "Phone number must start with '62' and be between 10-14 digits (e.g., 628123456789)",
              },
            ]}
          >
            <Input placeholder="e.g., 628123456789" size="large" />
          </Form.Item>
          <Form.Item name="alamat" label="Address" rules={[{ required: true, message: "Please enter address" }]}>
            <Input.TextArea rows={3} placeholder="Enter full address" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tempat_lahir"
                label="Birth Place"
                rules={[{ required: true, message: "Please enter birth place" }]}
              >
                <Input placeholder="Birth place" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
          {/* <Form.Item name="is_active" valuePropName="checked" label="Is Active">
            <Switch />
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
}
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
  Select,
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
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { authenticatedFetch } from "@/lib/api";

const { Search } = Input;
const { Option } = Select;

export default function MemberManagement() {
  const [members, setMembers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await authenticatedFetch("/members/");
      // Ensure data is an array, handling DRF pagination or direct array
      if (data && typeof data === "object" && Array.isArray(data.results)) {
        setMembers(data.results);
      } else if (Array.isArray(data)) {
        setMembers(data);
      } else {
        // If data is not an array or an object with a 'results' array, default to empty array
        console.warn(
          "Unexpected API response format for members, defaulting to empty array:",
          data
        );
        setMembers([]);
      }
    } catch (error) {
      message.error("Error fetching members: " + error.message);
      setMembers([]); // Ensure members is an array even on error
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Member",
      dataIndex: "nama", // Changed from 'name' to 'nama'
      key: "nama",
      render: (text, record) => (
        <Space>
          <Avatar style={{ backgroundColor: "#1890ff" }}>
            {text.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: "bold" }}>{text}</div>
            <div style={{ color: "#666", fontSize: "12px" }}>
              {record.id_member}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact", // Re-added Contact column
      dataIndex: "display_phone", // Assuming 'phone' field will be added to backend
      key: "contact",
      render: (phone) => (
        <div>
          <div>{phone}</div>
          {/* If email is also needed, it needs to be added to the backend model */}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active", // Changed from 'status' to 'is_active'
      key: "is_active",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record) => (
        <Space>
          <Tooltip title='View Details'>
            <Button type='text' icon={<EyeOutlined />} size='small' />
          </Tooltip>
          <Tooltip title='Edit Member'>
            <Button
              type='text'
              icon={<EditOutlined />}
              size='small'
              onClick={() => handleEditMember(record)}
            />
          </Tooltip>
          <Tooltip title='Delete Member'>
            <Button
              type='text'
              icon={<DeleteOutlined />}
              size='small'
              danger
              onClick={() => handleDeleteMember(record.id_member)}
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
      ...record,
      nama: record.nama,
      alamat: record.alamat,
      tempat_lahir: record.tempat_lahir,
      phone: record.phone, // Populate phone field
      // Reconstruct dayjs object from separate fields
      birth_date:
        record.tanggal_lahir && record.bulan_lahir && record.tahun_lahir
          ? dayjs(
              `${record.tahun_lahir}-${String(record.bulan_lahir).padStart(
                2,
                "0"
              )}-${String(record.tanggal_lahir).padStart(2, "0")}`
            )
          : null,
    });
    setIsModalVisible(true);
  };

  const handleDeleteMember = async (id_member) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this member?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        setLoading(true);
        try {
          await authenticatedFetch(`/members/${id_member}/`, {
            method: "DELETE",
          });
          message.success("Member deleted successfully!");
          fetchMembers();
        } catch (error) {
          message.error("Error deleting member: " + error.message);
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

      const memberData = {
        nama: values.nama,
        alamat: values.alamat,
        tempat_lahir: values.tempat_lahir,
        phone: values.phone, // Include phone in data sent to API
        tanggal_lahir: values.birth_date ? values.birth_date.date() : null,
        bulan_lahir: values.birth_date ? values.birth_date.month() + 1 : null, // month() is 0-indexed
        tahun_lahir: values.birth_date ? values.birth_date.year() : null,
        is_active: values.is_active !== undefined ? values.is_active : true,
      };

      let response;
      if (editingMember) {
        await authenticatedFetch(`/members/${editingMember.id_member}/`, {
          method: "PUT",
          body: JSON.stringify(memberData),
        });
        message.success("Member updated successfully!");
      } else {
        await authenticatedFetch("/members/", {
          method: "POST",
          body: JSON.stringify(memberData),
        });
        message.success("Member added successfully!");
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingMember(null);
      fetchMembers();
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
    setEditingMember(null);
  };

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.is_active).length;
  const inactiveMembers = members.filter((m) => !m.is_active).length;

  return (
    <div className='fade-in'>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card className='gym-card'>
            <Statistic
              title='Total Members'
              value={totalMembers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className='gym-card'>
            <Statistic
              title='Active Members'
              value={activeMembers}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className='gym-card'>
            <Statistic
              title='Inactive Members'
              value={inactiveMembers}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card title='Member Management' className='gym-card'>
        {/* Filters and Actions */}
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col xs={24} sm={8}>
            <Search
              placeholder='Search members...'
              prefix={<SearchOutlined />}
              allowClear
              size='large'
            />
          </Col>
          <Col xs={24} sm={3}>
            <Button
              icon={<ReloadOutlined />}
              size='large'
              style={{ width: "100%" }}
              onClick={fetchMembers}>
              Refresh
            </Button>
          </Col>
          <Col xs={24} sm={3}>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={handleAddMember}
              size='large'
              style={{ width: "100%" }}>
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
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} members`,
          }}
          scroll={{ x: 800 }}
          className='gym-table'
          loading={loading}
          rowKey='id_member'
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
        cancelText='Cancel'>
        <Form form={form} layout='vertical' name='addMemberForm'>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='nama'
                label='Full Name'
                rules={[{ required: true, message: "Please enter full name" }]}>
                <Input placeholder='Enter full name' size='large' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='phone'
                label='Phone Number'
                rules={[
                  { required: true, message: "Please enter phone number" },
                  {
                    pattern: /^62\d+$/, // Regex to start with '62' followed by digits
                    message:
                      "Phone number must start with '62' (e.g., 628123456789)",
                  },
                ]}>
                <Input placeholder='e.g., 628123456789' size='large' />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name='alamat'
            label='Address'
            rules={[{ required: true, message: "Please enter address" }]}>
            <Input.TextArea rows={3} placeholder='Enter full address' />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='tempat_lahir'
                label='Birth Place'
                rules={[
                  { required: true, message: "Please enter birth place" },
                ]}>
                <Input placeholder='Birth place' size='large' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='birth_date'
                label='Birth Date'
                rules={[
                  { required: true, message: "Please select birth date" },
                ]}>
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder='Select birth date'
                  size='large'
                  format='YYYY-MM-DD'
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name='is_active' valuePropName='checked' label='Is Active'>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

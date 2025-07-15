"use client"

import { useState, useEffect } from "react"
import {
Card,
Table,
Button,
Space,
Input,
Row,
Col,
Modal,
Form,
message,
Typography,
Tooltip,
Select,
TimePicker,
Tag,
} from "antd"
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
import { authenticatedFetch } from "@/lib/api" // Perbaikan: Import dari "@/lib/api"

const { Title, Paragraph } = Typography
const { Search } = Input
const { Option } = Select

export default function SchedulesPage() {
const [trainers, setTrainers] = useState([])
const [schedules, setSchedules] = useState([])
const [isModalVisible, setIsModalVisible] = useState(false)
const [editingSchedule, setEditingSchedule] = useState(null)
const [loading, setLoading] = useState(false)
const [form] = Form.useForm()

useEffect(() => {
  fetchTrainersAndSchedules()
}, [])

const fetchTrainersAndSchedules = async () => {
  setLoading(true)
  try {
    const trainersData = await authenticatedFetch("/personal-trainers/")
    setTrainers(trainersData)

    const schedulesData = await authenticatedFetch("/jadwal-pt/")
    setSchedules(schedulesData)
  } catch (error) {
    message.error("Error fetching data: " + error.message)
  } finally {
    setLoading(false)
  }
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const columns = [
  {
    title: "Trainer",
    dataIndex: "personal_trainer_name",
    key: "trainerName",
    render: (text, record) => (
      <div>
        <div style={{ fontWeight: "bold" }}>{text}</div>
        <div style={{ color: "#666", fontSize: "12px" }}>{record.personal_trainer}</div>
      </div>
    ),
  },
  {
    title: "Day of Week",
    dataIndex: "day_of_week",
    key: "day_of_week",
    render: (day) => <Tag color="blue">{day}</Tag>,
  },
  {
    title: "Time",
    key: "time",
    render: (text, record) => `${record.start_time} - ${record.end_time}`,
  },
  {
    title: "Actions",
    key: "actions",
    render: (text, record) => (
      <Space>
        <Tooltip title="Edit Schedule">
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
        </Tooltip>
        <Tooltip title="Delete Schedule">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.id_schedule)}
          />
        </Tooltip>
      </Space>
    ),
  },
]

const handleAdd = () => {
  setEditingSchedule(null)
  form.resetFields()
  setIsModalVisible(true)
}

const handleEdit = (record) => {
  setEditingSchedule(record)
  form.setFieldsValue({
    ...record,
    personal_trainer: record.personal_trainer,
    day_of_week: record.day_of_week,
    start_time: dayjs(record.start_time, "HH:mm"),
    end_time: dayjs(record.end_time, "HH:mm"),
  })
  setIsModalVisible(true)
}

const handleDelete = (id_schedule) => {
  Modal.confirm({
    title: "Confirm Delete",
    content: "Are you sure you want to delete this schedule?",
    okText: "Delete",
    okType: "danger",
    onOk: async () => {
      setLoading(true)
      try {
        await authenticatedFetch(`/jadwal-pt/${id_schedule}/`, { method: "DELETE" })
        message.success("Schedule deleted successfully!")
        fetchTrainersAndSchedules()
      } catch (error) {
        message.error("Error deleting schedule: " + error.message)
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

    const scheduleData = {
      personal_trainer: values.personal_trainer,
      day_of_week: values.day_of_week,
      start_time: values.start_time.format("HH:mm"),
      end_time: values.end_time.format("HH:mm"),
    }

    let response
    if (editingSchedule) {
      await authenticatedFetch(`/jadwal-pt/${editingSchedule.id_schedule}/`, {
        method: "PUT",
        body: JSON.stringify(scheduleData),
      })
      message.success("Schedule updated successfully!")
    } else {
      await authenticatedFetch("/jadwal-pt/", { method: "POST", body: JSON.stringify(scheduleData) })
      message.success("Schedule added successfully!")
    }
    setIsModalVisible(false)
    form.resetFields()
    setEditingSchedule(null)
    fetchTrainersAndSchedules()
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
  setEditingSchedule(null)
}

return (
  <div className="fade-in">
    <div style={{ marginBottom: "24px" }}>
      <Title level={2}>Personal Trainer Schedules</Title>
      <Paragraph>Manage the working hours and availability of your personal trainers.</Paragraph>
    </div>

    <Card title="Trainer Schedules List" className="gym-card">
      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        <Col xs={24} sm={12}>
          <Search placeholder="Search schedules..." prefix={<SearchOutlined />} allowClear size="large" />
        </Col>
        <Col xs={24} sm={6}>
          <Button
            icon={<ReloadOutlined />}
            size="large"
            style={{ width: "100%" }}
            onClick={fetchTrainersAndSchedules}
          >
            Refresh
          </Button>
        </Col>
        <Col xs={24} sm={6}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" style={{ width: "100%" }}>
            Add Schedule
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={schedules}
        pagination={{
          total: schedules.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} schedules`,
        }}
        scroll={{ x: 800 }}
        className="gym-table"
        loading={loading}
        rowKey="id_schedule"
      />
    </Card>

    {/* Add/Edit Schedule Modal */}
    <Modal
      title={editingSchedule ? "Edit Schedule" : "Add New Schedule"}
      open={isModalVisible}
      onOk={handleModalOk}
      onCancel={handleModalCancel}
      width={600}
      confirmLoading={loading}
      okText={editingSchedule ? "Update Schedule" : "Add Schedule"}
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical" name="scheduleForm">
        <Form.Item
          name="personal_trainer"
          label="Personal Trainer"
          rules={[{ required: true, message: "Please select a trainer" }]}
        >
          <Select placeholder="Select a trainer" size="large">
            {trainers.map((trainer) => (
              <Option key={trainer.id_pt} value={trainer.id_pt}>
                {trainer.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="day_of_week"
          label="Day of Week"
          rules={[{ required: true, message: "Please select a day" }]}
        >
          <Select placeholder="Select day of week" size="large">
            {daysOfWeek.map((day) => (
              <Option key={day} value={day}>
                {day}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="start_time"
              label="Start Time"
              rules={[{ required: true, message: "Please select start time" }]}
            >
              <TimePicker format="HH:mm" style={{ width: "100%" }} size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="end_time"
              label="End Time"
              rules={[{ required: true, message: "Please select end time" }]}
            >
              <TimePicker format="HH:mm" style={{ width: "100%" }} size="large" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  </div>
)
}

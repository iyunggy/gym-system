"use client"

import { useState, useEffect } from "react"
import {
  Card,
  Table,
  Button,
  Space,
  Row,
  Col,
  Modal,
  Form,
  message,
  Typography,
  Tooltip,
  Select,
  Tag,
  TimePicker,
  Statistic,
  Alert,
  Badge,
  Avatar,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons"
import { API_JADWALTRAINER, API_PERSONAL_TRAINER, API_TRAINERS } from "@/utils/endPoint"
import dayjs from "dayjs"

const { Title, Paragraph, Text } = Typography
const { Option } = Select

export default function TrainerScheduleManagement() {
  const [schedules, setSchedules] = useState([])
  const [trainers, setTrainers] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [loading, setLoading] = useState(false)
  const [trainerFilter, setTrainerFilter] = useState("all")
  const [dayFilter, setDayFilter] = useState("all")
  const [form] = Form.useForm()

  // Hari choices sesuai dengan model Django
  const HARI_CHOICES = [
    { value: "senin", label: "Senin", color: "#1890ff" },
    { value: "selasa", label: "Selasa", color: "#52c41a" },
    { value: "rabu", label: "Rabu", color: "#faad14" },
    { value: "kamis", label: "Kamis", color: "#f5222d" },
    { value: "jumat", label: "Jumat", color: "#722ed1" },
    { value: "sabtu", label: "Sabtu", color: "#fa8c16" },
    { value: "minggu", label: "Minggu", color: "#eb2f96" },
  ]

  useEffect(() => {
    fetchSchedules()
    fetchTrainers()
  }, [])

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const authToken = localStorage.getItem("authToken")

      const response = await fetch(API_JADWALTRAINER, {
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
        setSchedules(data.results)
      } else if (Array.isArray(data)) {
        setSchedules(data)
      } else {
        setSchedules([])
      }
    } catch (error) {
      message.error("Error fetching schedules: " + error.message)
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTrainers = async () => {
    try {
      const authToken = localStorage.getItem("authToken")

      const response = await fetch(API_PERSONAL_TRAINER, {
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
        setTrainers(data.results)
      } else if (Array.isArray(data)) {
        setTrainers(data)
      } else {
        setTrainers([])
      }
    } catch (error) {
      console.warn("Error fetching trainers:", error.message)
      setTrainers([])
    }
  }

  // Get day color
  const getDayColor = (day) => {
    const dayChoice = HARI_CHOICES.find((choice) => choice.value === day)
    return dayChoice ? dayChoice.color : "#1890ff"
  }

  // Get day label
  const getDayLabel = (day) => {
    const dayChoice = HARI_CHOICES.find((choice) => choice.value === day)
    return dayChoice ? dayChoice.label : day
  }

  // Filter schedules
  const filteredSchedules = schedules.filter((schedule) => {
    const matchesTrainer = trainerFilter === "all" || schedule.pt?.id === Number.parseInt(trainerFilter)
    const matchesDay = dayFilter === "all" || schedule.hari === dayFilter
    return matchesTrainer && matchesDay
  })

  // Statistics
  const totalSchedules = schedules.length
  const activeTrainers = [...new Set(schedules.map((s) => s.pt?.id))].length
  const todaySchedules = schedules.filter((s) => {
    const today = dayjs().format("dddd").toLowerCase()
    const dayMapping = {
      sunday: "minggu",
      monday: "senin",
      tuesday: "selasa",
      wednesday: "rabu",
      thursday: "kamis",
      friday: "jumat",
      saturday: "sabtu",
    }
    return s.hari === dayMapping[today]
  }).length

  const columns = [
    {
      title: "Personal Trainer",
      key: "trainer",
      render: (text, record) => (
        <Space>
          <Avatar style={{ backgroundColor: "#1890ff" }}>
            {record.pt?.first_name?.charAt(0) || record.pt?.username?.charAt(0) || "T"}
          </Avatar>
          <div>
            <div style={{ fontWeight: "bold" }}>
              {record.pt?.first_name && record.pt?.last_name
                ? `${record.pt.first_name} ${record.pt.last_name}`
                : record.pt?.username || "Unknown Trainer"}
            </div>
            <div style={{ color: "#666", fontSize: "12px" }}>ID: {record.pt?.id || "N/A"}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Hari",
      dataIndex: "hari",
      key: "hari",
      render: (day) => (
        <Tag color={getDayColor(day)} style={{ fontWeight: "bold" }}>
          {getDayLabel(day)}
        </Tag>
      ),
      filters: HARI_CHOICES.map((choice) => ({
        text: choice.label,
        value: choice.value,
      })),
      onFilter: (value, record) => record.hari === value,
    },
    {
      title: "Waktu Tersedia",
      key: "waktu",
      render: (text, record) => {
        const dari = record.tersedia_dari ? dayjs(record.tersedia_dari, "HH:mm:ss") : null
        const akhir = record.tersedia_akhir ? dayjs(record.tersedia_akhir, "HH:mm:ss") : null

        return (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>
              <ClockCircleOutlined style={{ marginRight: "4px", color: "#52c41a" }} />
              {dari ? dari.format("HH:mm") : "N/A"} - {akhir ? akhir.format("HH:mm") : "N/A"}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {dari && akhir ? `${akhir.diff(dari, "hour")} jam ${akhir.diff(dari, "minute") % 60} menit` : ""}
            </div>
          </div>
        )
      },
      sorter: (a, b) => {
        const timeA = a.tersedia_dari || "00:00:00"
        const timeB = b.tersedia_dari || "00:00:00"
        return timeA.localeCompare(timeB)
      },
    },
    {
      title: "Status",
      key: "status",
      render: (text, record) => {
        const now = dayjs()
        const currentTime = now.format("HH:mm:ss")
        const currentDay = now.format("dddd").toLowerCase()
        const dayMapping = {
          sunday: "minggu",
          monday: "senin",
          tuesday: "selasa",
          wednesday: "rabu",
          thursday: "kamis",
          friday: "jumat",
          saturday: "sabtu",
        }

        const isToday = record.hari === dayMapping[currentDay]
        const isAvailableNow =
          isToday &&
          record.tersedia_dari &&
          record.tersedia_akhir &&
          currentTime >= record.tersedia_dari &&
          currentTime <= record.tersedia_akhir

        return (
          <Tag
            color={isAvailableNow ? "green" : isToday ? "orange" : "default"}
            icon={isAvailableNow ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
          >
            {isAvailableNow ? "Available Now" : isToday ? "Not Available" : "Scheduled"}
          </Tag>
        )
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Tooltip title="Edit Schedule">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              style={{ color: "#1890ff" }}
            />
          </Tooltip>
          <Tooltip title="Delete Schedule">
            <Button type="text" icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} />
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
      pt: record.pt?.id,
      hari: record.hari,
      tersedia_dari: record.tersedia_dari ? dayjs(record.tersedia_dari, "HH:mm:ss") : null,
      tersedia_akhir: record.tersedia_akhir ? dayjs(record.tersedia_akhir, "HH:mm:ss") : null,
    })
    setIsModalVisible(true)
  }

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this schedule? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        setLoading(true)
        try {
          const authToken = localStorage.getItem("authToken")

          const response = await fetch(`${API_JADWALTRAINER}${id}/`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...(authToken && { Authorization: `Token ${authToken}` }),
            },
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          message.success("Schedule deleted successfully!")
          fetchSchedules()
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

      // Prepare data according to Django model fields
      const scheduleData = {
        pt: Number.parseInt(values.pt), // ForeignKey to User
        hari: values.hari,
        tersedia_dari: values.tersedia_dari ? values.tersedia_dari.format("HH:mm:ss") : null,
        tersedia_akhir: values.tersedia_akhir ? values.tersedia_akhir.format("HH:mm:ss") : null,
      }

      const authToken = localStorage.getItem("authToken")

      let response
      if (editingSchedule) {
        response = await fetch(`${API_JADWALTRAINER}${editingSchedule.id}/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Token ${authToken}` }),
          },
          body: JSON.stringify(scheduleData),
        })
        message.success("Schedule updated successfully!")
      } else {
        response = await fetch(API_JADWALTRAINER, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Token ${authToken}` }),
          },
          body: JSON.stringify(scheduleData),
        })
        message.success("Schedule created successfully!")
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(JSON.stringify(errorData))
      }

      setIsModalVisible(false)
      form.resetFields()
      setEditingSchedule(null)
      fetchSchedules()
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
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>
          <CalendarOutlined style={{ marginRight: "12px", color: "#1890ff" }} />
          Trainer Schedule Management
        </Title>
        <Paragraph>Manage personal trainer availability schedules and working hours.</Paragraph>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card className="gym-card">
            <Statistic
              title="Total Schedules"
              value={totalSchedules}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="gym-card">
            <Statistic
              title="Active Trainers"
              value={activeTrainers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="gym-card">
            <Statistic
              title="Today's Schedules"
              value={todaySchedules}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Today's Available Trainers Alert */}
      {todaySchedules > 0 && (
        <Alert
          message={`${todaySchedules} trainer${todaySchedules > 1 ? "s are" : " is"} scheduled for today`}
          description="Check current availability and manage trainer schedules effectively."
          type="info"
          showIcon
          style={{ marginBottom: "24px" }}
          closable
        />
      )}

      {/* Main Content */}
      <Card title="Trainer Schedules" className="gym-card">
        {/* Filters and Actions */}
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by Trainer"
              size="large"
              style={{ width: "100%" }}
              value={trainerFilter}
              onChange={setTrainerFilter}
              allowClear
            >
              <Option value="all">All Trainers</Option>
              {trainers.map((trainer) => (
                <Option key={trainer.id} value={trainer.id}>
                  <Space>
                    <Avatar size="small" style={{ backgroundColor: "#1890ff" }}>
                      {trainer.first_name?.charAt(0) || trainer.username?.charAt(0) || "T"}
                    </Avatar>
                    {trainer.first_name && trainer.last_name
                      ? `${trainer.first_name} ${trainer.last_name}`
                      : trainer.username}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Filter by Day"
              size="large"
              style={{ width: "100%" }}
              value={dayFilter}
              onChange={setDayFilter}
              allowClear
            >
              <Option value="all">All Days</Option>
              {HARI_CHOICES.map((choice) => (
                <Option key={choice.value} value={choice.value}>
                  <Badge color={choice.color} text={choice.label} />
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Button
              icon={<ReloadOutlined />}
              size="large"
              style={{ width: "100%" }}
              onClick={fetchSchedules}
              loading={loading}
            >
              Refresh
            </Button>
          </Col>
          <Col xs={24} sm={10}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" style={{ width: "100%" }}>
              Add New Schedule
            </Button>
          </Col>
        </Row>

        {/* Schedules Table */}
        <Table
          columns={columns}
          dataSource={filteredSchedules}
          pagination={{
            total: filteredSchedules.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} schedules`,
          }}
          scroll={{ x: 1000 }}
          className="gym-table"
          loading={loading}
          rowKey="id"
        />
      </Card>

      {/* Add/Edit Schedule Modal */}
      <Modal
        title={
          <span>
            <CalendarOutlined style={{ marginRight: "8px" }} />
            {editingSchedule ? "Edit Trainer Schedule" : "Add New Trainer Schedule"}
          </span>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        confirmLoading={loading}
        okText={editingSchedule ? "Update Schedule" : "Add Schedule"}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" name="scheduleForm">
          <Form.Item name="pt" label="Personal Trainer" rules={[{ required: true, message: "Please select trainer" }]}>
            <Select placeholder="Select personal trainer" size="large" showSearch>
              {trainers.map((trainer) => (
                <Option key={trainer.id} value={trainer.id}>
                  <Space>
                    <Avatar size="small" style={{ backgroundColor: "#1890ff" }}>
                      {trainer.first_name?.charAt(0) || trainer.username?.charAt(0) || "T"}
                    </Avatar>
                    <div>
                      <div>
                        {trainer.first_name && trainer.last_name
                          ? `${trainer.first_name} ${trainer.last_name}`
                          : trainer.username}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>ID: {trainer.id}</div>
                    </div>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="hari" label="Hari" rules={[{ required: true, message: "Please select day" }]}>
            <Select placeholder="Select day" size="large">
              {HARI_CHOICES.map((choice) => (
                <Option key={choice.value} value={choice.value}>
                  <Badge color={choice.color} text={choice.label} />
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tersedia_dari"
                label="Available From"
                rules={[{ required: true, message: "Please select start time" }]}
              >
                <TimePicker
                  style={{ width: "100%" }}
                  size="large"
                  format="HH:mm"
                  placeholder="Start time"
                  minuteStep={15}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tersedia_akhir"
                label="Available Until"
                rules={[
                  { required: true, message: "Please select end time" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const startTime = getFieldValue("tersedia_dari")
                      if (!value || !startTime) {
                        return Promise.resolve()
                      }
                      if (value.isAfter(startTime)) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error("End time must be after start time"))
                    },
                  }),
                ]}
              >
                <TimePicker
                  style={{ width: "100%" }}
                  size="large"
                  format="HH:mm"
                  placeholder="End time"
                  minuteStep={15}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Schedule Preview */}
          {form.getFieldValue("pt") && form.getFieldValue("hari") && (
            <Card size="small" title="Schedule Preview" style={{ backgroundColor: "#f8f9fa", marginTop: "16px" }}>
              {(() => {
                const selectedTrainer = trainers.find((t) => t.id === form.getFieldValue("pt"))
                const selectedDay = HARI_CHOICES.find((d) => d.value === form.getFieldValue("hari"))
                const startTime = form.getFieldValue("tersedia_dari")
                const endTime = form.getFieldValue("tersedia_akhir")

                return (
                  <Row gutter={16}>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "12px", color: "#666" }}>Trainer</div>
                        <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                          {selectedTrainer?.first_name && selectedTrainer?.last_name
                            ? `${selectedTrainer.first_name} ${selectedTrainer.last_name}`
                            : selectedTrainer?.username || "N/A"}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "12px", color: "#666" }}>Day</div>
                        <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                          <Badge color={selectedDay?.color} text={selectedDay?.label || "N/A"} />
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "12px", color: "#666" }}>Duration</div>
                        <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                          {startTime && endTime
                            ? `${endTime.diff(startTime, "hour")}h ${endTime.diff(startTime, "minute") % 60}m`
                            : "N/A"}
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

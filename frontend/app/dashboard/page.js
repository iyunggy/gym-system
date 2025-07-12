"use client"
import { Layout, Card, Row, Col, Statistic, Button, Typography, Space, Avatar, List, Progress, Tag } from "antd"
import {
  UserOutlined,
  TeamOutlined,
  TrophyOutlined,
  DollarOutlined,
  PlusOutlined,
  CalendarOutlined,
  FireOutlined,
  RiseOutlined,
  BarChartOutlined,
  SettingOutlined,
} from "@ant-design/icons"
import { useState } from "react"

const { Header, Content, Sider } = Layout
const { Title, Text, Paragraph } = Typography

export default function Home() {
  const [collapsed, setCollapsed] = useState(false)

  // Sample data
  const stats = [
    {
      title: "Total Members",
      value: 1234,
      prefix: <UserOutlined />,
      suffix: "Active",
      color: "#1890ff",
    },
    {
      title: "Monthly Revenue",
      value: 45600000,
      prefix: <DollarOutlined />,
      suffix: "IDR",
      color: "#52c41a",
    },
    {
      title: "Personal Trainers",
      value: 24,
      prefix: <TeamOutlined />,
      suffix: "Available",
      color: "#722ed1",
    },
    {
      title: "Active Sessions",
      value: 156,
      prefix: <TrophyOutlined />,
      suffix: "Today",
      color: "#fa8c16",
    },
  ]

  const recentMembers = [
    { name: "John Doe", package: "Premium", status: "Active", avatar: "J", id: "MBR001" },
    { name: "Jane Smith", package: "Basic", status: "Active", avatar: "J", id: "MBR002" },
    { name: "Mike Johnson", package: "Premium", status: "Expired", avatar: "M", id: "MBR003" },
    { name: "Sarah Wilson", package: "Standard", status: "Active", avatar: "S", id: "MBR004" },
  ]

  const packageStats = [
    { name: "Basic Package", percentage: 45, color: "#1890ff", count: 556 },
    { name: "Standard Package", percentage: 35, color: "#52c41a", count: 432 },
    { name: "Premium Package", percentage: 20, color: "#722ed1", count: 246 },
  ]

  const menuItems = [
    { key: "dashboard", icon: <BarChartOutlined />, label: "Dashboard" },
    { key: "members", icon: <UserOutlined />, label: "Members" },
    { key: "trainers", icon: <TeamOutlined />, label: "Personal Trainers" },
    { key: "schedules", icon: <CalendarOutlined />, label: "Schedules" },
    { key: "transactions", icon: <DollarOutlined />, label: "Transactions" },
    { key: "packages", icon: <TrophyOutlined />, label: "Packages" },
    { key: "settings", icon: <SettingOutlined />, label: "Settings" },
  ]

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Dashboard</Title>
        <Paragraph>Welcome to GymEase - Your complete gym management solution</Paragraph>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="gym-card">
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Members */}
        <Col xs={24} lg={12}>
          <Card title="Recent Members" className="gym-card" extra={<Button type="link">View All</Button>}>
            <List
              itemLayout="horizontal"
              dataSource={recentMembers}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: "#1890ff" }}>{item.avatar}</Avatar>}
                    title={
                      <div>
                        <Text strong>{item.name}</Text>
                        <Text type="secondary" style={{ marginLeft: "8px", fontSize: "12px" }}>
                          {item.id}
                        </Text>
                      </div>
                    }
                    description={item.package}
                  />
                  <Tag color={item.status === "Active" ? "green" : "red"}>{item.status}</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Package Distribution */}
        <Col xs={24} lg={12}>
          <Card title="Package Distribution" className="gym-card">
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              {packageStats.map((pkg, index) => (
                <div key={index}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <Text>{pkg.name}</Text>
                    <Space>
                      <Text type="secondary">{pkg.count} members</Text>
                      <Text strong>{pkg.percentage}%</Text>
                    </Space>
                  </div>
                  <Progress percent={pkg.percentage} strokeColor={pkg.color} showInfo={false} />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="gym-card" style={{ marginTop: "24px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Button type="primary" size="large" block icon={<PlusOutlined />}>
              Add New Member
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button size="large" block icon={<CalendarOutlined />}>
              Schedule PT Session
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button size="large" block icon={<RiseOutlined />}>
              View Reports
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Welcome Message */}
      <Card className="gym-stats" style={{ marginTop: "24px", textAlign: "center" }}>
        <Space direction="vertical" size="large">
          <FireOutlined style={{ fontSize: "48px" }} />
          <Title level={2} style={{ color: "white", margin: 0 }}>
            Welcome to GymEase
          </Title>
          <Paragraph style={{ color: "white", fontSize: "16px", maxWidth: "600px" }}>
            Streamline your gym operations with our comprehensive management system. Track members, manage trainers,
            schedule sessions, and boost your business growth with powerful analytics and automation.
          </Paragraph>
          <Button type="primary" size="large" ghost>
            Get Started
          </Button>
        </Space>
      </Card>
    </div>
  )
}

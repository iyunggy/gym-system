"use client"

import { useState } from "react"
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, Badge } from "antd"
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  TrophyOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FireOutlined,
  BarChartOutlined,
} from "@ant-design/icons"

const { Header, Sider, Content } = Layout
const { Title } = Typography

export default function GymLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    {
      key: "dashboard",
      icon: <BarChartOutlined />,
      label: "Dashboard",
    },
    {
      key: "members",
      icon: <UserOutlined />,
      label: "Members",
    },
    {
      key: "trainers",
      icon: <TeamOutlined />,
      label: "Personal Trainers",
    },
    {
      key: "schedules",
      icon: <CalendarOutlined />,
      label: "Schedules",
    },
    {
      key: "transactions",
      icon: <DollarOutlined />,
      label: "Transactions",
    },
    {
      key: "packages",
      icon: <TrophyOutlined />,
      label: "Packages & Promos",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ]

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ]

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: "#fff",
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            padding: collapsed ? "16px 8px" : "16px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <FireOutlined
            style={{
              fontSize: "24px",
              color: "#1890ff",
              marginRight: collapsed ? 0 : "12px",
            }}
          />
          {!collapsed && (
            <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
              GymEase
            </Title>
          )}
        </div>

        <Menu
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={menuItems}
          style={{ border: "none", marginTop: "16px" }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 1,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px" }}
          />

          <Space size="large">
            <Badge count={5}>
              <Button type="text" icon={<BellOutlined />} size="large" />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Space style={{ cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />} />
                <span>Admin User</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: "24px",
            padding: "24px",
            background: "#f5f5f5",
            borderRadius: "8px",
            minHeight: "calc(100vh - 112px)",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

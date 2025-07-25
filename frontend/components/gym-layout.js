"use client"

import { useState } from "react"
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, Badge } from "antd"
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined, // Pastikan DollarOutlined diimpor
  TrophyOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FireOutlined,
  BarChartOutlined,
} from "@ant-design/icons"
import Link from "next/link"
import { usePathname } from "next/navigation"

const { Header, Sider, Content } = Layout
const { Title } = Typography

export default function GymLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    {
      key: "/dashboard",
      icon: <BarChartOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: "/dashboard/members",
      icon: <UserOutlined />,
      label: <Link href="/dashboard/members">Members</Link>,
    },
    {
      key: "/dashboard/trainers",
      icon: <TeamOutlined />,
      label: <Link href="/dashboard/trainers">Personal Trainers</Link>,
    },
    {
      key: "/dashboard/schedules",
      icon: <CalendarOutlined />,
      label: <Link href="/dashboard/schedules">Schedules</Link>,
    },
    {
      key: "/dashboard/transactions", // Tambahkan ini
      icon: <DollarOutlined />, // Gunakan DollarOutlined
      label: <Link href="/dashboard/transactions">Transactions</Link>, // Tambahkan ini
    },
    {
      key: "/dashboard/packages",
      icon: <TrophyOutlined />,
      label: <Link href="/dashboard/packages">Packages & Promos</Link>,
    },
    {
      key: "/dashboard/settings",
      icon: <SettingOutlined />,
      label: <Link href="/dashboard/settings">Settings</Link>,
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
      key: "/",

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

        <Menu mode="inline" selectedKeys={[pathname]} items={menuItems} style={{ border: "none", marginTop: "16px" }} />
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

"use client"

import MemberManagement from "@/components/member-management"
import { Typography } from "antd"

const { Title, Paragraph } = Typography

export default function MembersPage() {
  return (
    <div className="fade-in">
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Member Management</Title>
        <Paragraph>Manage your gym members, their packages, and contact details.</Paragraph>
      </div>
      <MemberManagement />
    </div>
  )
}

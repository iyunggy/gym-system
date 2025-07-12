"use client"

import { Layout, Row, Col, Card, Button, Typography, Space, Menu } from "antd"
import { CheckCircleOutlined, FireOutlined, UserOutlined, DollarOutlined, TeamOutlined } from "@ant-design/icons"
import Link from "next/link"

const { Header, Content, Footer } = Layout
const { Title, Paragraph, Text } = Typography

const packages = [
  {
    name: "Basic Package",
    price: "Rp 150.000",
    features: ["Full Gym Access", "Cardio & Strength Equipment", "Locker Room Access", "Free Wi-Fi"],
    color: "#1890ff",
  },
  {
    name: "Standard Package",
    price: "Rp 250.000",
    features: ["All Basic Features", "Unlimited Group Classes", "Personalized Workout Plan", "Nutritional Guidance"],
    color: "#52c41a",
  },
  {
    name: "Premium Package",
    price: "Rp 450.000",
    features: [
      "All Standard Features",
      "5 Personal Trainer Sessions/Month",
      "Priority Booking",
      "Exclusive Member Events",
    ],
    color: "#722ed1",
  },
]

export default function LandingPage() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          position: "fixed",
          width: "100%",
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <FireOutlined style={{ fontSize: "24px", color: "#1890ff", marginRight: "12px" }} />
          <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
            GymEase
          </Title>
        </div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={["home"]}
          style={{ flex: 1, minWidth: 0, borderBottom: "none", justifyContent: "flex-end" }}
        >
          <Menu.Item key="home">
            <a href="#home">Home</a>
          </Menu.Item>
          <Menu.Item key="features">
            <a href="#features">Features</a>
          </Menu.Item>
          <Menu.Item key="packages">
            <a href="#packages">Packages</a>
          </Menu.Item>
          <Menu.Item key="contact">
            <a href="#contact">Contact</a>
          </Menu.Item>
        </Menu>
        <Link href="/dashboard">
          <Button type="primary">Go to Dashboard</Button>
        </Link>
      </Header>

      <Content style={{ paddingTop: 64 }}>
        {/* Hero Section */}
        <div
          id="home"
          style={{
            textAlign: "center",
            padding: "100px 20px",
            background: "linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)",
            marginBottom: "40px",
          }}
        >
          <Title level={1} style={{ color: "#1890ff", marginBottom: "16px", fontSize: "3.5em" }}>
            Transform Your Body, Transform Your Life with GymEase
          </Title>
          <Paragraph style={{ fontSize: "1.2em", maxWidth: "900px", margin: "0 auto 40px" }}>
            Your ultimate partner for a healthier, stronger you. We provide state-of-the-art facilities, expert
            trainers, and flexible membership options to fit your lifestyle.
          </Paragraph>
          <Space size="large">
            <Button type="primary" size="large" href="#packages" style={{ height: "50px", fontSize: "1.1em" }}>
              Explore Our Packages
            </Button>
            <Button size="large" href="#contact" style={{ height: "50px", fontSize: "1.1em" }}>
              Contact Us
            </Button>
          </Space>
        </div>

        {/* About Section */}
        <div id="features" style={{ padding: "60px 20px", textAlign: "center", marginBottom: "40px" }}>
          <Title level={2} style={{ marginBottom: "40px", fontSize: "2.5em" }}>
            Why Choose GymEase?
          </Title>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} md={8}>
              <Card className="gym-card" style={{ height: "100%", padding: "20px" }}>
                <Space direction="vertical" align="center">
                  <UserOutlined style={{ fontSize: "60px", color: "#1890ff", marginBottom: "16px" }} />
                  <Title level={4} style={{ fontSize: "1.5em" }}>
                    Expert Trainers
                  </Title>
                  <Paragraph style={{ fontSize: "1.1em" }}>
                    Our certified personal trainers are dedicated to helping you achieve your fitness goals.
                  </Paragraph>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="gym-card" style={{ height: "100%", padding: "20px" }}>
                <Space direction="vertical" align="center">
                  <DollarOutlined style={{ fontSize: "60px", color: "#52c41a", marginBottom: "16px" }} />
                  <Title level={4} style={{ fontSize: "1.5em" }}>
                    Flexible Packages
                  </Title>
                  <Paragraph style={{ fontSize: "1.1em" }}>
                    Choose from a variety of membership options designed to suit every need and budget.
                  </Paragraph>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="gym-card" style={{ height: "100%", padding: "20px" }}>
                <Space direction="vertical" align="center">
                  <TeamOutlined style={{ fontSize: "60px", color: "#fa8c16", marginBottom: "16px" }} />
                  <Title level={4} style={{ fontSize: "1.5em" }}>
                    Supportive Community
                  </Title>
                  <Paragraph style={{ fontSize: "1.1em" }}>
                    Join a vibrant community of fitness enthusiasts and stay motivated together.
                  </Paragraph>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Packages Section */}
        <div id="packages" style={{ padding: "60px 20px", textAlign: "center", marginBottom: "40px" }}>
          <Title level={2} style={{ marginBottom: "40px", fontSize: "2.5em" }}>
            Our Membership Packages
          </Title>
          <Row gutter={[32, 32]} justify="center">
            {packages.map((pkg, index) => (
              <Col xs={24} md={8} key={index}>
                <Card
                  className="gym-card"
                  title={
                    <Title level={3} style={{ color: pkg.color, margin: 0, fontSize: "1.8em" }}>
                      {pkg.name}
                    </Title>
                  }
                  style={{ borderColor: pkg.color, borderWidth: "3px", height: "100%", borderRadius: "12px" }}
                  headStyle={{ borderBottom: `3px solid ${pkg.color}`, padding: "20px", fontSize: "1.2em" }}
                  bodyStyle={{ padding: "30px" }}
                >
                  <Title level={2} style={{ marginBottom: "24px", fontSize: "2.5em" }}>
                    {pkg.price}
                    <Text type="secondary" style={{ fontSize: "0.6em", marginLeft: "8px" }}>
                      / month
                    </Text>
                  </Title>
                  <ul style={{ listStyle: "none", padding: 0, marginBottom: "32px", textAlign: "left" }}>
                    {pkg.features.map((feature, i) => (
                      <li key={i} style={{ marginBottom: "12px", display: "flex", alignItems: "center" }}>
                        <CheckCircleOutlined style={{ color: pkg.color, marginRight: "12px", fontSize: "1.2em" }} />
                        <Paragraph style={{ margin: 0, fontSize: "1.1em" }}>{feature}</Paragraph>
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="primary"
                    size="large"
                    block
                    style={{ background: pkg.color, borderColor: pkg.color, height: "55px", fontSize: "1.2em" }}
                  >
                    Get Started
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Final CTA Section */}
        <div
          id="contact"
          style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)",
            marginBottom: "40px",
          }}
        >
          <Title level={2} style={{ color: "#1890ff", marginBottom: "24px", fontSize: "2.5em" }}>
            Ready to Start Your Fitness Journey?
          </Title>
          <Paragraph style={{ fontSize: "1.2em", maxWidth: "800px", margin: "0 auto 40px" }}>
            Join GymEase today and take the first step towards a healthier, happier you.
          </Paragraph>
          <Button type="primary" size="large" href="#packages" style={{ height: "50px", fontSize: "1.1em" }}>
            Sign Up Today
          </Button>
        </div>
      </Content>

      <Footer style={{ textAlign: "center", background: "#f0f2f5", padding: "24px 50px" }}>
        <Paragraph>GymEase ©{new Date().getFullYear()} Created by Vercel. All rights reserved.</Paragraph>
        <Space size="large">
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Service</Link>
          <Link href="#">Contact</Link>
        </Space>
      </Footer>
    </Layout>
  )
}

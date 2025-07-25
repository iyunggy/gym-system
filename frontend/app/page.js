"use client"

import Link from "next/link"
import { Button, Card, Badge, Row, Col, Typography, Space, Divider } from "antd"
import {
  UserOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  StarFilled,
  ArrowRightOutlined,
  CheckCircleOutlined,
  DropboxOutlined,
} from "@ant-design/icons"

const { Title, Paragraph, Text } = Typography

export default function HomePage() {
  const statsData = [
    { number: "5000+", label: "Active Members" },
    { number: "50+", label: "Professional Trainers" },
    { number: "24/7", label: "Open Every Day" },
    { number: "10+", label: "Years Experience" },
  ]

  const programs = [
    {
      icon: <TrophyOutlined style={{ fontSize: "48px", color: "#3B82F6" }} />,
      title: "Strength Training",
      description: "Complete strength training program with the most complete equipment",
      features: ["Free Weight Area", "Machine Training", "Personal Training"],
    },
    {
      icon: <UserOutlined style={{ fontSize: "48px", color: "#3B82F6" }} />,
      title: "Group Classes",
      description: "Fun and motivating group classes",
      features: ["Zumba & Dance", "Yoga & Pilates", "HIIT Training"],
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: "48px", color: "#3B82F6" }} />,
      title: "Cardio Zone",
      description: "Cardio area with cutting-edge technology",
      features: ["Premium Treadmill", "Elliptical & Bike", "Rowing Machine"],
    },
  ]

  const testimonials = [
    {
      name: "Sarah Wijaya",
      role: "Member since 2023",
      content: "In 6 months at GymEase, I successfully lost 15kg and feel much healthier!",
      avatar: "S",
    },
    {
      name: "Ahmad Rizki",
      role: "Member since 2022",
      content: "The trainers here are very professional and the gym facilities are very complete!",
      avatar: "A",
    },
    {
      name: "Maya Sari",
      role: "Member since 2024",
      content: "The community at GymEase is very supportive, makes me motivated to keep working out!",
      avatar: "M",
    },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #EFF6FF, #FFFFFF)" }}>
      {/* Top Red Bar */}
      <div style={{ height: "8px", background: "linear-gradient(to right, #DC2626, #B91C1C)" }}></div>

      {/* Navigation */}
      <nav
        style={{
          background: "#FFFFFF",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          borderBottom: "1px solid #F3F4F6",
          padding: "16px 0",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space size="small">
                <DropboxOutlined style={{ fontSize: "32px", color: "#3B82F6" }} />
                <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#2563EB" }}>GymEase</Text>
              </Space>
            </Col>
            <Col>
              <Space size="large" className="hidden-mobile">
                <Link href="#home">
                  <Text
                    style={{
                      color: "#2563EB",
                      fontWeight: 500,
                      borderBottom: "2px solid #3B82F6",
                      paddingBottom: "4px",
                    }}
                  >
                    Home
                  </Text>
                </Link>
                <Link href="#features">
                  <Text style={{ color: "#6B7280" }} className="hover-blue">
                    Features
                  </Text>
                </Link>
                <Link href="#packages">
                  <Text style={{ color: "#6B7280" }} className="hover-blue">
                    Packages
                  </Text>
                </Link>
                <Link href="#contact">
                  <Text style={{ color: "#6B7280" }} className="hover-blue">
                    Contact
                  </Text>
                </Link>
                <Link href="/login"> {/* Tombol "Go to Dashboard" bisa jadi "Register" atau Login tergantung state user */}
                  <Button type="primary" style={{ backgroundColor: "#3B82F6", borderColor: "#3B82F6" }}>
                    Go to Dashboard
                  </Button>
                </Link>
              </Space>
            </Col>
          </Row>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: "80px 16px", textAlign: "center" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Badge
            count="🔥 Special Promo - 50% Off for New Members!"
            style={{
              backgroundColor: "#DBEAFE",
              color: "#1D4ED8",
              border: "1px solid #BFDBFE",
              marginBottom: "24px",
            }}
          />

          <Title
            level={1}
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              color: "#2563EB",
              marginBottom: "24px",
              lineHeight: 1.2,
            }}
          >
            Transform Your Body,
            <br />
            Transform Your Life with
            <br />
            <span style={{ color: "#3B82F6" }}>GymEase</span>
          </Title>

          <Paragraph
            style={{
              fontSize: "20px",
              color: "#6B7280",
              marginBottom: "32px",
              maxWidth: "800px",
              margin: "0 auto 32px auto",
              lineHeight: 1.6,
            }}
          >
            Your ultimate partner for a healthier, stronger you. We provide state-of-the-art facilities, expert
            trainers, and flexible membership options to fit your lifestyle.
          </Paragraph>

          <Space size="large" direction="vertical" style={{ width: "100%" }}>
            <Space size="middle" wrap>
              {/* MODIFIKASI: Tombol "Langganan Sekarang" yang mengarah ke /order */}
              <Link href="/order">
                <Button
                  type="primary"
                  size="large"
                  style={{
                    backgroundColor: "#3B82F6",
                    borderColor: "#3B82F6",
                    padding: "16px 32px",
                    height: "auto",
                    fontSize: "18px",
                  }}
                  icon={<ArrowRightOutlined />}
                  iconPosition="end"
                >
                  Langganan Sekarang
                </Button>
              </Link>
              <Button
                size="large"
                style={{
                  borderColor: "#D1D5DB",
                  color: "#374151",
                  padding: "16px 32px",
                  height: "auto",
                  fontSize: "18px",
                }}
              >
                Hubungi Kami
              </Button>
            </Space>
          </Space>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: "64px 16px", backgroundColor: "#EFF6FF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Row gutter={[32, 32]} justify="center">
            {statsData.map((stat, index) => (
              <Col xs={12} md={6} key={index} style={{ textAlign: "center" }}>
                <Title level={2} style={{ color: "#2563EB", marginBottom: "8px" }}>
                  {stat.number}
                </Title>
                <Text style={{ color: "#6B7280" }}>{stat.label}</Text>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Programs Section */}
      <section id="features" style={{ padding: "80px 16px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <Title level={2} style={{ color: "#1F2937", marginBottom: "16px" }}>
              Featured Programs
            </Title>
            <Paragraph style={{ color: "#6B7280", fontSize: "18px", maxWidth: "600px", margin: "0 auto" }}>
              Choose the program that matches your fitness goals
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {programs.map((program, index) => (
              <Col xs={24} md={8} key={index}>
                <Card
                  style={{
                    height: "100%",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #E5E7EB",
                    transition: "all 0.3s ease",
                  }}
                  className="program-card"
                >
                  <div style={{ marginBottom: "16px" }}>{program.icon}</div>
                  <Title level={4} style={{ color: "#1F2937", marginBottom: "12px" }}>
                    {program.title}
                  </Title>
                  <Paragraph style={{ color: "#6B7280", marginBottom: "16px" }}>{program.description}</Paragraph>
                  <Space direction="vertical" size="small">
                    {program.features.map((feature, idx) => (
                      <Space key={idx} size="small">
                        <CheckCircleOutlined style={{ color: "#3B82F6" }} />
                        <Text style={{ color: "#6B7280" }}>{feature}</Text>
                      </Space>
                    ))}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "80px 16px", backgroundColor: "#F9FAFB" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <Title level={2} style={{ color: "#1F2937", marginBottom: "16px" }}>
              What Our Members Say
            </Title>
            <Paragraph style={{ color: "#6B7280", fontSize: "18px" }}>
              Real transformations from GymEase members
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {testimonials.map((testimonial, index) => (
              <Col xs={24} md={8} key={index}>
                <Card
                  style={{
                    height: "100%",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <div style={{ marginBottom: "16px" }}>
                    {[...Array(5)].map((_, i) => (
                      <StarFilled key={i} style={{ color: "#3B82F6", marginRight: "4px" }} />
                    ))}
                  </div>
                  <Paragraph style={{ color: "#6B7280", marginBottom: "16px" }}>&quot;{testimonial.content}&quot;</Paragraph>
                  <Space size="middle">
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#3B82F6",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {testimonial.avatar}
                    </div>
                    <div>
                      <Text strong style={{ color: "#1F2937" }}>
                        {testimonial.name}
                      </Text>
                      <br />
                      <Text style={{ color: "#6B7280", fontSize: "14px" }}>{testimonial.role}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="packages"
        style={{
          padding: "80px 16px",
          backgroundColor: "#2563EB",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Title level={2} style={{ color: "#FFFFFF", marginBottom: "16px" }}>
            Siap Memulai Perjalanan Fitness Anda?
          </Title>
          <Paragraph
            style={{
              color: "#BFDBFE",
              fontSize: "18px",
              marginBottom: "32px",
              maxWidth: "600px",
              margin: "0 auto 32px auto",
            }}
          >
            Bergabunglah dengan GymEase hari ini dan rasakan transformasi luar biasa. Dapatkan konsultasi gratis dengan pelatih profesional kami.
          </Paragraph>
          {/* MODIFIKASI: Tombol "Langganan Sekarang" yang mengarah ke /order */}
          <Link href="/order">
            <Button
              size="large"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#FFFFFF",
                color: "#2563EB",
                padding: "16px 48px",
                height: "auto",
                fontSize: "20px",
                fontWeight: "bold",
              }}
              icon={<ArrowRightOutlined />}
              iconPosition="end"
            >
              Langganan Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: "#1F2937", padding: "48px 16px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={6}>
              <Space size="small" style={{ marginBottom: "16px" }}>
                <DropboxOutlined style={{ fontSize: "24px", color: "#60A5FA" }} />
                <Text style={{ fontSize: "20px", fontWeight: "bold", color: "#FFFFFF" }}>GymEase</Text>
              </Space>
              <Paragraph style={{ color: "#9CA3AF" }}>
                The best gym with modern facilities and professional trainers for your life transformation.
              </Paragraph>
            </Col>
            <Col xs={24} md={6}>
              <Title level={5} style={{ color: "#FFFFFF", marginBottom: "16px" }}>
                Kontak
              </Title>
              <Space direction="vertical" size="small">
                <Text style={{ color: "#9CA3AF" }}>📍 Jl. Sudirman No. 123, Jakarta</Text>
                <Text style={{ color: "#9CA3AF" }}>📞 (021) 1234-5678</Text>
                <Text style={{ color: "#9CA3AF" }}>✉️ info@gymease.com</Text>
              </Space>
            </Col>
            <Col xs={24} md={6}>
              <Title level={5} style={{ color: "#FFFFFF", marginBottom: "16px" }}>
                Jam Operasional
              </Title>
              <Space direction="vertical" size="small">
                <Text style={{ color: "#9CA3AF" }}>Senin - Jumat: 05:00 - 23:00</Text>
                <Text style={{ color: "#9CA3AF" }}>Sabtu - Minggu: 06:00 - 22:00</Text>
                <Text style={{ color: "#9CA3AF" }}>Hari Libur: 07:00 - 21:00</Text>
              </Space>
            </Col>
            <Col xs={24} md={6}>
              <Title level={5} style={{ color: "#FFFFFF", marginBottom: "16px" }}>
                Ikuti Kami
              </Title>
              <Space size="middle">
                <Button
                  style={{
                    borderColor: "#4B5563",
                    color: "#9CA3AF",
                    backgroundColor: "transparent",
                  }}
                >
                  Instagram
                </Button>
                <Button
                  style={{
                    borderColor: "#4B5563",
                    color: "#9CA3AF",
                    backgroundColor: "transparent",
                  }}
                >
                  Facebook
                </Button>
              </Space>
            </Col>
          </Row>
          <Divider style={{ borderColor: "#374151", margin: "32px 0" }} />
          <div style={{ textAlign: "center" }}>
            <Text style={{ color: "#9CA3AF" }}>&copy; 2024 GymEase. Hak Cipta Dilindungi.</Text>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .hover-blue:hover {
          color: #2563EB !important;
          transition: color 0.3s ease;
        }
        .program-card:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
          transform: translateY(-2px);
        }
        .hidden-mobile {
          display: flex;
        }
        @media (max-width: 768px) {
          .hidden-mobile {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
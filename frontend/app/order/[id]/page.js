"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button, Card, Typography, Spin, Space, message, Row, Col } from "antd"
import Link from "next/link"
import { ArrowLeftOutlined, CheckCircleOutlined, DropboxOutlined } from "@ant-design/icons"
import { API_TRANSAKSIDETAIL } from "@/utils/endPoint"
import axios from "axios"

const { Title, Paragraph, Text } = Typography

// Simple QR Code component using Google Charts API as fallback
const QRCodeComponent = ({ value, size = 256 }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`

  return (
    <img
      src={qrUrl || "/placeholder.svg"}
      alt="QR Code"
      style={{
        width: size,
        height: size,
        border: "1px solid #E5E7EB",
        borderRadius: "8px",
      }}
    />
  )
}


export default function OrderDetailPage() {
  const { id } = useParams()
  console.log("🚀 ~ OrderDetailPage ~ id:", id)

  const [orderData, setOrderData] = useState(null)
  console.log("🚀 ~ OrderDetailPage ~ orderData:", orderData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mock data untuk testing - ganti dengan API call yang sebenarnya
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        axios.get(`${API_TRANSAKSIDETAIL+id}/`).then((res)=> {
          console.log(res.data)
          setOrderData(res.data)
        }).catch((err)=> {
          console.log(err)
        })
      } catch (err) {
        console.error("Error fetching order details:", err)
        let errorMessage = "Gagal memuat detail pesanan."

        if (err.response && err.response.data && typeof err.response.data === "object") {
          errorMessage = Object.values(err.response.data).flat().join("; ")
        } else if (err.response && err.response.data && typeof err.response.data === "string") {
          errorMessage = err.response.data
        } else if (err.message) {
          errorMessage = err.message
        }

        setError(errorMessage)
        message.error(`Error: ${errorMessage}`)
        setOrderData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [id])

  console.log("order", orderData)

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #EFF6FF, #FFFFFF)",
        }}
      >
        <Card style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: "16px", color: "#1F2937" }}>
            Memuat detail pesanan...
          </Title>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(to bottom, #EFF6FF, #FFFFFF)",
        }}
      >
        <Card style={{ maxWidth: "500px", padding: "40px" }}>
          <Title level={3} style={{ color: "#ff4d4f" }}>
            Terjadi Kesalahan
          </Title>
          <Paragraph style={{ color: "#595959" }}>{error}</Paragraph>
          <Link href="/">
            <Button icon={<ArrowLeftOutlined />} type="primary" size="large" style={{ marginTop: "24px" }}>
              Kembali ke Beranda
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(to bottom, #EFF6FF, #FFFFFF)",
        }}
      >
        <Card style={{ maxWidth: "500px", padding: "40px" }}>
          <Title level={3} style={{ color: "#bfbfbf" }}>
            Pesanan Tidak Ditemukan
          </Title>
          <Paragraph style={{ color: "#595959" }}>Pesanan dengan ID: {id} tidak dapat ditemukan.</Paragraph>
          <Link href="/">
            <Button icon={<ArrowLeftOutlined />} type="primary" size="large" style={{ marginTop: "24px" }}>
              Kembali ke Beranda
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const qrString = orderData?.xendit_qr_string
  console.log("🚀 ~ qrString:", qrString)
  const qrUrl = orderData?.xendit_qr_url
  const expiresAt = orderData?.xendit_expires_at
  const transactionStatus = orderData?.status

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
              <Link href="/">
                <Space size="small" style={{ cursor: "pointer" }}>
                  <ArrowLeftOutlined style={{ fontSize: "20px", color: "#6B7280" }} />
                  <DropboxOutlined style={{ fontSize: "32px", color: "#3B82F6" }} />
                  <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#2563EB" }}>GymEase Checkout</Text>
                </Space>
              </Link>
            </Col>
            <Col>
              <Text style={{ color: "#6B7280" }}>
                Order ID: <Text strong>{orderData.id_transaksi}</Text>
              </Text>
            </Col>
          </Row>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: "800px", margin: "48px auto", padding: "0 16px" }}>
        <Card
          style={{
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            border: "1px solid #E5E7EB",
          }}
        >
          <Title level={2} style={{ textAlign: "center", marginBottom: "24px", color: "#1F2937" }}>
            Pembayaran Transaksi Anda
          </Title>
          <Paragraph style={{ textAlign: "center", fontSize: "16px", color: "#4B5563" }}>
            Silakan scan QR Code di bawah ini untuk menyelesaikan pembayaran Anda.
          </Paragraph>

          {/* Status Display */}
          {transactionStatus === "unpaid" && (
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <CheckCircleOutlined style={{ fontSize: "64px", color: "#FAAD14", marginBottom: "16px" }} />
              <Title level={4} style={{ color: "#FAAD14" }}>
                Menunggu Pembayaran
              </Title>
              <Paragraph style={{ color: "#4B5563" }}>
                Transaksi Anda berhasil dibuat dan sedang menunggu pembayaran.
              </Paragraph>
            </div>
          )}

          {transactionStatus === "paid" && (
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <CheckCircleOutlined style={{ fontSize: "64px", color: "#52C41A", marginBottom: "16px" }} />
              <Title level={4} style={{ color: "#52C41A" }}>
                Pembayaran Berhasil!
              </Title>
              <Paragraph style={{ color: "#4B5563" }}>Pembayaran Anda telah berhasil diproses. Terima kasih!</Paragraph>
              <Link href="/">
                <Button type="primary" size="large" style={{ marginTop: "24px" }}>
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          )}

          {transactionStatus === "failed" && (
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <CheckCircleOutlined style={{ fontSize: "64px", color: "#FF4D4F", marginBottom: "16px" }} />
              <Title level={4} style={{ color: "#FF4D4F" }}>
                Pembayaran Gagal
              </Title>
              <Paragraph style={{ color: "#4B5563" }}>
                Ada masalah dengan pembayaran Anda. Silakan coba lagi atau hubungi dukungan.
              </Paragraph>
              <Link href="/">
                <Button type="primary" size="large" style={{ marginTop: "24px" }}>
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          )}

          {/* QR Code Display */}
          {(qrString || qrUrl) && transactionStatus === "unpaid" && (
            <div style={{ marginTop: "32px", textAlign: "center" }}>
              <div
                style={{
                  display: "inline-block",
                  border: "1px solid #E5E7EB",
                  padding: "24px",
                  borderRadius: "12px",
                  background: "#FFFFFF",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                }}
              >
                {qrString ? (
                  <QRCodeComponent value={qrString} size={256} />
                ) : (
                  <img
                    src={qrUrl || "/placeholder.svg"}
                    alt="Xendit QR Code"
                    style={{ maxWidth: "256px", height: "auto" }}
                  />
                )}
              </div>

              {expiresAt && (
                <Paragraph style={{ marginTop: "24px", color: "#6B7280", fontSize: "14px" }}>
                  QR Code ini akan kedaluwarsa pada: <Text strong>{new Date(expiresAt).toLocaleString("id-ID")}</Text>
                </Paragraph>
              )}

              <div style={{ marginTop: "24px" }}>
                <Title level={5} style={{ color: "#1F2937" }}>
                  Cara Pembayaran:
                </Title>
                <div style={{ textAlign: "left", maxWidth: "400px", margin: "0 auto" }}>
                  <Paragraph style={{ color: "#4B5563", marginBottom: "8px" }}>
                    1. Buka aplikasi e-wallet atau mobile banking Anda
                  </Paragraph>
                  <Paragraph style={{ color: "#4B5563", marginBottom: "8px" }}>
                    2. Pilih menu "Scan QR" atau "Bayar dengan QR"
                  </Paragraph>
                  <Paragraph style={{ color: "#4B5563", marginBottom: "8px" }}>
                    3. Arahkan kamera ke QR Code di atas
                  </Paragraph>
                  <Paragraph style={{ color: "#4B5563", marginBottom: "8px" }}>
                    4. Konfirmasi pembayaran sesuai nominal yang tertera
                  </Paragraph>
                  <Paragraph style={{ color: "#4B5563" }}>5. Simpan bukti pembayaran untuk referensi</Paragraph>
                </div>
              </div>
            </div>
          )}

          {!qrString && !qrUrl && transactionStatus === "unpaid" && (
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <Spin size="large" />
              <Paragraph style={{ marginTop: "16px", color: "#faad14" }}>
                QR Code untuk pembayaran sedang dibuat. Mohon tunggu sebentar...
              </Paragraph>
              <Button type="primary" onClick={() => window.location.reload()} style={{ marginTop: "16px" }}>
                Muat Ulang Halaman
              </Button>
            </div>
          )}

          {/* Order Details */}
          <div
            style={{
              marginTop: "48px",
              borderTop: "1px solid #F3F4F6",
              paddingTop: "24px",
            }}
          >
            <Title level={4} style={{ color: "#1F2937" }}>
              Detail Pesanan Anda
            </Title>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card size="small" style={{ backgroundColor: "#F8FAFC" }}>
                  <Text strong>ID Transaksi:</Text>
                  <br />
                  <Text code>{orderData.id_transaksi}</Text>
                </Card>
              </Col>

              <Col xs={24} sm={12}>
                <Card size="small" style={{ backgroundColor: "#F8FAFC" }}>
                  <Text strong>Status Pembayaran:</Text>
                  <br />
                  <Text
                    style={{
                      color:
                        transactionStatus === "paid"
                          ? "#52C41A"
                          : transactionStatus === "failed"
                            ? "#FF4D4F"
                            : "#FAAD14",
                      fontWeight: "bold",
                    }}
                  >
                    {transactionStatus === "paid"
                      ? "LUNAS"
                      : transactionStatus === "failed"
                        ? "GAGAL"
                        : "MENUNGGU PEMBAYARAN"}
                  </Text>
                </Card>
              </Col>

              <Col xs={24} sm={12}>
                <Card size="small" style={{ backgroundColor: "#F8FAFC" }}>
                  <Text strong>Paket Membership:</Text>
                  <br />
                  <Text>{orderData.product_detail?.nama_paket || "N/A"}</Text>
                </Card>
              </Col>

              <Col xs={24} sm={12}>
                <Card size="small" style={{ backgroundColor: "#F8FAFC" }}>
                  <Text strong>Jumlah Pembayaran:</Text>
                  <br />
                  <Text strong style={{ color: "#3B82F6", fontSize: "16px" }}>
                    Rp {Number.parseFloat(orderData?.total_bayar || 0).toLocaleString("id-ID")}
                  </Text>
                </Card>
              </Col>

              {orderData.transaksi_data?.pt_detail && (
                <Col xs={24}>
                  <Card size="small" style={{ backgroundColor: "#F8FAFC" }}>
                    <Text strong>Personal Trainer:</Text>
                    <br />
                    <Text>
                      {orderData.transaksi_data.pt_detail.first_name} {orderData.transaksi_data.pt_detail.last_name}
                    </Text>
                  </Card>
                </Col>
              )}
            </Row>
          </div>

          {/* Action Buttons */}
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Space size="middle">
              <Link href="/">
                <Button icon={<ArrowLeftOutlined />}>Kembali ke Beranda</Button>
              </Link>

              {transactionStatus === "unpaid" && (
                <Button type="primary" onClick={() => window.location.reload()}>
                  Refresh Status
                </Button>
              )}
            </Space>
          </div>
        </Card>
      </div>
    </div>
  )
}

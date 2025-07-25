"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Card,
  Input,
  Select,
  // Checkbox, // Checkbox dihapus, jadi tidak perlu diimpor
  Badge,
  Row,
  Col,
  Typography,
  Space,
  Form,
  message,
  Spin,
} from "antd";
import {
  DropboxOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  UserOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { API_JADWALPT, API_PRODUK, API_TRANSAKSI } from "@/utils/endPoint"; // Pastikan API_USER_ME ada di endPoint.js
// Contoh: export const API_USER_ME = "http://localhost:8000/api/user/me/";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// useAuth HOOK yang diperbarui untuk mengambil data pengguna dari API
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (typeof window === "undefined") {
        setIsLoadingAuth(false);
        return;
      }

      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          // Mengambil userData dari localStorage
          const user_detail = JSON.parse(localStorage.getItem("userData"));
          setUser(user_detail);
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Failed to fetch user data from localStorage:", error);
          // Hapus token dan userData jika tidak valid atau terjadi error parse
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          setUser(null);
          setIsLoggedIn(false);
        } finally {
          setIsLoadingAuth(false);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setIsLoadingAuth(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isLoadingAuth, isLoggedIn };
};

// Helper function untuk mendapatkan icon berdasarkan nama paket
const getPackageIcon = (packageName) => {
  switch (packageName) {
    case "Starter Pack":
      return (
        <ThunderboltOutlined style={{ fontSize: "24px", color: "#3B82F6" }} />
      );
    case "Power Boost":
      return <CrownOutlined style={{ fontSize: "24px", color: "#3B82F6" }} />;
    case "Ultimate Transform":
      return <RocketOutlined style={{ fontSize: "24px", color: "#3B82F6" }} />;
    default:
      return <DropboxOutlined style={{ fontSize: "24px", color: "#3B82F6" }} />;
  }
};

export default function RegisterPage123() {
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState("");
  const [form] = Form.useForm();
  const [isSchedulesLoading, setIsSchedulesLoading] = useState(true);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [products, setProducts] = useState([]);
  const [jadwals, setJadwals] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter()

  const { user, isLoadingAuth, isLoggedIn } = useAuth();
  const [hasShownLoginStatusMessage, setHasShownLoginStatusMessage] =
    useState(false);

  // Mengambil data awal produk dan jadwal
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingPage(true);
        setIsSchedulesLoading(true);

        const [resProducts, resJadwal] = await Promise.all([
          axios.get(API_PRODUK),
          axios.get(API_JADWALPT),
        ]);

        const fetchedProducts = resProducts.data.results;
        const fetchedJadwal = resJadwal.data.results;
        setProducts(fetchedProducts);
        setJadwals(fetchedJadwal);

        const produkParam = searchParams.get("produk");
        if (produkParam) {
          const validPlan = fetchedProducts.find(
            (plan) =>
              plan.nama_paket.toLowerCase().replace(/\s/g, "") ===
              produkParam.toLowerCase()
          );
          if (validPlan) {
            setSelectedPlan(validPlan.nama_paket);
            message.success(`Paket ${validPlan.nama_paket} telah dipilih!`);
          } else {
            message.warning(
              "Paket tidak ditemukan, silakan pilih paket yang tersedia."
            );
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        message.error("Gagal memuat data. Silakan coba lagi.");
      } finally {
        setIsLoadingPage(false);
        setIsSchedulesLoading(false);
      }
    };

    fetchInitialData();
  }, [searchParams]);

  // Mengisi form dengan data user yang diambil dari localStorage
  useEffect(() => {
    if (user && !isLoadingAuth) {
      form.setFieldsValue({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        // Mengambil phone dari user.profile.phone
        phone: user.profile?.phone || '', // Gunakan optional chaining (?) untuk jaga-jaga jika profile bisa null/undefined
        // Jika ada bidang lain seperti birthDate, gender, address di model user Anda
        // Anda juga bisa mengisinya di sini
        birthDate: user.profile?.tanggal_lahir || '', // Mengambil tanggal_lahir dari profile
        gender: user.profile?.gender || '', // Menambahkan gender dari profile jika ada
        address: user.profile?.address || '', // Mengambil address dari profile
      });
    }
  }, [user, isLoadingAuth, form]);

  // Menampilkan pesan status login
  useEffect(() => {
    if (!isLoadingAuth && !isLoadingPage && !hasShownLoginStatusMessage) {
      if (isLoggedIn) {
        message.success("Anda sudah login. Selamat datang di GymEase!");
      } else {
        message.info(
          "Anda belum login. Silakan login untuk melanjutkan pendaftaran membership."
        );
      }
      setHasShownLoginStatusMessage(true);
    }
  }, [isLoadingAuth, isLoadingPage, isLoggedIn, hasShownLoginStatusMessage]);

  const getSelectedPlanDetails = () => {
    return products.find((plan) => plan.nama_paket === selectedPlan);
  };

  const handleSubmit = async (values) => {
    if (!isLoggedIn) {
      message.error("Anda harus login untuk melanjutkan transaksi.");
      return;
    }
    if (!selectedPlan) {
      message.error("Silakan pilih paket keanggotaan!");
      return;
    }

    const selectedPlanDetails = getSelectedPlanDetails();
    if (!selectedPlanDetails) {
      message.error("Detail paket tidak ditemukan. Silakan pilih ulang.");
      return;
    }

    // *** PERUBAHAN DI SINI UNTUK MENGAMBIL ID PT DARI JADWAL ***
    const selectedSchedule = jadwals.find(
      (schedule) => schedule.id === values.fitnessGoal
    );

    if (!selectedSchedule || !selectedSchedule.pt_detail?.id) {
      message.error("Jadwal Personal Trainer tidak valid atau PT tidak ditemukan.");
      setIsSubmitting(false); // Pastikan loading spinner mati
      return;
    }

    setIsSubmitting(true);
    console.log("🚀 ~ handleSubmit ~ selectedSchedule:", selectedPlanDetails)
    try {
      // *** PERUBAHAN PAYLOAD SESUAI DENGAN MODEL DJANGO ***
      const payload = {
        member: user.id, // Ambil ID member dari user yang sudah login
        produk: selectedPlanDetails.id, // ID produk yang dipilih
        pt: selectedSchedule.id, // ID Personal Trainer dari jadwal yang dipilih
        promo: null, // Asumsi tidak ada input promo di frontend, jadi null
        total_bayar: selectedPlanDetails.harga, // Total bayar sesuai harga produk
        // Field lain seperti total_bayar, status, tanggal_mulai_membership,
        // tanggal_berakhir_membership akan dihitung/diisi oleh backend Django.
      };

      const authToken =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      const config = authToken
        ? {
            headers: {
              Authorization: `Token ${authToken}`,
            },
          }
        : {};

      // Pastikan endpoint ini sesuai dengan yang Anda definisikan di Django
      const response = await axios.post(API_TRANSAKSI, payload, config);
      console.log("🚀 ~ handleSubmit ~ response:", response.data.id_transaksi)

      message.success(
        `Transaksi berhasil untuk paket ${selectedPlanDetails.nama_paket}! Transaksi ID: ${response.data.id_transaksi}` // Pastikan response.data.id_transaksi sesuai dengan key dari backend
      );
      // Anda bisa mengarahkan user setelah transaksi berhasil
      // useRouter().push(`/confirmation/${response.data.id_transaksi}`);
      form.resetFields(); // Reset form setelah sukses
      setSelectedPlan(""); // Clear selected plan
      router.push(`/order/${response.data.id_transaksi}`);
    } catch (error) {
      console.error("Error submitting transaction:", error);
      if (error.response && error.response.data) {
        // Tampilkan pesan error yang lebih spesifik dari backend jika ada
        let errorMessage = "Terjadi kesalahan saat membuat transaksi.";
        if (typeof error.response.data === 'object') {
          errorMessage = Object.values(error.response.data).flat().join('; ');
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
        message.error(`Gagal membuat transaksi: ${errorMessage}`);
      } else {
        message.error(
          "Terjadi kesalahan saat membuat transaksi. Silakan coba lagi."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const overallLoading = isLoadingPage || isLoadingAuth;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #EFF6FF, #FFFFFF)",
      }}>
      <div
        style={{
          height: "8px",
          background: "linear-gradient(to right, #DC2626, #B91C1C)",
        }}></div>

      <nav
        style={{
          background: "#FFFFFF",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          borderBottom: "1px solid #F3F4F6",
          padding: "16px 0",
        }}>
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
          <Row justify='space-between' align='middle'>
            <Col>
              <Link href='/'>
                <Space size='small' style={{ cursor: "pointer" }}>
                  <ArrowLeftOutlined
                    style={{ fontSize: "20px", color: "#6B7280" }}
                  />
                  <DropboxOutlined
                    style={{ fontSize: "32px", color: "#3B82F6" }}
                  />
                  <Text
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#2563EB",
                    }}>
                    GymEase
                  </Text>
                </Space>
              </Link>
            </Col>
            <Col>
              <Space size='middle'>
                {selectedPlan && (
                  <Badge
                    count={`Selected: ${getSelectedPlanDetails()?.nama_paket}`}
                    style={{
                      backgroundColor: "#10B981",
                      color: "#FFFFFF",
                    }}
                  />
                )}
                <Badge
                  count='🔥 Special Offer - Limited Time!'
                  style={{
                    backgroundColor: "#DBEAFE",
                    color: "#1D4ED8",
                    border: "1px solid #BFDBFE",
                  }}
                />
              </Space>
            </Col>
          </Row>
        </div>
      </nav>

      <div
        style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <Title level={1} style={{ color: "#1F2937", marginBottom: "16px" }}>
            Join GymEase Membership
          </Title>
          <Paragraph style={{ color: "#6B7280", fontSize: "18px" }}>
            {selectedPlan
              ? `Complete your registration for ${
                  getSelectedPlanDetails()?.nama_paket
                } package`
              : "Start your life transformation today. Choose the membership package that suits your needs."}
          </Paragraph>

          {searchParams.get("produk") && (
            <div
              style={{
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: "8px",
                padding: "12px",
                marginTop: "16px",
                maxWidth: "600px",
                margin: "16px auto 0 auto",
              }}>
              <Text style={{ color: "#1D4ED8" }}>
                📦 Paket dari URL: <strong>{searchParams.get("produk")}</strong>
              </Text>
            </div>
          )}
        </div>

        {overallLoading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size='large' tip='Loading...' />
          </div>
        ) : (
          <>
            {!isLoggedIn ? (
              <Card
                style={{
                  maxWidth: "600px",
                  margin: "0 auto",
                  textAlign: "center",
                  padding: "40px 20px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}>
                <Title level={3} style={{ color: "#1F2937" }}>
                  Anda Belum Login
                </Title>
                <Paragraph style={{ color: "#6B7280", marginBottom: "24px" }}>
                  Untuk melanjutkan pendaftaran membership, silakan login ke
                  akun Anda.
                </Paragraph>
                <Link href='/login' passHref>
                  <Button
                    type='primary'
                    size='large'
                    style={{ marginRight: "16px" }}>
                    Login
                  </Button>
                </Link>
                <Link href='/register-new-account' passHref>
                  <Button type='default' size='large'>
                    Register Akun Baru
                  </Button>
                </Link>
              </Card>
            ) : (
              <Row gutter={[32, 32]}>
                <Col xs={24} lg={8}>
                  <Space
                    direction='vertical'
                    size='middle'
                    style={{ width: "100%" }}>
                    <Title
                      level={3}
                      style={{ color: "#1F2937", marginBottom: "24px" }}>
                      <CreditCardOutlined
                        style={{ color: "#3B82F6", marginRight: "8px" }}
                      />
                      Choose Membership Package
                    </Title>
                    <Card
                      style={{
                        marginBottom: "16px",
                        backgroundColor: "#F8FAFC",
                      }}>
                      <Text
                        style={{
                          color: "#374151",
                          fontWeight: "500",
                          marginBottom: "8px",
                          display: "block",
                        }}>
                        Quick Select:
                      </Text>
                      <Space wrap>
                        {products.map((plan) => (
                          <Link
                            key={plan.nama_paket}
                            href={`/register?produk=${plan.nama_paket
                              .toLowerCase()
                              .replace(/\s/g, "")}`}>
                            <Button
                              size='small'
                              type={
                                selectedPlan === plan.nama_paket
                                  ? "primary"
                                  : "default"
                              }>
                              {plan.nama_paket.split(" ")[0]}{" "}
                            </Button>
                          </Link>
                        ))}
                      </Space>
                    </Card>

                    {isLoadingPage ? (
                      <div style={{ textAlign: "center", padding: "50px" }}>
                        <Spin size='large' tip='Loading Packages...' />
                      </div>
                    ) : (
                      <Space
                        direction='vertical'
                        size='middle'
                        style={{ width: "100%" }}>
                        {products.map((plan) => (
                          <Card
                            key={plan.id}
                            style={{
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              border:
                                selectedPlan === plan.nama_paket
                                  ? "2px solid #3B82F6"
                                  : "1px solid #E5E7EB",
                              backgroundColor:
                                selectedPlan === plan.nama_paket
                                  ? "#EFF6FF"
                                  : "#FFFFFF",
                              boxShadow:
                                selectedPlan === plan.nama_paket
                                  ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                                  : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                            }}
                            onClick={() => {
                              setSelectedPlan(plan.nama_paket);
                              message.success(
                                `Paket ${plan.nama_paket} dipilih!`
                              );
                            }}
                            hoverable>
                            <Row
                              justify='space-between'
                              align='top'
                              style={{ marginBottom: "12px" }}>
                              <Col>
                                <Space size='small'>
                                  {getPackageIcon(plan.nama_paket)}{" "}
                                  <Title
                                    level={4}
                                    style={{ color: "#1F2937", margin: 0 }}>
                                    {plan.nama_paket}
                                  </Title>
                                </Space>
                              </Col>
                              <Col>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    gap: "8px",
                                  }}>
                                  {plan.nama_paket === "Power Boost" && (
                                    <Badge
                                      count='Popular'
                                      style={{
                                        backgroundColor: "#3B82F6",
                                        color: "#FFFFFF",
                                      }}
                                    />
                                  )}
                                  {selectedPlan === plan.nama_paket && (
                                    <Badge
                                      count='Selected'
                                      style={{
                                        backgroundColor: "#10B981",
                                        color: "#FFFFFF",
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>
                            </Row>

                            <Space
                              size='small'
                              style={{ marginBottom: "16px" }}>
                              <Text
                                style={{
                                  fontSize: "24px",
                                  fontWeight: "bold",
                                  color: "#2563EB",
                                }}>
                                Rp{" "}
                                {parseFloat(plan.harga).toLocaleString("id-ID")}{" "}
                              </Text>
                              <Text style={{ color: "#6B7280" }}>
                                /{plan.durasi_hari / 30} Bulan
                              </Text>{" "}
                            </Space>

                            <Space
                              direction='vertical'
                              size='small'
                              style={{ width: "100%" }}>
                              {plan.fitur_paket &&
                                Array.isArray(plan.fitur_paket) &&
                                plan.fitur_paket.map((feature, index) => (
                                  <Space key={index} size='small'>
                                    <CheckCircleOutlined
                                      style={{ color: "#3B82F6" }}
                                    />
                                    <Text
                                      style={{
                                        color: "#6B7280",
                                        fontSize: "14px",
                                      }}>
                                      {feature}
                                    </Text>
                                  </Space>
                                ))}
                            </Space>
                          </Card>
                        ))}
                      </Space>
                    )}
                  </Space>
                </Col>

                <Col xs={24} lg={16}>
                  <Card
                    style={{
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #E5E7EB",
                    }}>
                    <Title
                      level={4}
                      style={{ color: "#1F2937", marginBottom: "8px" }}>
                      <UserOutlined
                        style={{ color: "#3B82F6", marginRight: "8px" }}
                      />
                      Membership Information
                      {selectedPlan && (
                        <Text
                          style={{
                            color: "#10B981",
                            fontSize: "16px",
                            fontWeight: "normal",
                            marginLeft: "8px",
                          }}>
                          - {getSelectedPlanDetails()?.nama_paket}
                        </Text>
                      )}
                    </Title>
                    <Paragraph
                      style={{ color: "#6B7280", marginBottom: "24px" }}>
                      Complete transaction details for your{" "}
                      <Text strong>{user?.first_name || "your"}</Text>{" "}
                      membership.
                      {selectedPlan && (
                        <Text
                          style={{
                            color: "#3B82F6",
                            display: "block",
                            marginTop: "4px",
                          }}>
                          Package: {getSelectedPlanDetails()?.nama_paket} (Rp{" "}
                          {getSelectedPlanDetails()?.harga
                            ? parseFloat(
                                getSelectedPlanDetails()?.harga
                              ).toLocaleString("id-ID")
                            : "N/A"}
                          /
                          {getSelectedPlanDetails()?.durasi_hari
                            ? getSelectedPlanDetails()?.durasi_hari / 30
                            : "N/A"}{" "}
                          Bulan)
                        </Text>
                      )}
                    </Paragraph>

                    <Form
                      form={form}
                      layout='vertical'
                      onFinish={handleSubmit}
                      requiredMark={false}>
                      <Form.Item
                        name='selectedPlan'
                        style={{ display: "none" }}>
                        <Input value={selectedPlan} />
                      </Form.Item>

                      <Title
                        level={5}
                        style={{ color: "#1F2937", marginBottom: "16px" }}>
                        Your Personal Data (from Profile)
                      </Title>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={
                              <Text style={{ color: "#374151" }}>
                                First Name
                              </Text>
                            }
                            name='firstName'>
                            <Input
                              readOnly
                              style={{
                                borderColor: "#D1D5DB",
                                backgroundColor: "#F9FAFB",
                              }}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={
                              <Text style={{ color: "#374151" }}>
                                Last Name
                              </Text>
                            }
                            name='lastName'>
                            <Input
                              readOnly
                              style={{
                                borderColor: "#D1D5DB",
                                backgroundColor: "#F9FAFB",
                              }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={
                              <Text style={{ color: "#374151" }}>Email</Text>
                            }
                            name='email'>
                            <Input
                              readOnly
                              style={{
                                borderColor: "#D1D5DB",
                                backgroundColor: "#F9FAFB",
                              }}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={
                              <Text style={{ color: "#374151" }}>
                                Phone Number
                              </Text>
                            }
                            name='phone'>
                            <Input
                              readOnly
                              style={{
                                borderColor: "#D1D5DB",
                                backgroundColor: "#F9FAFB",
                              }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Asumsi bidang-bidang ini mungkin juga ada di profil pengguna Anda */}
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={
                              <Text style={{ color: "#374151" }}>
                                Birth Date
                              </Text>
                            }
                            name='birthDate'>
                            <Input
                              type='date'
                              readOnly
                              style={{
                                borderColor: "#D1D5DB",
                                backgroundColor: "#F9FAFB",
                              }}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={
                              <Text style={{ color: "#374151" }}>Gender</Text>
                            }
                            name='gender'>
                            <Input
                              readOnly
                              style={{
                                borderColor: "#D1D5DB",
                                backgroundColor: "#F9FAFB",
                              }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        label={
                          <Text style={{ color: "#374151" }}>Address</Text>
                        }
                        name='address'>
                        <TextArea
                          rows={3}
                          readOnly
                          style={{
                            borderColor: "#D1D5DB",
                            backgroundColor: "#F9FAFB",
                          }}
                        />
                      </Form.Item>

                      <Title
                        level={5}
                        style={{
                          color: "#1F2937",
                          marginBottom: "16px",
                          marginTop: "24px",
                        }}>
                        Personal Trainer Session
                      </Title>
                      <Form.Item
                        label={
                          <Text style={{ color: "#374151" }}>
                            Pilih Jadwal Personal Trainer *
                          </Text>
                        }
                        name='fitnessGoal'
                        rules={[
                          {
                            required: true,
                            message: "Silakan pilih jadwal personal trainer!",
                          },
                        ]}>
                        <Select
                          placeholder='Pilih jadwal'
                          style={{ borderColor: "#D1D5DB" }}
                          loading={isSchedulesLoading}
                          disabled={isSchedulesLoading}>
                          {jadwals.length === 0 && !isSchedulesLoading ? (
                            <Option value='' disabled>
                              Tidak ada jadwal tersedia
                            </Option>
                          ) : (
                            jadwals.map((schedule) => (
                              <Option key={schedule.id} value={schedule.id}>
                                {`${schedule.id} ${schedule.pt_detail.first_name} - ${schedule.tersedia_dari} s/d ${schedule.tersedia_akhir}`}
                              </Option>
                            ))
                          )}
                        </Select>
                      </Form.Item>

                      {/* Checkbox agreeMarketing dan agreeTerms dihapus sesuai permintaan */}
                      {/* Anda mungkin ingin menambahkan link ke Terms & Conditions secara terpisah jika diperlukan */}

                      <Form.Item style={{ marginTop: "32px" }}>
                        <Button
                          type='primary'
                          htmlType='submit'
                          size='large'
                          block
                          disabled={!selectedPlan || isSubmitting}
                          loading={isSubmitting}
                          style={{
                            backgroundColor: selectedPlan
                              ? "#3B82F6"
                              : "#9CA3AF",
                            borderColor: selectedPlan ? "#3B82F6" : "#9CA3AF",
                            height: "48px",
                            fontSize: "16px",
                            fontWeight: "bold",
                          }}>
                          {isSubmitting
                            ? "Processing..."
                            : selectedPlan
                            ? `Proceed to Payment for ${
                                getSelectedPlanDetails()?.nama_paket
                              }`
                            : "Please Select a Package First"}
                        </Button>
                        <Text
                          style={{
                            display: "block",
                            textAlign: "center",
                            color: "#6B7280",
                            fontSize: "14px",
                            marginTop: "16px",
                          }}>
                          Our team will contact you within 24 hours for payment
                          confirmation
                        </Text>
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>
              </Row>
            )}
          </>
        )}
      </div>
    </div>
  );
}
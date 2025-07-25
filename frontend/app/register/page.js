"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Card,
  Input,
  Select,
  Checkbox,
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
import { API_JADWALPT, API_PRODUK } from "@/utils/endPoint"; // Sesuaikan API_JADWALPT

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// --- MOCK useAuth HOOK ---
// Ganti dengan implementasi useAuth asli Anda (misal dari context, Redux, atau custom hook)
// Ini hanya untuk demo agar komponen bisa dijalankan tanpa error auth.
const useAuth = () => {
  const [user, setUser] = useState(null); // null = belum login, { id: 1, email: 'test@example.com', first_name: 'John' } = sudah login
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Simulasi pengecekan login (misal dari localStorage token, atau fetch user info)
    const token = localStorage.getItem('authToken'); // Contoh: Cek token di localStorage
    if (token) {
      // Dalam aplikasi nyata: Lakukan fetch ke API /api/user/me/ untuk mendapatkan detail user
      // Jika berhasil:
      setUser({ id: 'mock-user-123', username: 'mockuser', email: 'user@example.com', first_name: 'Logged', last_name: 'In User', phone_number: '08123456789' });
    }
    setIsLoadingAuth(false);
  }, []);

  return { user, isLoadingAuth, isLoggedIn: !!user };
};
// --- AKHIR MOCK useAuth HOOK ---

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

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState("");
  const [form] = Form.useForm();
  const [isSchedulesLoading, setIsSchedulesLoading] = useState(true);
  const [isLoadingPage, setIsLoadingPage] = useState(true); // Ganti nama agar tidak konflik
  const [products, setProducts] = useState([]);
  const [jadwals, setJadwals] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // State untuk loading saat submit

  const { user, isLoadingAuth, isLoggedIn } = useAuth(); // Ambil status autentikasi

  // Fetch products and schedules
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

  // Isi form dengan data user yang login (jika ada)
  useEffect(() => {
    if (user && !isLoadingAuth) {
      form.setFieldsValue({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone_number || '', // Asumsi phone_number ada di object user atau profile
        // birthDate, gender, address perlu diambil dari UserProfile jika ada
        // Anda perlu memuat data UserProfile secara terpisah jika tidak ada di objek `user` langsung
      });
    }
  }, [user, isLoadingAuth, form]);

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

    setIsSubmitting(true);
    try {
      // Data yang akan dikirim ke API /api/transaksi/
      // Hanya kirim data transaksi yang relevan, karena user sudah login
      const payload = {
        selected_plan: selectedPlanDetails.id, // Kirim ID produk
        personal_trainer_schedule: values.fitnessGoal, // ID jadwal PT
        // promo_code: values.promoCode, // Jika ada field promo di form
        agree_terms: true, // Asumsi ini dicentang otomatis atau ada checkbox terpisah
        agree_marketing: values.agreeMarketing || false,
      };

      // Contoh: Menambahkan token autentikasi ke header
      const authToken = localStorage.getItem('authToken'); // Ambil token dari penyimpanan lokal
      const config = authToken ? {
        headers: {
          Authorization: `Token ${authToken}`, // Atau `Bearer ${authToken}` untuk JWT
        },
      } : {};

      const response = await axios.post('/api/transaksi/', payload, config); // Sesuaikan dengan endpoint API Anda

      message.success(
        `Transaksi berhasil untuk paket ${selectedPlanDetails.nama_paket}! Transaksi ID: ${response.data.transaksi_id}`
      );
      // Optional: Redirect user ke halaman konfirmasi/dashboard
      // router.push(`/confirmation?transaksiId=${response.data.transaksi_id}`);
    } catch (error) {
      console.error("Error submitting transaction:", error);
      if (error.response && error.response.data) {
        message.error(
          `Gagal membuat transaksi: ${JSON.stringify(error.response.data)}`
        );
      } else {
        message.error("Terjadi kesalahan saat membuat transaksi. Silakan coba lagi.");
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
              // Konten jika user belum login
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
                  Untuk melanjutkan pendaftaran membership, silakan login ke akun Anda.
                </Paragraph>
                <Link href='/login' passHref>
                  <Button type='primary' size='large' style={{ marginRight: '16px' }}>
                    Login
                  </Button>
                </Link>
                <Link href='/register-new-account' passHref> {/* Ganti dengan path halaman pendaftaran akun baru Anda */}
                  <Button type='default' size='large'>
                    Register Akun Baru
                  </Button>
                </Link>
              </Card>
            ) : (
              // Konten jika user sudah login (form yang sudah ada)
              <Row gutter={[32, 32]}>
                {/* Membership Plans - TETAP SAMA */}
                <Col xs={24} lg={8}>
                  <Space direction='vertical' size='middle' style={{ width: "100%" }}>
                    <Title level={3} style={{ color: "#1F2937", marginBottom: "24px" }}>
                      <CreditCardOutlined style={{ color: "#3B82F6", marginRight: "8px" }}/>
                      Choose Membership Package
                    </Title>
                    <Card style={{ marginBottom: "16px", backgroundColor: "#F8FAFC" }}>
                      <Text style={{ color: "#374151", fontWeight: "500", marginBottom: "8px", display: "block", }}>
                        Quick Select:
                      </Text>
                      <Space wrap>
                        {products.map((plan) => (
                          <Link
                            key={plan.nama_paket}
                            href={`/register?produk=${plan.nama_paket.toLowerCase().replace(/\s/g, "")}`}>
                            <Button
                              size='small'
                              type={selectedPlan === plan.nama_paket ? "primary" : "default"}>
                              {plan.nama_paket.split(" ")[0]}{" "}
                            </Button>
                          </Link>
                        ))}
                      </Space>
                    </Card>

                    {isLoadingPage ? ( // Gunakan isLoadingPage untuk bagian ini
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
                              border: selectedPlan === plan.nama_paket ? "2px solid #3B82F6" : "1px solid #E5E7EB",
                              backgroundColor: selectedPlan === plan.nama_paket ? "#EFF6FF" : "#FFFFFF",
                              boxShadow: selectedPlan === plan.nama_paket ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)" : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                            }}
                            onClick={() => {
                              setSelectedPlan(plan.nama_paket);
                              message.success(`Paket ${plan.nama_paket} dipilih!`);
                            }}
                            hoverable>
                            <Row justify='space-between' align='top' style={{ marginBottom: "12px" }}>
                              <Col>
                                <Space size='small'>
                                  {getPackageIcon(plan.nama_paket)}{" "}
                                  <Title level={4} style={{ color: "#1F2937", margin: 0 }}>
                                    {plan.nama_paket}
                                  </Title>
                                </Space>
                              </Col>
                              <Col>
                                <Space direction='vertical' size='small' align='end'>
                                  {plan.nama_paket === "Power Boost" && (
                                    <Badge count='Popular' style={{ backgroundColor: "#3B82F6", color: "#FFFFFF", }}/>
                                  )}
                                  {selectedPlan === plan.nama_paket && (
                                    <Badge count='Selected' style={{ backgroundColor: "#10B981", color: "#FFFFFF", }}/>
                                  )}
                                </Space>
                              </Col>
                            </Row>

                            <Space size='small' style={{ marginBottom: "16px" }}>
                              <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#2563EB", }}>
                                Rp {parseFloat(plan.harga).toLocaleString("id-ID")}{" "}
                              </Text>
                              <Text style={{ color: "#6B7280" }}>/{plan.durasi_hari / 30} Bulan</Text>{" "}
                            </Space>

                            <Space direction='vertical' size='small' style={{ width: "100%" }}>
                              {plan.fitur_paket && Array.isArray(plan.fitur_paket) && plan.fitur_paket.map((feature, index) => (
                                <Space key={index} size='small'>
                                  <CheckCircleOutlined style={{ color: "#3B82F6" }}/>
                                  <Text style={{ color: "#6B7280", fontSize: "14px", }}>
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

                {/* Registration Form - MODIFIKASI */}
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
                    <Paragraph style={{ color: "#6B7280", marginBottom: "24px" }}>
                      Complete transaction details for your{" "}
                      <Text strong>{user?.first_name || 'your'}</Text> membership.
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
                      <Form.Item name='selectedPlan' style={{ display: "none" }}>
                        <Input value={selectedPlan} />
                      </Form.Item>

                      {/* Personal Information (ReadOnly / Auto-filled from logged in user) */}
                      <Title
                        level={5}
                        style={{ color: "#1F2937", marginBottom: "16px" }}>
                        Your Personal Data (from Profile)
                      </Title>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={<Text style={{ color: "#374151" }}>First Name</Text>}
                            name='firstName'>
                            <Input readOnly style={{ borderColor: "#D1D5DB", backgroundColor: '#F9FAFB' }}/>
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={<Text style={{ color: "#374151" }}>Last Name</Text>}
                            name='lastName'>
                            <Input readOnly style={{ borderColor: "#D1D5DB", backgroundColor: '#F9FAFB' }}/>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={<Text style={{ color: "#374151" }}>Email</Text>}
                            name='email'>
                            <Input readOnly style={{ borderColor: "#D1D5DB", backgroundColor: '#F9FAFB' }}/>
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={<Text style={{ color: "#374151" }}>Phone Number</Text>}
                            name='phone'>
                            <Input readOnly style={{ borderColor: "#D1D5DB", backgroundColor: '#F9FAFB' }}/>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={<Text style={{ color: "#374151" }}>Birth Date</Text>}
                            name='birthDate'>
                            <Input type='date' readOnly style={{ borderColor: "#D1D5DB", backgroundColor: '#F9FAFB' }}/>
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={<Text style={{ color: "#374151" }}>Gender</Text>}
                            name='gender'>
                            <Input readOnly style={{ borderColor: "#D1D5DB", backgroundColor: '#F9FAFB' }}/>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        label={<Text style={{ color: "#374151" }}>Address</Text>}
                        name='address'>
                        <TextArea rows={3} readOnly style={{ borderColor: "#D1D5DB", backgroundColor: '#F9FAFB' }}/>
                      </Form.Item>

                      {/* Personal Trainer Schedule (tetap sama) */}
                      <Title
                        level={5}
                        style={{ color: "#1F2937", marginBottom: "16px", marginTop: "24px" }}>
                        Personal Trainer Session
                      </Title>
                      <Form.Item
                        label={<Text style={{ color: "#374151" }}>Pilih Jadwal Personal Trainer *</Text>}
                        name='fitnessGoal'
                        rules={[{ required: true, message: "Silakan pilih jadwal personal trainer!" }]}>
                        <Select
                          placeholder='Pilih jadwal'
                          style={{ borderColor: "#D1D5DB" }}
                          loading={isSchedulesLoading}
                          disabled={isSchedulesLoading}>
                          {jadwals.length === 0 && !isSchedulesLoading ? (
                            <Option value='' disabled>Tidak ada jadwal tersedia</Option>
                          ) : (
                            jadwals.map((schedule) => (
                              <Option key={schedule.id} value={schedule.id}>
                                {`${schedule.pt.first_name} - ${schedule.tersedia_dari} s/d ${schedule.tersedia_akhir}`}
                              </Option>
                            ))
                          )}
                        </Select>
                      </Form.Item>

                      {/* Terms & Marketing Checkboxes (Opsional, jika ingin dikirim ke backend) */}
                       <Form.Item name="agreeMarketing" valuePropName="checked" style={{marginBottom: '16px'}}>
                          <Checkbox>I agree to receive marketing communications.</Checkbox>
                       </Form.Item>

                       <Form.Item name="agreeTerms" valuePropName="checked" rules={[{ required: true, message: "Anda harus menyetujui syarat & ketentuan!" }]}>
                          <Checkbox>I agree to the <Link href="/terms">Terms & Conditions</Link> *</Checkbox>
                       </Form.Item>


                      {/* Submit Button */}
                      <Form.Item style={{ marginTop: "32px" }}>
                        <Button
                          type='primary'
                          htmlType='submit'
                          size='large'
                          block
                          disabled={!selectedPlan || isSubmitting}
                          loading={isSubmitting}
                          style={{
                            backgroundColor: selectedPlan ? "#3B82F6" : "#9CA3AF",
                            borderColor: selectedPlan ? "#3B82F6" : "#9CA3AF",
                            height: "48px",
                            fontSize: "16px",
                            fontWeight: "bold",
                          }}>
                          {isSubmitting ? 'Processing...' : (selectedPlan ? `Proceed to Payment for ${getSelectedPlanDetails()?.nama_paket}` : "Please Select a Package First")}
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
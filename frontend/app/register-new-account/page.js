"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Input,
  Select, // Select mungkin tidak perlu lagi jika tidak ada pilihan lain yang menggunakan Select
  Typography,
  Row,
  Col,
  Space,
  Form,
  message,
  Spin,
} from "antd";
import {
  UserAddOutlined,
  ArrowLeftOutlined,
  DropboxOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { API_USER } from "@/utils/endPoint"; // Menggunakan API_USER dari utils/endPoint

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
// const { Option } = Select; // Tidak perlu lagi jika Select tidak digunakan

export default function RegisterNewAccountPage() {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values) => {
    console.log('values', values)
    setIsSubmitting(true);
    try {
      // Payload yang akan dikirim ke backend Django.
      // Pastikan nama key sesuai dengan field yang diharapkan oleh UserCreateSerializer Anda.
      const payload = {
        username: values.username,
        first_name: values.firstName, // Dipetakan dari 'firstName' di form
        last_name: values.lastName,   // Dipetakan dari 'lastName' di form
        email: values.email,
        password: values.password,
        phone: values.phone, // Dipetakan dari 'phone' di form ke 'phone_number' untuk serializer
        tanggal_lahir: values.birthDate, // Input type='date' akan menghasilkan format YYYY-MM-DD secara otomatis
        address: values.address,
        kota: values.kota,
        kode_pos: values.kodePos, // Dipetakan dari 'kodePos' di form
        tempat_lahir: values.tempatLahir, // Dipetakan dari 'tempatLahir' di form
        role: 'member' // Menambahkan role 'member' seperti yang Anda inginkan
      };

      // Melakukan POST request ke endpoint API_USER
      const response = await axios.post(API_USER, payload);

      message.success(
        "Pendaftaran akun berhasil! Silakan login untuk melanjutkan."
      );
      router.push('/login');
    } catch (error) {
      console.error("Error during registration:", error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        let errorMessage = "Pendaftaran gagal: ";

        // Membangun pesan error dari respons backend
        for (const key in errorData) {
          if (Array.isArray(errorData[key])) {
            errorMessage += `${key}: ${errorData[key].join(', ')}. `;
          } else if (typeof errorData[key] === 'string') {
            errorMessage += `${key}: ${errorData[key]}. `;
          }
        }
        if (errorMessage === "Pendaftaran gagal: ") { // Jika tidak ada pesan spesifik
             errorMessage += JSON.stringify(errorData);
        }
        message.error(errorMessage);

      } else {
        message.error("Terjadi kesalahan saat pendaftaran. Silakan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <Link href='/' passHref>
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
              <Link href='/login' passHref>
                <Button type="default">Login</Button>
              </Link>
            </Col>
          </Row>
        </div>
      </nav>

      <div
        style={{ maxWidth: "800px", margin: "32px auto", padding: "0 16px" }}>
        <Card
          style={{
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            border: "1px solid #E5E7EB",
            padding: "20px",
          }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Title level={1} style={{ color: "#1F2937", marginBottom: "16px" }}>
              <UserAddOutlined style={{ color: "#3B82F6", marginRight: "12px" }}/>
              Daftar Akun Baru
            </Title>
            <Paragraph style={{ color: "#6B7280", fontSize: "18px" }}>
              Mulai perjalanan fitness Anda hari ini dengan mendaftar akun baru!
            </Paragraph>
          </div>

          <Form
            form={form}
            layout='vertical'
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Title level={5} style={{ color: "#1F2937", marginBottom: "16px" }}>
              Informasi Akun & Pribadi
            </Title>

            <Form.Item
              label={<Text style={{ color: "#374151" }}>Username *</Text>}
              name='username'
              rules={[{ required: true, message: "Mohon masukkan username Anda!" }]}>
              <Input placeholder='Masukkan username' style={{ borderColor: "#D1D5DB" }}/>
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<Text style={{ color: "#374151" }}>Nama Depan *</Text>}
                  name='firstName'
                  rules={[{ required: true, message: "Mohon masukkan nama depan Anda!" }]}>
                  <Input placeholder='Masukkan nama depan' style={{ borderColor: "#D1D5DB" }}/>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<Text style={{ color: "#374151" }}>Nama Belakang *</Text>}
                  name='lastName'
                  rules={[{ required: true, message: "Mohon masukkan nama belakang Anda!" }]}>
                  <Input placeholder='Masukkan nama belakang' style={{ borderColor: "#D1D5DB" }}/>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={<Text style={{ color: "#374151" }}>Email *</Text>}
              name='email'
              rules={[
                { required: true, message: "Mohon masukkan email Anda!" },
                { type: "email", message: "Mohon masukkan email yang valid!" },
              ]}>
              <Input placeholder='nama@email.com' style={{ borderColor: "#D1D5DB" }}/>
            </Form.Item>

            <Form.Item
              label={<Text style={{ color: "#374151" }}>Password *</Text>}
              name='password'
              rules={[
                { required: true, message: "Mohon masukkan password Anda!" },
                { min: 6, message: "Password minimal 6 karakter!" },
              ]}>
              <Input.Password placeholder='Masukkan password' style={{ borderColor: "#D1D5DB" }}/>
            </Form.Item>

            <Form.Item
              label={<Text style={{ color: "#374151" }}>Konfirmasi Password *</Text>}
              name='passwordConfirm'
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: "Mohon konfirmasi password Anda!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Password tidak cocok!'));
                  },
                }),
              ]}>
              <Input.Password placeholder='Konfirmasi password' style={{ borderColor: "#D1D5DB" }}/>
            </Form.Item>

            <Form.Item
              label={<Text style={{ color: "#374151" }}>Nomor Telepon *</Text>}
              name='phone'
              rules={[
                { required: true, message: "Mohon masukkan nomor telepon Anda!" },
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.resolve();
                    }
                    if (!value.startsWith('62')) {
                      return Promise.reject(new Error('Nomor telepon harus diawali dengan 62! Contoh: 628123456789'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}>
              <Input placeholder='628xxxxxxxxxx' style={{ borderColor: "#D1D5DB" }}/>
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<Text style={{ color: "#374151" }}>Tanggal Lahir *</Text>}
                  name='birthDate'
                  rules={[{ required: true, message: "Mohon pilih tanggal lahir Anda!" }]}>
                  {/* Input type='date' secara otomatis menghasilkan YYYY-MM-DD */}
                  <Input type='date' style={{ borderColor: "#D1D5DB" }}/>
                </Form.Item>
              </Col>
              {/* Kolom Jenis Kelamin telah dihapus */}
            </Row>

            <Form.Item
              label={<Text style={{ color: "#374151" }}>Alamat Lengkap *</Text>}
              name='address'
              rules={[{ required: true, message: "Mohon masukkan alamat lengkap Anda!" }]}>
              <TextArea rows={3} placeholder='Masukkan alamat lengkap Anda' style={{ borderColor: "#D1D5DB" }}/>
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<Text style={{ color: "#374151" }}>Kota *</Text>}
                  name='kota'
                  rules={[{ required: true, message: "Mohon masukkan kota Anda!" }]}>
                  <Input placeholder='Masukkan kota' style={{ borderColor: "#D1D5DB" }}/>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<Text style={{ color: "#374151" }}>Kode Pos *</Text>}
                  name='kodePos'
                  rules={[{ required: true, message: "Mohon masukkan kode pos Anda!" }]}>
                  <Input placeholder='Masukkan kode pos' style={{ borderColor: "#D1D5DB" }}/>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={<Text style={{ color: "#374151" }}>Tempat Lahir *</Text>}
              name='tempatLahir'
              rules={[{ required: true, message: "Mohon masukkan tempat lahir Anda!" }]}>
              <Input placeholder='Masukkan tempat lahir' style={{ borderColor: "#D1D5DB" }}/>
            </Form.Item>

            <Form.Item style={{ marginTop: "32px" }}>
              <Button
                type='primary'
                htmlType='submit'
                size='large'
                block
                loading={isSubmitting}
                style={{
                  backgroundColor: "#3B82F6",
                  borderColor: "#3B82F6",
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}>
                {isSubmitting ? 'Mendaftar...' : 'Daftar Akun Baru'}
              </Button>
            </Form.Item>

            <Paragraph style={{ textAlign: "center", marginTop: "16px" }}>
              Sudah punya akun?{" "}
              <Link href='/login' passHref>
                <Text strong style={{ color: "#2563EB" }}>Login di sini</Text>
              </Link>
            </Paragraph>
          </Form>
        </Card>
      </div>
    </div>
  );
}
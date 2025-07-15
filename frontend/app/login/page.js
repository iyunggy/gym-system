"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Space,
} from "antd";
import { UserOutlined, LockOutlined, FireOutlined } from "@ant-design/icons";
import { BASE_API_URL } from "@/lib/contants";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_API_URL}/auth/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("authToken", data.token); // Simpan token di localStorage
      message.success("Login successful!");
      router.push("/dashboard"); // Arahkan ke dashboard
    } catch (error) {
      message.error("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)",
      }}>
      <Content>
        <Card
          className='fade-in'
          style={{
            width: 400,
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          title={
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <FireOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
              <Title level={3} style={{ margin: "10px 0 0", color: "#1890ff" }}>
                GymEase Admin Login
              </Title>
              <Paragraph type='secondary'>
                Enter your credentials to access the dashboard
              </Paragraph>
            </div>
          }
          headStyle={{ borderBottom: "none" }}
          bodyStyle={{ padding: "0 24px 24px" }}>
          <Form
            name='login'
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout='vertical'>
            <Form.Item
              name='username'
              rules={[
                { required: true, message: "Please input your Username!" },
              ]}>
              <Input
                prefix={<UserOutlined className='site-form-item-icon' />}
                placeholder='Username'
                size='large'
              />
            </Form.Item>
            <Form.Item
              name='password'
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}>
              <Input.Password
                prefix={<LockOutlined className='site-form-item-icon' />}
                placeholder='Password'
                size='large'
              />
            </Form.Item>
            <Form.Item>
              <Button
                type='primary'
                htmlType='submit'
                loading={loading}
                block
                size='large'>
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
}

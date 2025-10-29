
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import AuthForm from "../../components/auth/AuthForm";
import { useAuth } from "../../context/AuthContext";

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuth(); // grab login from context

  const handleSuccess = async (res: any) => {
    const token = res.data.token;
    await login(token); //  updates context immediately
    router.push("/posts"); // redirect without refresh
  };

  return (
    <AuthForm<LoginForm>
      initialValues={{ email: "", password: "" }}
      fields={[
        { name: "email", type: "email", placeholder: "Email" },
        { name: "password", type: "password", placeholder: "Password" },
      ]}
      endpoint="https://myblogyousuf-backend.vercel.app/auth/login"
      submitLabel="Login"
      onSuccess={handleSuccess}
    />
  );
};

export default LoginPage;

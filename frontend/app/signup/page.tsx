"use client";
import React from "react";
import AuthForm from "../components/auth/AuthForm";

interface SignupForm {
  name: string;
  email: string;
  password: string;
}

const initialSignupValues: SignupForm = {
  name: "",
  email: "",
  password: "",
};

const signupFields = [
  { name: "name", placeholder: "Name" },
  { name: "email", type: "email", placeholder: "Email" },
  { name: "password", type: "password", placeholder: "Password" },
];

const SignupPage = () => {
  return (
    <AuthForm<SignupForm>
      initialValues={initialSignupValues}
      fields={signupFields}
      endpoint="http://localhost:5000/api/auth/register"
      submitLabel="Sign Up"
    />
  );
};

export default SignupPage;

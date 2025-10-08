import React, { ChangeEvent, FormEvent, useState } from "react";
import axios from "axios";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Field {
  name: string;
  type?: string;
  placeholder: string;
}

interface AuthFormProps<T> {
  initialValues: T;
  fields: Field[];
  endpoint: string;
  submitLabel: string;
  onSuccess?: (response: any) => void;
}
interface ApiResponse{
  message:string;
}

function AuthForm<T extends Record<string, any>>({
  initialValues,
  fields,
  endpoint,
  submitLabel,
  onSuccess,
}: AuthFormProps<T>) {
  const [form, setForm] = useState<T>(initialValues);
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState(false);

  // const { login } = useAuth();
  const router = useRouter();

  // update input values
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // handle submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(`${submitLabel}...`);

    try {
      const res = await axios.post<ApiResponse>(endpoint, form);
      console.log(res);
      setMessage(res.data.message || `${submitLabel} successful!`);
      // login(res.data.token);
      router.push("/login");

      if (onSuccess) onSuccess(res);
      setIsError(false);
      // optional custom logic
    } catch (err: any) {
      if (err.response?.status === 400) {
        setIsError(true);
      } else {
        setIsError(false);
      }
      setMessage(
        err.response?.data?.message ||
          `Error during ${submitLabel.toLowerCase()}`
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-96 space-y-4"
      >
        <h1 className="text-xl font-bold">{submitLabel}</h1>
        {/* Render inputs dynamically */}
        {fields.map(({ name, type = "text", placeholder }) => (
          <input
            key={name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={form[name]}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        ))}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {submitLabel}
        </button>
        <p className={isError ? "text-red-600" : "text-gray-600"}>{message}</p>
        <Link
          href={submitLabel === "Login" ? "/signup" : "/login"}
          className="text-blue-400 flex justify-end cursor-pointer underline"
        >
          {submitLabel === "Login" ? "Register" : "Login"} Now
        </Link>{" "}
      </form>
    </div>
  );
}

export default AuthForm;

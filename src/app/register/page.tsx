"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiClientError } from "@/ui/api/client";
import { Alert, Button, Card, CardContent, CardHeader, Input, Select, Spinner } from "@/ui/components";
import { useAuth } from "@/ui/providers/AuthProvider";
import { mapValidationErrors } from "@/ui/utils/validation";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "guest">("user");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      await register({ name, email, password, role });
      router.push("/dashboard");
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError(caughtError.message);
        setFieldErrors(mapValidationErrors(caughtError.details));
      } else {
        setError("Terjadi kesalahan. Coba lagi.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-xl font-semibold text-slate-900">Register</h1>
          <p className="mt-1 text-sm text-slate-500">Buat akun untuk mengakses dashboard</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {error ? <Alert tone="danger">{error}</Alert> : null}
            <Input
              label="Nama"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={fieldErrors.name}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={fieldErrors.email}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={fieldErrors.password}
              required
            />
            <Select
              label="Role"
              name="role"
              value={role}
              onChange={(event) => setRole(event.target.value as "user" | "guest")}
              options={[
                { label: "User", value: "user" },
                { label: "Guest (read-only)", value: "guest" },
              ]}
            />
            <Button className="w-full" isLoading={submitting} type="submit">
              {submitting ? <Spinner /> : null}
              Register
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Link className="font-medium text-emerald-700 hover:text-emerald-800" href="/login">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

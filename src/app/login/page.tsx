"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiClientError } from "@/ui/api/client";
import { Alert, Button, Card, CardContent, CardHeader, Input, Spinner } from "@/ui/components";
import { useAuth } from "@/ui/providers/AuthProvider";
import { mapValidationErrors } from "@/ui/utils/validation";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await login({ email, password });
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
          <h1 className="text-xl font-semibold text-slate-900">Login</h1>
          <p className="mt-1 text-sm text-slate-500">Masuk ke Trip Budgeting Console</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {error ? <Alert tone="danger">{error}</Alert> : null}
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={fieldErrors.email}
              placeholder="you@company.com"
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
            <Button className="w-full" isLoading={submitting} type="submit">
              {submitting ? <Spinner /> : null}
              Login
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Belum punya akun?{" "}
            <Link className="font-medium text-emerald-700 hover:text-emerald-800" href="/register">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

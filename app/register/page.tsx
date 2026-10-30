
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import {
  Waves,
  Mail,
  LockKeyhole,
  UserRound,
  ArrowRight,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (name.trim().length < 2) {
      setError("Nama minimal 2 karakter.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              display_name: name.trim(),
            },
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setMessage(
        "Pendaftaran diproses. Jika akun belum bisa login, periksa pengaturan Confirm email di Supabase."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registrasi gagal. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080e14] px-5 py-16 text-white">
      <div className="w-full max-w-lg border border-white/10 bg-[#101c26] p-7 md:p-12">

        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-3 text-[#a8d9e8]"
        >
          <Waves size={24} />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">
            Jakarta Underwater / 2020
          </span>
        </Link>

        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#a8d9e8]">
          User Registration
        </p>

        <h1 className="mt-5 text-4xl font-black uppercase tracking-tight md:text-5xl">
          CREATE
          <br />
          <span className="text-[#a8d9e8]">
            ACCOUNT.
          </span>
        </h1>

        <p className="mt-5 text-sm leading-7 text-slate-400">
          Buat akun untuk mengakses fitur pengguna
          Jakarta Underwater — 2020.
        </p>

        <form
          onSubmit={handleRegister}
          className="mt-10 space-y-5"
        >

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm text-slate-300"
            >
              Nama Pengguna
            </label>

            <div className="flex items-center gap-3 border border-white/15 bg-[#0b1620] px-4">
              <UserRound
                size={18}
                className="text-[#a8d9e8]"
              />

              <input
                id="name"
                type="text"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama"
                className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm text-slate-300"
            >
              Email
            </label>

            <div className="flex items-center gap-3 border border-white/15 bg-[#0b1620] px-4">
              <Mail
                size={18}
                className="text-[#a8d9e8]"
              />

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-slate-300"
            >
              Password
            </label>

            <div className="flex items-center gap-3 border border-white/15 bg-[#0b1620] px-4">
              <LockKeyhole
                size={18}
                className="text-[#a8d9e8]"
              />

              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm text-slate-300"
            >
              Konfirmasi Password
            </label>

            <div className="flex items-center gap-3 border border-white/15 bg-[#0b1620] px-4">
              <LockKeyhole
                size={18}
                className="text-[#a8d9e8]"
              />

              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Ulangi password"
                className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm text-red-300"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="text-sm text-[#a8d9e8]"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 bg-[#a8d9e8] px-6 py-4 text-sm font-black uppercase tracking-widest text-[#080e14] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Mendaftarkan..."
              : "DAFTAR SEKARANG"}

            {!loading && <ArrowRight size={18} />}
          </button>

        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-bold text-[#a8d9e8] hover:underline"
          >
            Login di sini
          </Link>
        </p>

      </div>
    </main>
  );
}

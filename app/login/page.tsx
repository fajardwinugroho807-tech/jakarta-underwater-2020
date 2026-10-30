
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

import {
  Waves,
  Mail,
  LockKeyhole,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // LOGIN MENGGUNAKAN SUPABASE AUTH
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        throw loginError;
      }

      if (!data.user) {
        throw new Error("Data akun tidak ditemukan.");
      }

      // CEK ROLE ADMIN
      // Pemeriksaan tetap dipertahankan agar
      // validasi akun berjalan seperti sebelumnya.
      const { error: roleError } = await supabase
        .from("admins")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (roleError) {
        throw new Error(
          "Gagal memeriksa role: " + roleError.message
        );
      }

      // STEP 65:
      // ADMIN DAN PENGGUNA MASUK KE HOMEPAGE
      // Dashboard diakses melalui sidebar homepage.
      router.replace("/");
      router.refresh();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login gagal. Silakan coba lagi."
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
          Secure Authentication
        </p>

        <h1 className="mt-5 text-4xl font-black uppercase tracking-tight md:text-5xl">
          WELCOME
          <br />
          <span className="text-[#a8d9e8]">
            BACK.
          </span>
        </h1>

        <p className="mt-5 text-sm leading-7 text-slate-400">
          Login untuk kembali ke homepage dan mengakses
          dashboard sesuai hak akses akun.
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-10 space-y-5"
        >
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
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

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 bg-[#a8d9e8] px-6 py-4 text-sm font-black uppercase tracking-widest text-[#080e14] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Memproses..." : "LOGIN"}

            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-bold text-[#a8d9e8] hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>

      </div>
    </main>
  );
}

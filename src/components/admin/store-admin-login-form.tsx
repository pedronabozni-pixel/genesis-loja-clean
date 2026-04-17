"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function StoreAdminLoginForm({ nextPath = "/admin-loja" }: { nextPath?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");

    const response = await fetch("/api/loja-admin/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Senha inválida.");
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <label className="block text-sm font-medium text-zinc-300" htmlFor="password">
        Senha do painel
      </label>
      <input
        className="w-full rounded-2xl border border-zinc-700 bg-zinc-950/90 px-4 py-3.5 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10"
        id="password"
        name="password"
        placeholder="Digite a senha de acesso"
        type="password"
      />
      <button
        className="w-full rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-orange-300 px-4 py-3.5 text-sm font-bold text-zinc-950 shadow-[0_20px_40px_-24px_rgba(251,191,36,1)] transition hover:brightness-105 disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? "Entrando..." : "Acessar Painel"}
      </button>
      {error ? <p className="rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
    </form>
  );
}

export const STORE_NAME = "Genesis Distribuidora";

export const ADMIN_CONFIG = {
  // Senha de acesso ao painel /admin-loja. Troque em producao por variavel de ambiente.
  password: process.env.STORE_ADMIN_PASSWORD ?? "G3n3s1sK0r3K@2010",
  // Token de sessao simples para proteger rotas admin via cookie.
  sessionToken: process.env.STORE_ADMIN_SESSION_TOKEN ?? "genesis-admin-session-ok"
};

export const ADMIN_COOKIE_NAME = "genesis_admin_session";

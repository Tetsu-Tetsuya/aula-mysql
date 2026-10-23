import dotenv from "dotenv";
import mysql from "mysql2/promise";

// Lê as variáveis do arquivo .env (que fica só no servidor).
dotenv.config();

// Pool: um conjunto de conexões reaproveitadas entre as requisições.
export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "aula_mysql",
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
});

// Confirma que o MySQL responde antes de o servidor abrir a porta HTTP.
export async function testarConexao(): Promise<void> {
  const conexao = await pool.getConnection();
  try {
    await conexao.query("SELECT 1");
  } finally {
    conexao.release();
  }
}

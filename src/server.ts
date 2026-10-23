import path from "path";
import express from "express";
import { testarConexao } from "./config/database";
import { alunosRouter } from "./routes/alunos";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// Interpreta corpos JSON enviados pelo fetch do navegador.
app.use(express.json());

// Serve index.html, CSS e o JavaScript gerado da pasta public/.
app.use(express.static(path.join(__dirname, "..", "public")));

// Verificação rápida de que o servidor está de pé.
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/alunos", alunosRouter);

// Testa o MySQL antes de abrir a porta HTTP.
async function iniciar(): Promise<void> {
  try {
    await testarConexao();
    console.log("Conexão com MySQL estabelecida.");
  } catch (erro) {
    console.error("Falha ao conectar no MySQL. Confira o serviço e o arquivo .env.");
    console.error((erro as Error).message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Servidor em http://localhost:${PORT}`);
  });
}

iniciar();

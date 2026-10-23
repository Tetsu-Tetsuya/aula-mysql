import { Router, Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/database";
import { Aluno, NovoAluno } from "../types/aluno";

export const alunosRouter = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valida e normaliza o corpo da requisição. Devolve a mensagem de erro ou os dados limpos.
function validarAluno(corpo: unknown): { erro: string } | { dados: NovoAluno } {
  const b = (corpo ?? {}) as Record<string, unknown>;
  const nome = typeof b.nome === "string" ? b.nome.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  const curso = typeof b.curso === "string" ? b.curso.trim() : "";

  if (!nome || !email || !curso) return { erro: "Preencha nome, e-mail e curso." };
  if (nome.length > 120) return { erro: "O nome deve ter no máximo 120 caracteres." };
  if (email.length > 160 || !EMAIL_REGEX.test(email)) return { erro: "Informe um e-mail válido." };
  if (curso.length > 120) return { erro: "O curso deve ter no máximo 120 caracteres." };

  return { dados: { nome, email, curso } };
}

// GET /api/alunos?nome=fragmento → lista todos, ou filtra por parte do nome.
alunosRouter.get("/", async (req: Request, res: Response) => {
  try {
    const nome = typeof req.query.nome === "string" ? req.query.nome.trim() : "";
    let linhas: RowDataPacket[];

    if (nome) {
      // O ? envia o valor separado do SQL: o texto nunca vira comando.
      [linhas] = await pool.query<RowDataPacket[]>(
        "SELECT id, nome, email, curso FROM alunos WHERE nome LIKE ? ORDER BY id DESC",
        [`%${nome}%`]
      );
    } else {
      [linhas] = await pool.query<RowDataPacket[]>(
        "SELECT id, nome, email, curso FROM alunos ORDER BY id DESC"
      );
    }

    res.status(200).json(linhas as Aluno[]);
  } catch (erro) {
    console.error("Erro ao consultar alunos:", erro);
    res.status(500).json({ erro: "Não foi possível consultar os alunos." });
  }
});

// POST /api/alunos → cadastra um aluno.
alunosRouter.post("/", async (req: Request, res: Response) => {
  const resultado = validarAluno(req.body);
  if ("erro" in resultado) {
    res.status(400).json({ erro: resultado.erro });
    return;
  }

  const { nome, email, curso } = resultado.dados;
  try {
    const [info] = await pool.execute<ResultSetHeader>(
      "INSERT INTO alunos (nome, email, curso) VALUES (?, ?, ?)",
      [nome, email, curso]
    );
    const aluno: Aluno = { id: info.insertId, nome, email, curso };
    res.status(201).json(aluno);
  } catch (erro) {
    if ((erro as { code?: string }).code === "ER_DUP_ENTRY") {
      res.status(409).json({ erro: "Já existe um aluno com esse e-mail." });
      return;
    }
    console.error("Erro ao cadastrar aluno:", erro);
    res.status(500).json({ erro: "Não foi possível cadastrar o aluno." });
  }
});

// DELETE /api/alunos/:id → exclui pelo id.
alunosRouter.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ erro: "ID inválido." });
    return;
  }

  try {
    const [info] = await pool.execute<ResultSetHeader>("DELETE FROM alunos WHERE id = ?", [id]);
    if (info.affectedRows === 0) {
      res.status(404).json({ erro: "Aluno não encontrado." });
      return;
    }
    res.status(200).json({ mensagem: "Aluno excluído com sucesso." });
  } catch (erro) {
    console.error("Erro ao excluir aluno:", erro);
    res.status(500).json({ erro: "Não foi possível excluir o aluno." });
  }
});

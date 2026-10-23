// Registro completo, como vem do banco.
export interface Aluno {
  id: number;
  nome: string;
  email: string;
  curso: string;
}

// Dados enviados pelo formulário para cadastrar (o id é gerado pelo MySQL).
export interface NovoAluno {
  nome: string;
  email: string;
  curso: string;
}

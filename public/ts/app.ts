// Mesmo formato que a API devolve.
interface Aluno {
  id: number;
  nome: string;
  email: string;
  curso: string;
}

const API = "/api/alunos";

const formAluno = document.getElementById("form-aluno") as HTMLFormElement;
const inputNome = document.getElementById("nome") as HTMLInputElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputCurso = document.getElementById("curso") as HTMLInputElement;
const formBusca = document.getElementById("form-busca") as HTMLFormElement;
const inputBusca = document.getElementById("busca") as HTMLInputElement;
const btnLimpar = document.getElementById("btn-limpar") as HTMLButtonElement;
const lista = document.getElementById("lista-alunos") as HTMLTableSectionElement;
const mensagem = document.getElementById("mensagem") as HTMLParagraphElement;
const painelConfirmacao = document.getElementById("confirmacao") as HTMLDivElement;
const textoConfirmacao = document.getElementById("texto-confirmacao") as HTMLParagraphElement;
const btnConfirmar = document.getElementById("btn-confirmar") as HTMLButtonElement;
const btnCancelar = document.getElementById("btn-cancelar") as HTMLButtonElement;

// Aluno aguardando confirmação de exclusão.
let alunoParaExcluir: Aluno | null = null;

function mostrarMensagem(texto: string, tipo: "sucesso" | "erro"): void {
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo}`;
}

// Lê a mensagem de erro do JSON da API, se houver.
async function lerErro(resposta: Response): Promise<string> {
  try {
    const corpo = (await resposta.json()) as { erro?: string };
    return corpo.erro ?? `Erro ${resposta.status}.`;
  } catch {
    return `Erro ${resposta.status}.`;
  }
}

// textContent impede que o texto vindo do banco seja interpretado como HTML.
function renderizar(alunos: Aluno[]): void {
  lista.replaceChildren();

  if (alunos.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.textContent = "Nenhum aluno encontrado.";
    tr.appendChild(td);
    lista.appendChild(tr);
    return;
  }

  for (const aluno of alunos) {
    const tr = document.createElement("tr");
    for (const valor of [String(aluno.id), aluno.nome, aluno.email, aluno.curso]) {
      const td = document.createElement("td");
      td.textContent = valor;
      tr.appendChild(td);
    }
    const tdAcao = document.createElement("td");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-perigo";
    btn.textContent = "Excluir";
    btn.addEventListener("click", () => pedirConfirmacao(aluno));
    tdAcao.appendChild(btn);
    tr.appendChild(tdAcao);
    lista.appendChild(tr);
  }
}

async function carregarAlunos(filtro = ""): Promise<void> {
  const url = filtro ? `${API}?nome=${encodeURIComponent(filtro)}` : API;
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) {
      mostrarMensagem(await lerErro(resposta), "erro");
      return;
    }
    renderizar((await resposta.json()) as Aluno[]);
  } catch {
    mostrarMensagem("Não foi possível falar com o servidor.", "erro");
  }
}

async function cadastrar(evento: SubmitEvent): Promise<void> {
  evento.preventDefault();

  const nome = inputNome.value.trim();
  const email = inputEmail.value.trim();
  const curso = inputCurso.value.trim();

  if (!nome || !email || !curso) {
    mostrarMensagem("Preencha nome, e-mail e curso.", "erro");
    return;
  }
  if (!inputEmail.checkValidity()) {
    mostrarMensagem("Informe um e-mail válido.", "erro");
    return;
  }

  try {
    const resposta = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, curso }),
    });
    if (resposta.status !== 201) {
      mostrarMensagem(await lerErro(resposta), "erro");
      return;
    }
    const novo = (await resposta.json()) as Aluno;
    mostrarMensagem(`Aluno ${novo.nome} cadastrado (ID ${novo.id}).`, "sucesso");
    formAluno.reset();
    inputNome.focus();
    await carregarAlunos(inputBusca.value.trim());
  } catch {
    mostrarMensagem("Não foi possível falar com o servidor.", "erro");
  }
}

// Painel próprio no lugar de window.confirm.
function pedirConfirmacao(aluno: Aluno): void {
  alunoParaExcluir = aluno;
  textoConfirmacao.textContent = `Excluir ${aluno.nome} (ID ${aluno.id})? Esta ação não pode ser desfeita.`;
  painelConfirmacao.hidden = false;
  btnConfirmar.focus();
}

function fecharConfirmacao(): void {
  alunoParaExcluir = null;
  painelConfirmacao.hidden = true;
}

async function excluirConfirmado(): Promise<void> {
  if (!alunoParaExcluir) return;
  const aluno = alunoParaExcluir;
  fecharConfirmacao();

  try {
    const resposta = await fetch(`${API}/${aluno.id}`, { method: "DELETE" });
    if (!resposta.ok) {
      mostrarMensagem(await lerErro(resposta), "erro");
    } else {
      mostrarMensagem(`Aluno ${aluno.nome} excluído.`, "sucesso");
    }
    await carregarAlunos(inputBusca.value.trim());
  } catch {
    mostrarMensagem("Não foi possível falar com o servidor.", "erro");
  }
}

formAluno.addEventListener("submit", cadastrar);
formBusca.addEventListener("submit", (evento) => {
  evento.preventDefault();
  carregarAlunos(inputBusca.value.trim());
});
btnLimpar.addEventListener("click", () => {
  inputBusca.value = "";
  mensagem.textContent = "";
  carregarAlunos();
});
btnConfirmar.addEventListener("click", excluirConfirmado);
btnCancelar.addEventListener("click", fecharConfirmacao);

carregarAlunos();

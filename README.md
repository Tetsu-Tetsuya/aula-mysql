# Cadastro de alunos — aula prática Node

CRUD mínimo (inserir, consultar e excluir) com TypeScript, Express e MySQL local.

## Passo a passo

1. **Pré-requisitos:** Node.js, npm e MySQL Server instalados.
   ```
   node --version
   npm --version
   mysql --version
   ```

2. **Configuração privada:** copie o modelo e edite com seus dados locais do MySQL.
   - Windows: `copy .env.example .env`
   - Linux/macOS: `cp .env.example .env`

   Se a senha for vazia, deixe `DB_PASSWORD=` (sem o texto de exemplo).

3. **Banco e tabela:**
   ```
   mysql -u root -p < banco.sql
   ```
   Para conferir no cliente SQL: `USE aula_mysql; DESCRIBE alunos;`

4. **Dependências, compilação e execução:**
   ```
   npm install
   npm run build
   npm start
   ```
   (`npm run dev` faz o build e o start de uma vez.)

   O terminal deve mostrar **"Conexão com MySQL estabelecida."**

5. **Abrir:** http://localhost:3000
   Saúde do servidor: http://localhost:3000/api/health → `{"status":"ok"}`

## Rotas da API

| Método | Rota | Resposta |
|---|---|---|
| GET | `/api/alunos` | 200 — lista em ordem decrescente de ID |
| GET | `/api/alunos?nome=Ana` | 200 — filtra por parte do nome |
| POST | `/api/alunos` | 201 criado · 400 dados inválidos · 409 e-mail duplicado |
| DELETE | `/api/alunos/:id` | 200 excluído · 400 ID inválido · 404 não encontrado |

Erros inesperados do banco respondem 500 sem expor detalhes ao navegador.

## Teste guiado

1. Cadastre Ana Souza (ana.souza@exemplo.com, Desenvolvimento de Sistemas), Bruno Lima (bruno.lima@exemplo.com, Redes de Computadores) e Carla Mendes (carla.mendes@exemplo.com, Desenvolvimento de Sistemas).
2. Clique em **Limpar**: os três aparecem do maior para o menor ID.
3. Busque `Ana`: só ela aparece. Limpe a busca.
4. Clique em **Excluir** no Bruno → **Confirmar exclusão**. Restam Ana e Carla.
5. Na aba **Rede** do navegador, observe POST 201, GET 200, DELETE 200, 404, 400 e 409.

## Observações

- `public/js/app.js` é gerado a partir de `public/ts/app.ts`. Edite só o `.ts` e rode `npm run build:frontend`.
- O navegador nunca fala direto com o MySQL; as credenciais ficam só no `.env` do servidor.
- Todas as consultas usam placeholders `?` (consultas parametrizadas), o que impede SQL injection.

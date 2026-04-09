# sistema

## API REST (backend)

O backend Flask expõe recursos principais que o frontend deve consumir diretamente:

### Pacientes
- `GET /api/pacientes`: lista todos os pacientes
- `POST /api/pacientes`: cria um paciente (campo `nome` obrigatório)
- `GET /api/pacientes/<id>` / `PATCH /api/pacientes/<id>` / `DELETE /api/pacientes/<id>`: operações de leitura, atualização parcial e remoção

### Agenda, Sessões, Financeiro e Registros
- Cada grupo segue o mesmo padrão (`GET` (lista), `POST` (insere), `GET`/`PATCH`/`DELETE` por `<id>`)
- Validações obrigam `paciente_id` e campos essenciais, confirmam existência do paciente e garantem valores numéricos quando necessários (ex.: `valor` do financeiro)
- A criação de registros preenche o `paciente_nome` automaticamente se não vier no payload

### Relatórios e Exportação
- `GET /api/relatorio_pdf/<paciente_id>` gera um PDF de evolução com os dados do paciente e suas sessões (usa `reportlab`).
- `GET /api/exportar/pacientes`, `/api/exportar/agenda` e `/api/exportar/financeiro` retornam planilhas Excel (XLSX) com os dados atuais.

## Integração com o novo frontend

O frontend atualizado está dentro de `gendo-pro` e deve ser compilado antes de rodar o Flask:

1. Instale as dependências da aplicação moderna (é necessário acesso à internet):
   ```
   cd gendo-pro
   npm install
   npm run build
   ```
2. Volte para a raiz e sincronize os assets compilados:
   ```
   python sistema/scripts/sync_frontend.py
   ```
   Esse utilitário copia o `index.html` gerado para `sistema/templates` e todos os ativos para `sistema/static`.
3. Inicie o Flask (`python app.py`) e use o SPA em todas as rotas não prefixadas com `/api`.

## Endpoints utilizados pelo SPA

O frontend moderno consome os seguintes recursos em `/api`:

| Caminho | Método | Observação |
| --- | --- | --- |
| `/api/patients` | `GET` / `POST` | Listagem e criação de pacientes (campos em inglês). |
| `/api/patients/<id>` | `PUT` / `DELETE` | Atualiza ou exclui o paciente informado. |
| `/api/appointments` | `GET` / `POST` | Agenda em inglês (usa nome do paciente). |
| `/api/appointments/<id>` | `PUT` / `DELETE` | Atualiza/exclui um agendamento. |
| `/api/records` | `GET` / `POST` | Históricos médicos (`registros`). |
| `/api/financial` | `GET` / `POST` | Histórico e registro financeiro. |
| `/api/dashboard` | `GET` | Métricas, agendamentos do dia e pagamentos recentes. |
| `/api/notifications` | `GET` | Lista as notificações persistidas. |
| `/api/notifications/<id>/read` | `PUT` | Marca uma notificação como lida. |
| `/api/notifications/mark-all-read` | `POST` | Marca todas como lidas. |
| `/api/reports/patient-pdf` | `POST` | Gera o link para o PDF do paciente mais recente. |
| `/api/reports/export-excel` | `POST` | Retorna o link para exportar pacientes. |

### Notas
- Até compilar os assets, o Flask mostra um aviso em `templates/index.html` com instruções.
- A nova tabela `notifications` guarda o estado lido das notificações.

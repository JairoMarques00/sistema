/*
APP.JS COMPLETO
Sistema Psicopedagogia
*/

const API_BASE = "";


/* ---------------- API ---------------- */

async function apiRequest(method, path, body = null) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    };

    if (body !== null) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(API_BASE + path, options);
    const raw = await response.text();

    if (!response.ok) {
        let message = `Erro ${response.status}`;
        if (raw) {
            try {
                const payload = JSON.parse(raw);
                message = payload.message || payload.error || JSON.stringify(payload);
            } catch (err) {
                message = raw;
            }
        }
        throw new Error(message);
    }

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (err) {
        return raw;
    }
}


/* ---------------- ALERT ---------------- */

function showAlert(container,message,type="success"){

    if(!container) return

    container.innerHTML = `
    <div class="alert alert-${type}">
    ${message}
    </div>
    `

}

function showError(container, error) {
    const message = error?.message || "Erro inesperado";
    showAlert(container, message, "danger");
}


/* ---------------- FORMAT ---------------- */

function formatDate(dateISO){

    if(!dateISO) return ""

    return new Date(dateISO).toLocaleDateString("pt-BR")

}

function formatTime(time){

    if(!time) return ""

    return time

}

function formatCurrency(value) {
    if (value === null || value === undefined || value === "") return "";
    const number = Number(value);
    if (Number.isNaN(number)) return "";
    return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}


/* ---------------- SELECT PACIENTES ---------------- */

async function buildPatientSelect(select){

    if (!select) return []

    const patients = await apiRequest("GET", "/api/pacientes")

    select.innerHTML=""

    const option = document.createElement("option")
    option.value=""
    option.textContent="Selecione paciente"

    select.appendChild(option)

    patients.forEach(p=>{

        const opt=document.createElement("option")

        opt.value=p.id
        opt.textContent=p.nome

        select.appendChild(opt)

    })

    return patients

}


/* ================================================= */
/* CADASTRO PACIENTES */
/* ================================================= */

async function initCadastroPage() {
    const form = document.getElementById("cadastroForm");
    const table = document.getElementById("patientsTable");
    const alertContainer = document.getElementById("cadastroAlert");
    if (!form || !table) return;

    async function refresh() {
        try {
            const patients = await apiRequest("GET", "/api/pacientes");
            table.innerHTML = "";

            patients.forEach((p) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${p.nome}</td>
                    <td>${p.idade || ""}</td>
                    <td>${p.telefone || ""}</td>
                    <td>${p.email || ""}</td>
                `;

                const actionsCell = document.createElement("td");
                actionsCell.classList.add("text-end");

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.className = "btn btn-danger btn-sm";
                deleteButton.textContent = "Excluir";
                deleteButton.addEventListener("click", async () => {
                    try {
                        await deletePatient(p.id);
                        showAlert(alertContainer, "Paciente removido.", "success");
                        await refresh();
                    } catch (error) {
                        showError(alertContainer, error);
                    }
                });

                actionsCell.appendChild(deleteButton);
                row.appendChild(actionsCell);

                table.appendChild(row);
            });
        } catch (error) {
            showError(alertContainer, error);
        }
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = new FormData(form);

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const payload = {
            nome: data.get("nome"),
            idade: data.get("idade") || null,
            telefone: data.get("telefone"),
            email: data.get("email"),
        };

        try {
            await apiRequest("POST", "/api/pacientes", payload);
            form.reset();
            showAlert(alertContainer, "Paciente cadastrado com sucesso.");
            await refresh();
        } catch (error) {
            showError(alertContainer, error);
        }
    });

    refresh();
}


async function deletePatient(id) {
    if (!id) return;
    if (!confirm("Remover paciente?")) return;
    await apiRequest("DELETE", `/api/pacientes/${id}`);
}


/* ================================================= */
/* LISTA PACIENTES */
/* ================================================= */

async function initListaPacientesPage() {
    const table = document.getElementById("patientsListTable");
    const alertContainer = document.getElementById("patientsListAlert");
    const form = document.getElementById("editPatientForm");
    const editingId = document.getElementById("editingId");
    const editNome = document.getElementById("editNome");
    const editIdade = document.getElementById("editIdade");
    const editEscola = document.getElementById("editEscola");
    const editResponsavel = document.getElementById("editResponsavel");
    const editTelefone = document.getElementById("editTelefone");
    const editEmail = document.getElementById("editEmail");
    const editObservacoes = document.getElementById("editObservacoes");

    if (!table) return;

    function fillEditForm(patient) {
        if (!editingId) return;
        editingId.value = patient.id;
        if (editNome) editNome.value = patient.nome || "";
        if (editIdade) editIdade.value = patient.idade || "";
        if (editEscola) editEscola.value = patient.escola || "";
        if (editResponsavel) editResponsavel.value = patient.responsavel || "";
        if (editTelefone) editTelefone.value = patient.telefone || "";
        if (editEmail) editEmail.value = patient.email || "";
        if (editObservacoes) editObservacoes.value = patient.observacoes || "";
    }

    async function refresh() {
        try {
            const patients = await apiRequest("GET", "/api/pacientes");
            table.innerHTML = "";

            patients.forEach((p) => {
                const row = document.createElement("tr");

                row.innerHTML = `<td>${p.nome}</td><td>${p.telefone || ""}</td><td>${p.email || ""}</td>`;

                const actionsCell = document.createElement("td");
                actionsCell.classList.add("text-end");

                const editButton = document.createElement("button");
                editButton.type = "button";
                editButton.className = "btn btn-warning btn-sm me-2";
                editButton.textContent = "Atualizar";
                editButton.addEventListener("click", () => {
                    fillEditForm(p);
                });

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.className = "btn btn-danger btn-sm";
                deleteButton.textContent = "Remover";
                deleteButton.addEventListener("click", async () => {
                    try {
                        await deletePatient(p.id);
                        showAlert(alertContainer, "Paciente removido.", "success");
                        await refresh();
                    } catch (error) {
                        showError(alertContainer, error);
                    }
                });

                actionsCell.appendChild(editButton);
                actionsCell.appendChild(deleteButton);
                row.appendChild(actionsCell);

                table.appendChild(row);
            });
        } catch (error) {
            showError(alertContainer, error);
        }
    }

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = editingId?.value;
        if (!id) {
            showAlert(alertContainer, "Selecione um paciente para atualizar.", "warning");
            return;
        }

        const payload = {
            nome: editNome?.value,
            idade: editIdade?.value || null,
            escola: editEscola?.value,
            responsavel: editResponsavel?.value,
            telefone: editTelefone?.value,
            email: editEmail?.value,
            observacoes: editObservacoes?.value,
        };

        try {
            await apiRequest("PATCH", `/api/pacientes/${id}`, payload);
            showAlert(alertContainer, "Paciente atualizado com sucesso.");
            form.reset();
            if (editingId) editingId.value = "";
            await refresh();
        } catch (error) {
            showError(alertContainer, error);
        }
    });

    await refresh();

}

/* ================================================= */
/* AGENDAMENTO */
/* ================================================= */

async function initAgendamentoPage() {
    const select = document.getElementById("patientId");
    const form = document.getElementById("agendamentoForm");
    const table = document.getElementById("appointmentsTable");
    const alertContainer = document.getElementById("agendamentoAlert");

    if (!select || !form || !table) return;

    let patientsCache = [];

    async function loadPatients() {
        patientsCache = await buildPatientSelect(select);
    }

    async function refresh() {
        try {
            const appointments = await apiRequest("GET", "/api/agenda");
            table.innerHTML = "";
            const patientMap = new Map(patientsCache.map((p) => [p.id, p.nome]));

            appointments.forEach((item) => {
                const row = document.createElement("tr");
                const patientName = patientMap.get(item.paciente_id) || item.paciente_id || "";

                row.innerHTML = `
                    <td>${patientName}</td>
                    <td>${formatDate(item.data)}</td>
                    <td>${formatTime(item.horario)}</td>
                    <td>${item.motivo || ""}</td>
                `;

                const actionsCell = document.createElement("td");
                actionsCell.classList.add("text-end");

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.className = "btn btn-outline-danger btn-sm";
                deleteButton.textContent = "Cancelar";
                deleteButton.addEventListener("click", async () => {
                    try {
                        await apiRequest("DELETE", `/api/agenda/${item.id}`);
                        showAlert(alertContainer, "Agendamento cancelado.", "success");
                        await refresh();
                    } catch (error) {
                        showError(alertContainer, error);
                    }
                });

                actionsCell.appendChild(deleteButton);
                row.appendChild(actionsCell);
                table.appendChild(row);
            });
        } catch (error) {
            showError(alertContainer, error);
        }
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            paciente_id: select.value,
            data: document.getElementById("date")?.value,
            horario: document.getElementById("time")?.value,
            motivo: document.getElementById("reason")?.value,
            profissional: document.getElementById("professional")?.value,
            observacoes: document.getElementById("notes")?.value,
        };

        try {
            await apiRequest("POST", "/api/agenda", payload);
            showAlert(alertContainer, "Agendamento salvo com sucesso.");
            form.reset();
            await loadPatients();
            await refresh();
        } catch (error) {
            showError(alertContainer, error);
        }
    });

    await loadPatients();
    await refresh();
}


/* ================================================= */
/* REGISTROS */
/* ================================================= */

async function initRegistrosPage() {
    const table = document.getElementById("recordsTable");
    const form = document.getElementById("registroForm");
    const select = document.getElementById("registroPaciente");
    const alertContainer = document.getElementById("recordsAlert");

    if (!table || !form || !select) return;

    await buildPatientSelect(select);

    async function refresh() {
        try {
            const registros = await apiRequest("GET", "/api/registros");
            table.innerHTML = "";

            registros.forEach((r) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${r.paciente_nome || ""}</td>
                    <td>${formatDate(r.data)}</td>
                    <td>${formatTime(r.hora)}</td>
                    <td>${r.observacoes || ""}</td>
                    <td>${formatDate(r.created_at)}</td>
                `;

                table.appendChild(row);
            });
        } catch (error) {
            showError(alertContainer, error);
        }
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            paciente_id: select.value,
            data: document.getElementById("registroData")?.value,
            hora: document.getElementById("registroHora")?.value,
            observacoes: document.getElementById("registroObs")?.value,
        };

        try {
            await apiRequest("POST", "/api/registros", payload);
            showAlert(alertContainer, "Registro salvo com sucesso.");
            form.reset();
            await refresh();
        } catch (error) {
            showError(alertContainer, error);
        }
    });

    await refresh();

}


/* ================================================= */
/* FINANCEIRO */
/* ================================================= */

async function initFinanceiroPage() {
    const form = document.getElementById("financeForm");
    const select = document.getElementById("financePatientId");
    const table = document.getElementById("financeTable");
    const alertContainer = document.getElementById("financeAlert");

    if (!form || !select || !table) return;

    let patientsCache = [];

    async function loadPatients() {
        patientsCache = await buildPatientSelect(select);
    }

    async function refresh() {
        try {
            const lancamentos = await apiRequest("GET", "/api/financeiro");
            table.innerHTML = "";
            const patientMap = new Map(patientsCache.map((p) => [p.id, p.nome]));

            lancamentos.forEach((item) => {
                const row = document.createElement("tr");
                const patientName = patientMap.get(item.paciente_id) || item.paciente_id || "";

                row.innerHTML = `
                    <td>${patientName}</td>
                    <td>${formatDate(item.data)}</td>
                    <td>${formatCurrency(item.valor)}</td>
                    <td>${item.status || ""}</td>
                `;

                const actionsCell = document.createElement("td");
                actionsCell.classList.add("text-end");

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.className = "btn btn-outline-danger btn-sm";
                deleteButton.textContent = "Excluir";
                deleteButton.addEventListener("click", async () => {
                    try {
                        await apiRequest("DELETE", `/api/financeiro/${item.id}`);
                        showAlert(alertContainer, "Lançamento removido.", "success");
                        await refresh();
                    } catch (error) {
                        showError(alertContainer, error);
                    }
                });

                actionsCell.appendChild(deleteButton);
                row.appendChild(actionsCell);
                table.appendChild(row);
            });
        } catch (error) {
            showError(alertContainer, error);
        }
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const metodoInput = document.getElementById("financeMetodo");
        const observacoesInput = document.getElementById("financeObservacoes");

        const payload = {
            paciente_id: select.value,
            data: document.getElementById("financeDate")?.value,
            valor: document.getElementById("financeValue")?.value,
            status: document.getElementById("financeStatus")?.value,
            metodo_pagamento: metodoInput?.value,
            observacoes: observacoesInput?.value,
        };

        try {
            await apiRequest("POST", "/api/financeiro", payload);
            showAlert(alertContainer, "Movimentação registrada com sucesso.");
            form.reset();
            await loadPatients();
            await refresh();
        } catch (error) {
            showError(alertContainer, error);
        }
    });

    await loadPatients();
    await refresh();
}

/* ================================================= */
/* RELATORIOS */
/* ================================================= */

async function initRelatoriosPage(){

    const select=document.getElementById("reportPatient")

    await buildPatientSelect(select)

}


/* ================================================= */
/* GERAR PDF */
/* ================================================= */

function gerarPDF(){

    const id=document.getElementById("reportPatient").value

    if(!id){

        alert("Selecione paciente")

        return
    }

    window.open("/api/relatorio_pdf/"+id)

}


/* ================================================= */
/* EXPORTAR EXCEL */
/* ================================================= */

function baixarPacientesExcel(){

    window.open("/api/exportar/pacientes")

}

function baixarAgendaExcel(){

    window.open("/api/exportar/agenda")

}

function baixarFinanceiroExcel(){

    window.open("/api/exportar/financeiro")

}


/* ================================================= */
/* INICIALIZAÇÃO */
/* ================================================= */

document.addEventListener("DOMContentLoaded",()=>{

    const page=document.body.dataset.page

    if(page==="cadastro"){

        initCadastroPage()

    }

    if(page==="lista-pacientes"){

        initListaPacientesPage()

    }

    if(page==="agendamento"){

        initAgendamentoPage()

    }

    if(page==="registros"){

        initRegistrosPage()

    }

    if(page==="financeiro"){

        initFinanceiroPage()

    }

    if(page==="relatorios"){

        initRelatoriosPage()

    }

})

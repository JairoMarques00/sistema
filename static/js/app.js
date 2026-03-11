/*
APP.JS COMPLETO
Sistema Psicopedagogia
*/

const API_BASE = "";


/* ---------------- API ---------------- */

async function apiRequest(method, path, body=null){

    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        }
    }

    if(body){
        options.body = JSON.stringify(body)
    }

    const response = await fetch(API_BASE + path)

    if(!response.ok){
        throw new Error("Erro na API")
    }

    return await response.json()

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


/* ---------------- FORMAT ---------------- */

function formatDate(dateISO){

    if(!dateISO) return ""

    return new Date(dateISO).toLocaleDateString("pt-BR")

}

function formatTime(time){

    if(!time) return ""

    return time

}


/* ---------------- SELECT PACIENTES ---------------- */

async function buildPatientSelect(select){

    if(!select) return

    const patients = await apiRequest("GET","/api/pacientes")

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

}


/* ================================================= */
/* CADASTRO PACIENTES */
/* ================================================= */

async function initCadastroPage(){

    const form=document.getElementById("cadastroForm")
    const table=document.getElementById("patientsTable")

    async function refresh(){

        const patients = await apiRequest("GET","/api/pacientes")

        table.innerHTML=""

        patients.forEach(p=>{

            const row=document.createElement("tr")

            row.innerHTML=`

            <td>${p.nome}</td>
            <td>${p.idade || ""}</td>
            <td>${p.telefone || ""}</td>
            <td>${p.email || ""}</td>

            <td>

            <button onclick="deletePatient(${p.id})" class="btn btn-danger btn-sm">
            Excluir
            </button>

            </td>

            `

            table.appendChild(row)

        })

    }


    form.addEventListener("submit",async e=>{

        e.preventDefault()

        const data=new FormData(form)

        const payload={

            nome:data.get("nome"),
            idade:data.get("idade"),
            telefone:data.get("telefone"),
            email:data.get("email")

        }

        await apiRequest("POST","/api/pacientes",payload)

        form.reset()

        refresh()

    })

    refresh()

}


async function deletePatient(id){

    if(!confirm("Remover paciente?")) return

    await apiRequest("DELETE","/api/pacientes/"+id)

    location.reload()

}


/* ================================================= */
/* LISTA PACIENTES */
/* ================================================= */

async function initListaPacientesPage(){

    const table=document.getElementById("patientsListTable")

    const patients = await apiRequest("GET","/api/pacientes")

    table.innerHTML=""

    patients.forEach(p=>{

        const row=document.createElement("tr")

        row.innerHTML=`

        <td>${p.nome}</td>
        <td>${p.telefone || ""}</td>
        <td>${p.email || ""}</td>

        <td>

        <button onclick="editPatient(${p.id})" class="btn btn-warning btn-sm">
        Atualizar
        </button>

        <button onclick="deletePatient(${p.id})" class="btn btn-danger btn-sm">
        Remover
        </button>

        </td>

        `

        table.appendChild(row)

    })

}


function editPatient(id){

    alert("Funcionalidade de edição pode abrir um modal futuramente")

}


/* ================================================= */
/* AGENDAMENTO */
/* ================================================= */

async function initAgendamentoPage(){

    const select=document.getElementById("patientId")

    await buildPatientSelect(select)

}


/* ================================================= */
/* REGISTROS */
/* ================================================= */

async function initRegistrosPage(){

    const table=document.getElementById("recordsTable")
    const form=document.getElementById("registroForm")
    const select=document.getElementById("registroPaciente")

    await buildPatientSelect(select)

    const registros = await apiRequest("GET","/api/registros")

    table.innerHTML=""

    registros.forEach(r=>{

        const row=document.createElement("tr")

        row.innerHTML=`

        <td>${r.paciente_nome || ""}</td>
        <td>${formatDate(r.data)}</td>
        <td>${formatTime(r.hora)}</td>
        <td>${r.observacoes || ""}</td>
        <td>${formatDate(r.created_at)}</td>

        `

        table.appendChild(row)

    })


    form.addEventListener("submit",async e=>{

        e.preventDefault()

        const payload={

            paciente_id:select.value,
            data:document.getElementById("registroData").value,
            hora:document.getElementById("registroHora").value,
            observacoes:document.getElementById("registroObs").value

        }

        await apiRequest("POST","/api/registros",payload)

        alert("Registro salvo")

        location.reload()

    })

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

    if(page==="relatorios"){

        initRelatoriosPage()

    }

})
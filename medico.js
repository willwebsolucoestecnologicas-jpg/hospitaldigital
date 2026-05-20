const API_URL = "https://script.google.com/macros/s/AKfycbwUj6Zo9Wp936IfY_z1MYX74jqkfk1EfsBCdCb9ETGYaeZuLu9C7iDmnpSud_z7FiJd/exec"; 

// Variável global para guardar quem é o médico que está operando o sistema
let medicoLogado = "";

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Carrega a lista de médicos para o painel de login
    try {
        const resMedicos = await fetch(`${API_URL}?tipo=medicos_lista`);
        const listaMedicos = await resMedicos.json();
        
        const select = document.getElementById('selectMedico');
        select.innerHTML = '<option value="">Selecione o seu nome...</option>';
        
        listaMedicos.forEach(med => {
            select.innerHTML += `<option value="${med.nome}">${med.nome} (CRM: ${med.crm})</option>`;
        });
    } catch (erro) {
        document.getElementById('selectMedico').innerHTML = '<option value="">Erro ao carregar médicos</option>';
    }

    // Mantém a lógica que você já tem de carregar a fila de pacientes...
    carregarFilaEspera(); 
});

// 2. Lógica do Botão de "Entrar no Plantão"
document.getElementById('btnEntrarPlantao').addEventListener('click', () => {
    const select = document.getElementById('selectMedico');
    
    if (select.value === "") {
        alert("Por favor, selecione o seu perfil médico para continuar.");
        return;
    }
    
    // Salva o médico na variável e esconde a tela preta
    medicoLogado = select.value;
    document.getElementById('loginMedicoOverlay').style.display = 'none';
});

// (Coloque a função carregarFilaEspera() isolada aqui se preferir deixar o código mais limpo)
async function carregarFilaEspera() {
    const filaContainer = document.querySelector('.fila-lista');
    filaContainer.innerHTML = "<p>Carregando fila...</p>";

    try {
        const resposta = await fetch(`${API_URL}?tipo=medico`);
        const pacientes = await resposta.json();

        filaContainer.innerHTML = ""; 

        if (pacientes.length === 0) {
            filaContainer.innerHTML = "<p>Nenhum paciente aguardando.</p>";
            return;
        }

        pacientes.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card-paciente';
            const corClasse = p.classificacao.toLowerCase();
            
            card.innerHTML = `
                <div class="card-header">
                    <span class="badge-risco ${corClasse}">${p.classificacao}</span>
                </div>
                <h3>${p.nome}</h3>
                <p>${p.idade} anos | PA: ${p.pa}</p>
            `;
            
            card.onclick = () => carregarAtendimento(p);
            filaContainer.appendChild(card);
        });
    } catch (erro) {
        filaContainer.innerHTML = "<p>Erro ao carregar fila.</p>";
    }
}

// Essa função preenche o lado direito quando o médico clica no paciente (Mantém a que você já tinha)
function carregarAtendimento(paciente) {
    document.querySelector('.info-principal h1').textContent = `${paciente.nome}, ${paciente.idade} anos`;
    document.querySelector('.info-principal p').innerHTML = `<strong>Queixa Principal:</strong> ${paciente.queixas}`;
    
    let form = document.getElementById('atendimentoForm');
    let inputAntigo = document.getElementById('idOcultoMedico');
    if(inputAntigo) inputAntigo.remove();
    form.insertAdjacentHTML('beforeend', `<input type="hidden" id="idOcultoMedico" value="${paciente.idAtendimento}">`);
}

// 3. Atualiza o Salvamento para incluir o "nomeMedico"
document.getElementById('atendimentoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.querySelector('.btn-finalizar');
    const idOculto = document.getElementById('idOcultoMedico');

    if (!idOculto) {
        alert("Selecione um paciente na fila lateral primeiro!");
        return;
    }

    btn.textContent = `Salvando atendimento do(a) Dr(a) ${medicoLogado.split(" ")[0]}...`;

    const dadosConsulta = {
        acao: "salvarMedico", 
        idAtendimento: idOculto.value,
        nomeMedico: medicoLogado, // <--- INSERIMOS A VARIÁVEL AQUI
        diagnostico: document.getElementById('diagnostico').value,
        receita: document.getElementById('receita').value
    };

    try {
        const resposta = await fetch(API_URL, { 
            method: 'POST', 
            body: JSON.stringify(dadosConsulta) 
        });
        const res = await resposta.json();
        
        if(res.status === "sucesso") {
            alert(res.mensagem);
            window.location.reload();
        } else {
            alert("Erro no servidor: " + res.mensagem);
            btn.textContent = 'Finalizar Atendimento';
        }
    } catch(erro) {
        alert("Erro ao conectar. Tente novamente.");
        btn.textContent = 'Finalizar Atendimento';
    }
});

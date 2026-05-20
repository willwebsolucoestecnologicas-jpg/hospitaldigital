const API_URL = "https://script.google.com/macros/s/AKfycbwUj6Zo9Wp936IfY_z1MYX74jqkfk1EfsBCdCb9ETGYaeZuLu9C7iDmnpSud_z7FiJd/exec"; 

// Variável global para guardar quem é o médico
let medicoLogado = "";

// Lógica do Botão de "Entrar no Plantão"
document.getElementById('btnEntrarPlantao').addEventListener('click', async () => {
    const crmInput = document.getElementById('crmLogin').value;
    const senhaInput = document.getElementById('senhaLogin').value;
    const btn = document.getElementById('btnEntrarPlantao');
    
    if (!crmInput || !senhaInput) {
        alert("Por favor, preencha o CRM e a Senha para acessar o sistema.");
        return;
    }
    
    btn.textContent = "Autenticando...";
    
    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                acao: "loginMedico",
                crm: crmInput,
                senha: senhaInput
            })
        });
        
        const res = await resposta.json();
        
        if (res.status === "sucesso") {
            alert(res.mensagem);
            medicoLogado = res.nome; // Guarda o nome do médico que veio da planilha
            document.getElementById('loginMedicoOverlay').style.display = 'none';
            
            // Agora sim, com o médico logado, carregamos a fila de pacientes
            carregarFilaEspera(); 
        } else {
            // Se errou a senha ou CRM não existe
            alert(res.mensagem);
            btn.textContent = "Acessar Painel";
        }
    } catch (erro) {
        alert("Erro de conexão com o servidor. Tente novamente.");
        btn.textContent = "Acessar Painel";
    }
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

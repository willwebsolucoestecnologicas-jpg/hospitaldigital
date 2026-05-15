const API_URL = "https://script.google.com/macros/s/AKfycbwUj6Zo9Wp936IfY_z1MYX74jqkfk1EfsBCdCb9ETGYaeZuLu9C7iDmnpSud_z7FiJd/exec";

document.addEventListener("DOMContentLoaded", async () => {
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
});

// Essa função preenche o lado direito quando o médico clica no paciente
function carregarAtendimento(paciente) {
    document.querySelector('.info-principal h1').textContent = `${paciente.nome}, ${paciente.idade} anos`;
    document.querySelector('.info-principal p').innerHTML = `<strong>Queixa Principal:</strong> ${paciente.queixas}`;
    
    // Injeta um input oculto no formulário com o ID do Atendimento para sabermos quem salvar!
    let form = document.getElementById('atendimentoForm');
    
    // Se já tinha um input oculto (de outro paciente clicado antes), removemos
    let inputAntigo = document.getElementById('idOcultoMedico');
    if(inputAntigo) inputAntigo.remove();
    
    // Adiciona o novo ID
    form.insertAdjacentHTML('beforeend', `<input type="hidden" id="idOcultoMedico" value="${paciente.idAtendimento}">`);
}

// O gatilho que envia a conduta médica para o banco de dados
document.getElementById('atendimentoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.querySelector('.btn-finalizar');
    const idOculto = document.getElementById('idOcultoMedico');

    // Trava de segurança: impede o médico de salvar se não tiver clicado em ninguém
    if (!idOculto) {
        alert("Selecione um paciente na fila lateral primeiro!");
        return;
    }

    btn.textContent = 'Salvando no Prontuário...';

    const dadosConsulta = {
        acao: "salvarMedico", // A palavra-chave que aciona o CASO 3 lá no Apps Script
        idAtendimento: idOculto.value,
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
            window.location.reload(); // Recarrega a tela para limpar a fila
        } else {
            alert("Erro no servidor: " + res.mensagem);
            btn.textContent = 'Finalizar Atendimento';
        }
    } catch(erro) {
        alert("Erro ao conectar. Tente novamente.");
        btn.textContent = 'Finalizar Atendimento';
    }
});
const API_URL = "https://script.google.com/macros/s/AKfycbwUj6Zo9Wp936IfY_z1MYX74jqkfk1EfsBCdCb9ETGYaeZuLu9C7iDmnpSud_z7FiJd/exec"; 

document.addEventListener("DOMContentLoaded", async () => {
    const pacienteInfoDiv = document.querySelector('.paciente-info');
    pacienteInfoDiv.innerHTML = "<em>Carregando próximo paciente da fila...</em>";

    try {
        // AGORA BUSCAMOS ESPECIFICAMENTE A TRIAGEM
        const resposta = await fetch(`${API_URL}?tipo=triagem`);
        const fila = await resposta.json();

        if (fila.length > 0) {
            const pacienteAtual = fila[0]; 
            const anoNascimento = new Date(pacienteAtual.nascimento).getFullYear();
            const idade = new Date().getFullYear() - anoNascimento;

            pacienteInfoDiv.innerHTML = `
                <strong>Paciente em atendimento:</strong> ${pacienteAtual.nome} (${idade} anos)<br>
                <small><strong>Cartão SUS:</strong> ${pacienteAtual.cartaoSus} | <strong>Condições:</strong> ${pacienteAtual.condicoes || 'Nenhuma'}</small>
                <input type="hidden" id="idAtendimentoOculto" value="${pacienteAtual.idAtendimento}">
                <input type="hidden" id="cartaoSusOculto" value="${pacienteAtual.cartaoSus}">
            `;
        } else {
            pacienteInfoDiv.innerHTML = "<strong>Fila Vazia:</strong> Nenhum paciente aguardando triagem no momento.";
            document.querySelector('.btn-submit').disabled = true;
        }

    } catch (erro) {
        console.error("Erro ao buscar a fila:", erro);
        pacienteInfoDiv.innerHTML = "<strong style='color:red;'>Erro ao carregar a fila de pacientes.</strong>";
    }
});

document.getElementById('triagemForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.querySelector('.btn-submit');
    btn.textContent = 'Enviando ao Médico...';

    const dadosTriagem = {
        acao: "salvarTriagem",
        idAtendimento: document.getElementById('idAtendimentoOculto').value,
        cartaoSus: document.getElementById('cartaoSusOculto').value,
        pa: document.getElementById('pa').value,
        hgt: document.getElementById('hgt').value,
        temp: document.getElementById('temp').value,
        fc: document.getElementById('fc').value,
        spo2: document.getElementById('spo2').value,
        peso: document.getElementById('peso').value,
        queixas: document.getElementById('queixas').value,
        classificacao: document.querySelector('input[name="classificacao"]:checked').value
    };

    const resposta = await fetch(API_URL, { method: 'POST', body: JSON.stringify(dadosTriagem) });
    const res = await resposta.json();
    
    if(res.status === "sucesso") {
        alert(res.mensagem);
        window.location.reload();
    }
});
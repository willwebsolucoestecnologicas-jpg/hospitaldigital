const API_URL = "https://script.google.com/macros/s/AKfycbwUj6Zo9Wp936IfY_z1MYX74jqkfk1EfsBCdCb9ETGYaeZuLu9C7iDmnpSud_z7FiJd/exec"; // Cole a mesma URL de sempre

document.addEventListener("DOMContentLoaded", async () => {
    // Para testar, pede o Cartão SUS ao abrir o app
    const cartaoSusUsuario = prompt("Simulação de Login: Digite o seu número do Cartão SUS para entrar no Meu SUS Digital:");
    
    if (!cartaoSusUsuario) {
        alert("Acesso cancelado. Recarregue a página e digite um Cartão SUS válido.");
        return;
    }

    const secaoConsulta = document.querySelector('.card-consulta');
    secaoConsulta.innerHTML = "<p>Buscando seu histórico no sistema da prefeitura...</p>";

    try {
        // Envia a requisição passando o Cartão SUS na URL
        const resposta = await fetch(`${API_URL}?tipo=app_paciente&sus=${cartaoSusUsuario}`);
        const json = await resposta.json();

        if (json.status === "sucesso") {
            const hist = json.dados;
            
            // Atualiza a tela com a última consulta
            secaoConsulta.innerHTML = `
                <div class="consulta-data">${hist.data}</div>
                <h4>Atendimento Finalizado</h4>
                <p><strong>Médico:</strong> ${hist.medico}</p>
                <p><strong>Diagnóstico/Evolução:</strong> ${hist.diagnostico}</p>
            `;

            // Atualiza a parte da receita separando por quebras de linha
            const listaMedicamentos = document.querySelector('.lista-medicamentos');
            listaMedicamentos.innerHTML = ""; // Limpa os exemplos estáticos
            
            if (hist.receita && hist.receita.trim() !== "") {
                // Transforma o texto da receita em uma lista
                const remedios = hist.receita.split('\n');
                remedios.forEach(rem => {
                    if (rem.trim() !== "") {
                        listaMedicamentos.innerHTML += `
                            <li>
                                <div class="med-info">
                                    <strong>${rem}</strong>
                                </div>
                            </li>
                        `;
                    }
                });
            } else {
                listaMedicamentos.innerHTML = "<p>Nenhuma medicação prescrita neste atendimento.</p>";
            }

        } else {
            secaoConsulta.innerHTML = `<p>${json.mensagem}</p>`;
            document.querySelector('.card-receita').innerHTML = "<p>Sem receitas ativas.</p>";
        }

    } catch (erro) {
        console.error("Erro no App:", erro);
        secaoConsulta.innerHTML = "<p style='color:red;'>Erro de conexão com a base de dados.</p>";
    }
});
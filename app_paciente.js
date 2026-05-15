const API_URL = "https://script.google.com/macros/s/AKfycbwUj6Zo9Wp936IfY_z1MYX74jqkfk1EfsBCdCb9ETGYaeZuLu9C7iDmnpSud_z7FiJd/exec"; // Cole a mesma URL de sempre

document.addEventListener("DOMContentLoaded", async () => {
    const cartaoSusUsuario = prompt("Bem-vindo ao Meu SUS Digital! Digite seu Cartão SUS:");
    
    if (!cartaoSusUsuario) {
        alert("Acesso cancelado.");
        return;
    }

    document.getElementById('susUsuario').textContent = `Cartão SUS: ${cartaoSusUsuario}`;

    try {
        const resposta = await fetch(`${API_URL}?tipo=app_paciente&sus=${cartaoSusUsuario}`);
        const json = await resposta.json();

        if (json.status === "sucesso") {
            // 1. Atualiza o Cabeçalho
            const primeiroNome = json.paciente.nome.split(" ")[0];
            document.getElementById('nomeUsuario').textContent = `Olá, ${primeiroNome}! 👋`;
            document.getElementById('avatarUsuario').textContent = primeiroNome.charAt(0).toUpperCase();

            // 2. Preenche TELA INÍCIO (Última Consulta)
            const secaoConsulta = document.getElementById('containerConsulta');
            const listaPrescricao = document.getElementById('listaPrescricao');
            
            if (json.historico.length > 0) {
                const ultima = json.historico[0]; // Pega a primeira do array (mais recente)
                secaoConsulta.innerHTML = `
                    <div class="consulta-data">${ultima.data}</div>
                    <h4>Atendimento Clínico</h4>
                    <p><strong>Médico:</strong> ${ultima.medico}</p>
                    <p><strong>Diagnóstico:</strong> ${ultima.diagnostico}</p>
                `;

                // Preenche a receita da tela início
                listaPrescricao.innerHTML = "";
                if (ultima.receita) {
                    ultima.receita.split('\n').forEach(rem => {
                        if(rem.trim() !== "") {
                            listaPrescricao.innerHTML += `<li><div class="med-info"><strong>${rem}</strong></div></li>`;
                        }
                    });
                } else {
                    listaPrescricao.innerHTML = "<p>Sem medicação prescrita.</p>";
                }
            } else {
                secaoConsulta.innerHTML = "<p>Nenhum atendimento registrado ainda.</p>";
                listaPrescricao.innerHTML = "<p>Sem receitas ativas.</p>";
            }

            // 3. Preenche TELA HISTÓRICO
            const telaHistorico = document.querySelector('#tela-historico .app-section');
            let htmlHistorico = `<h3>Histórico Completo</h3>`;
            
            if (json.historico.length > 0) {
                json.historico.forEach(consulta => {
                    htmlHistorico += `
                    <div class="card-consulta" style="margin-bottom: 1rem;">
                        <div class="consulta-data">${consulta.data}</div>
                        <p><strong>Médico:</strong> ${consulta.medico}</p>
                        <p><strong>Evolução:</strong> ${consulta.diagnostico}</p>
                    </div>`;
                });
            } else {
                htmlHistorico += `<p>Você não possui histórico de consultas.</p>`;
            }
            telaHistorico.innerHTML = htmlHistorico;

            // 4. Preenche TELA PERFIL
            const telaPerfil = document.querySelector('#tela-perfil .app-section');
            // Calcula a idade para ficar mais legal no perfil
            const anoNasc = new Date(json.paciente.nascimento).getFullYear();
            const idade = new Date().getFullYear() - anoNasc;

            telaPerfil.innerHTML = `
                <h3>Meu Perfil</h3>
                <div class="card-consulta" style="text-align: center; margin-bottom: 1rem;">
                    <div class="user-avatar" style="margin: 0 auto 1rem; width: 60px; height: 60px; font-size: 2rem;">👤</div>
                    <h4>${json.paciente.nome}</h4>
                    <p>${idade} anos</p>
                </div>
                <div class="card-consulta">
                    <p><strong>Cartão SUS:</strong> ${cartaoSusUsuario}</p>
                    <p><strong>CPF:</strong> ${json.paciente.cpf}</p>
                    <p><strong>Endereço:</strong> ${json.paciente.endereco}</p>
                    <p><strong>Condições de Saúde:</strong> ${json.paciente.condicoes || "Nenhuma registrada"}</p>
                </div>
            `;

        } else {
            alert(json.mensagem);
            document.getElementById('containerConsulta').innerHTML = `<p style="color:red;">${json.mensagem}</p>`;
        }

    } catch (erro) {
        console.error("Erro no App:", erro);
        document.getElementById('containerConsulta').innerHTML = "<p style='color:red;'>Erro ao buscar dados na Secretaria de Saúde.</p>";
    }
});

// Mantém a função de mudar tela
function mudarTela(nomeDaTela, elementoClicado) {
    const telas = document.querySelectorAll('.tela-app');
    telas.forEach(tela => tela.classList.remove('ativa'));
    const botoes = document.querySelectorAll('.nav-item');
    botoes.forEach(btn => btn.classList.remove('ativo'));
    document.getElementById('tela-' + nomeDaTela).classList.add('ativa');
    elementoClicado.classList.add('ativo');
}

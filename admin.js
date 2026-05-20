const API_URL = "https://script.google.com/macros/s/AKfycbwUj6Zo9Wp936IfY_z1MYX74jqkfk1EfsBCdCb9ETGYaeZuLu9C7iDmnpSud_z7FiJd/exec"; // Cole a sua URL aqui

document.getElementById('cadastroMedicoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.querySelector('.btn-submit');
    btn.textContent = 'Registrando...';

    const dadosMedico = {
        acao: "cadastrarMedico",
        crm: document.getElementById('crmMedico').value,
        nome: document.getElementById('nomeMedico').value,
        especialidade: document.getElementById('especialidadeMedico').value
    };

    try {
        const resposta = await fetch(API_URL, { 
            method: 'POST', 
            body: JSON.stringify(dadosMedico) 
        });
        const res = await resposta.json();
        
        if(res.status === "sucesso") {
            alert(res.mensagem);
            document.getElementById('cadastroMedicoForm').reset();
        } else {
            alert("Erro: " + res.mensagem);
        }
    } catch(erro) {
        alert("Erro de conexão.");
    } finally {
        btn.textContent = 'Registrar Médico';
    }
});
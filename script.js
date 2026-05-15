const API_URL = "https://script.google.com/macros/s/AKfycbwUj6Zo9Wp936IfY_z1MYX74jqkfk1EfsBCdCb9ETGYaeZuLu9C7iDmnpSud_z7FiJd/exec"; 

document.getElementById('cadastroForm').addEventListener('submit', async function(e) {
  e.preventDefault(); 
  
  const btn = document.querySelector('.btn-submit');
  btn.textContent = 'Salvando...';
  
  // Coleta os dados dos inputs e ADICIONA A AÇÃO
  const dados = {
    acao: "cadastrar", // ESSA É A CHAVE QUE FALTAVA
    nome: document.getElementById('nome').value,
    dataNascimento: document.getElementById('dataNascimento').value,
    cpf: document.getElementById('cpf').value,
    cartaoSus: document.getElementById('cartaoSus').value,
    contato: document.getElementById('contato').value,
    endereco: document.getElementById('endereco').value,
    condicoes: Array.from(document.querySelectorAll('input[name="condicoes"]:checked')).map(el => el.value).join(', ')
  };

  try {
    const resposta = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(dados)
    });

    const json = await resposta.json();

    if (json.status === "sucesso") {
      alert(json.mensagem);
      document.getElementById('cadastroForm').reset();
    } else {
      alert("Erro no servidor: " + json.mensagem);
    }

  } catch (erro) {
    console.error("Erro completo:", erro);
    alert("Erro de conexão. Verifique o console.");
  } finally {
    btn.textContent = 'Salvar Cadastro';
  }
});
// Função para mostrar o nome na tela
function mostrarNome() {
    const nome = document.getElementById('nomeInput').value;
    const resultado = document.getElementById('resultado');

    if (nome.trim() !== "") {
        resultado.textContent = `Olá, ${nome}!`;
    } else {
        resultado.textContent = "Por favor, digite seu nome.";
    }
}

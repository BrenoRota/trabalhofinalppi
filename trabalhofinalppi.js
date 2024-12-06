const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: 'chave-secreta',
        resave: false,
        saveUninitialized: true,
    })
);

const porta = 4001;
const host = '0.0.0.0';

let usuarioRegistrado = null;
let mensagens = [];

// Função de verificação de autenticação
function verificarAutenticacao(req, resp, next) {
    if (req.session.autenticado) {
        next();  // Usuário autenticado, pode acessar a página
    } else {
        resp.redirect('/login');  // Redireciona para o login caso não autenticado
    }
}

// Função para formatar data e hora
function formatarDataHora() {
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

// Função para renderizar o menu
function menu() {
    return `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Menu</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link" href="/registrar">Cadastro de Usuários</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/chat">Ir para o Chat</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `;
}

// Rota inicial
app.get('/', (req, resp) => {
    resp.redirect('/login'); // Redireciona para o login
});

// Rota de login (primeira tela que o usuário verá)
app.get('/login', (req, resp) => {
    resp.send(`
        <html>
            <head>
                <title>Login</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container w-25 mt-5">
                    <form action='/login' method='POST' class="row g-3 needs-validation">
                        <fieldset class="border p-2">
                            <legend class="mb-3">Login</legend>
                            <div class="col-md-12">
                                <label for="usuario" class="form-label">Nome de Usuário:</label>
                                <input type="text" class="form-control" id="usuario" name="usuario" required>
                            </div>
                            <div class="col-md-12">
                                <label for="senha" class="form-label">Senha</label>
                                <input type="password" class="form-control" id="senha" name="senha" required>
                            </div>
                        </fieldset>
                        <div class="col-md-12">
                            <button class="btn btn-primary" type="submit">Entrar</button>
                        </div>
                    </form>
                </div>
            </body>
        </html>
    `);
});

// Processar o login
app.post('/login', (req, resp) => {
  const { usuario, senha } = req.body;
  // Aceitar qualquer nome de usuário e senha
  req.session.autenticado = true;  // Marcar a sessão como autenticada
  resp.redirect('/menu');  // Redireciona para o menu após login bem-sucedido
});

// Rota do menu (somente se autenticado)
app.get('/menu', verificarAutenticacao, (req, resp) => {
    resp.send(`
        <html>
            <head>
                <title>Menu</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                ${menu()}
                <div class="container mt-5">
                    <h2>Bem-vindo, ${usuarioRegistrado ? usuarioRegistrado.nome : 'usuário'}!</h2>
                    <p>Escolha uma opção:</p>
                    <a href="/registrar" class="btn btn-secondary">Cadastrar Usuário</a>
                    <a href="/chat" class="btn btn-primary">Ir para o Chat</a>
                </div>
            </body>
        </html>
    `);
});

// Rota de registro de usuário
app.get('/registrar', verificarAutenticacao, (req, resp) => {
    resp.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastro de Usuário</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <script>
                function validarFormulario(event) {
                    event.preventDefault();

                    const nome = document.getElementById('nome').value.trim();
                    const dataNascimento = document.getElementById('dataNascimento').value.trim();
                    const nickname = document.getElementById('nickname').value.trim();

                    let erros = [];
                    if (!nome) {
                        erros.push("O campo 'Nome' é obrigatório.");
                    }
                    if (!dataNascimento) {
                        erros.push("O campo 'Data de Nascimento' é obrigatório.");
                    }
                    if (!nickname) {
                        erros.push("O campo 'Nickname' é obrigatório.");
                    }

                    const listaErros = document.getElementById('erros');
                    listaErros.innerHTML = '';
                    if (erros.length > 0) {
                        erros.forEach(erro => {
                            const li = document.createElement('li');
                            li.classList.add('list-group-item', 'list-group-item-danger');
                            li.textContent = erro;
                            listaErros.appendChild(li);
                        });
                    } else {
                        // Se não houver erros, o formulário pode ser enviado
                        document.getElementById('formCadastro').submit();
                    }
                }
            </script>
        </head>
        <body>
            ${menu()}
            <div class="container mt-5">
                <h2>Cadastro de Usuário</h2>
                <form id="formCadastro" action="/registrar" method="POST" onsubmit="validarFormulario(event)">
                    <div class="mb-3">
                        <label for="nome" class="form-label">Nome</label>
                        <input type="text" class="form-control" id="nome" name="nome" required>
                    </div>
                    <div class="mb-3">
                        <label for="dataNascimento" class="form-label">Data de Nascimento</label>
                        <input type="date" class="form-control" id="dataNascimento" name="dataNascimento" required>
                    </div>
                    <div class="mb-3">
                        <label for="nickname" class="form-label">Nickname</label>
                        <input type="text" class="form-control" id="nickname" name="nickname" required>
                    </div>
                    <div id="erros" class="mt-3">
                        <!-- Os erros de validação serão exibidos aqui -->
                    </div>
                    <button type="submit" class="btn btn-primary mt-3">Cadastrar</button>
                </form>
                <div class="mt-4">
                    <a href="/menu" class="btn btn-secondary">Voltar para o Menu</a>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Processar o registro
app.post('/registrar', (req, resp) => {
    const { nome, dataNascimento, nickname } = req.body;

    // Validar dados
    const erros = {};
    if (!nome || nome.trim() === '') {
        erros.nome = 'O campo nome é obrigatório.';
    }
    if (!dataNascimento || dataNascimento.trim() === '') {
        erros.dataNascimento = 'O campo data de nascimento é obrigatório.';
    }
    if (!nickname || nickname.trim() === '') {
        erros.nickname = 'O campo nickname é obrigatório.';
    }

    if (Object.keys(erros).length > 0) {
        resp.send(`
            <ul>
                ${Object.values(erros).map(erro => `<li>${erro}</li>`).join('')}
            </ul>
        `);
    } else {
        usuarioRegistrado = { nome, dataNascimento, nickname };
        resp.redirect('/menu');  // Redireciona para o menu após o cadastro
    }
});

// Rota do chat (somente se autenticado)
app.get('/chat', verificarAutenticacao, (req, resp) => {
    resp.send(`
        <html>
            <head>
                <title>Chat</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                ${menu()}
                <div class="container mt-5">
                    <h1>Bem-vindo ao Chat</h1>
                    <form action="/chat" method="POST">
                        <input type="text" class="form-control" name="mensagem" placeholder="Digite sua mensagem..." required>
                        <button class="btn btn-primary mt-3" type="submit">Enviar</button>
                    </form>
                    <div id="mensagens">
                        ${mensagens.map(msg => `
                            <div class="alert alert-info mt-3">${msg}</div>
                        `).join('')}
                    </div>
                </div>
            </body>
        </html>
    `);
});

// Processar mensagem do chat
app.post('/chat', verificarAutenticacao, (req, resp) => {
    const { mensagem } = req.body;
    mensagens.push(mensagem);
    resp.redirect('/chat');
});

// Iniciar servidor
app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});

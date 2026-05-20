const API = "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token");
}

function decodeToken() {
  const token = getToken();
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

function verificarAuth() {
  if (!getToken()) {
    window.location.href = "index.html";
  }
}

function verificarAdmin() {
  const user = decodeToken();

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  if (!user.isAdmin) {
    alert("Acesso negado!");
    window.location.href = "dashboard.html";
  }
}

// Login
async function login() {
  const email = document.getElementById('email')?.value;
  const senha = document.getElementById('senha')?.value;

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);

    const user = decodeToken();

    if (user?.isAdmin) {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }

  } else {
    alert(data.erro);
  }
}

// Registro
async function register() {
  const nome = document.getElementById('nome')?.value;
  const email = document.getElementById('email')?.value;
  const senha = document.getElementById('senha')?.value;

  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha })
  });

  const data = await res.json();
  alert(data.mensagem || data.erro);
}

// Receitas
async function criarReceita() {
  const nome = document.getElementById('nome').value;
  const descricao = document.getElementById('descricao').value;
  const link = document.getElementById('link').value;
  const selectCategorias = document.getElementById('categoriasSelect');

  const categoriasSelecionadas = Array.from(selectCategorias.selectedOptions).map(opt => opt.value);

  const token = getToken();
  const res = await fetch(`${API}/receitas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      nome,
      descricao,
      link,
      categorias: categoriasSelecionadas
    })
  });

  const data = await res.json();
  alert(data.mensagem || data.erro);
  listarReceitas();
}

if (window.location.pathname.includes("dashboard.html")) {
  carregarCategoriasNoSelect();
}

async function listarReceitas() {
  const res = await fetch(`${API}/receitas`);
  const receitas = await res.json();
  renderReceitas(receitas);
  exibirReceitas(data);
}

function renderReceitas(receitas) {
  const lista = document.getElementById('lista');
  if (!lista) return;

  lista.innerHTML = "";

  receitas.forEach(r => {
    const li = document.createElement('li');

    li.innerHTML = `
      <b>${r.nome}</b><br>
      ${r.descricao}<br>
      <a href="${r.link}" target="_blank">Abrir</a><br><br>
      <button onclick="editarReceita(${r.id})">Editar</button>
      <button onclick="deletarReceita(${r.id})">Deletar</button>
    `;

    lista.appendChild(li);
  });
}

async function editarReceita(id) {
  const token = getToken();

  const nome = prompt("Novo nome:");
  const descricao = prompt("Nova descrição:");
  const link = prompt("Novo link:");

  if (!nome || !descricao || !link) return;

  await fetch(`${API}/receitas/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ nome, descricao, link })
  });

  listarReceitas();
}

async function deletarReceita(id) {
  const token = getToken();

  await fetch(`${API}/receitas/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  listarReceitas();
}

async function carregarCategoriasNoSelect() {
  const res = await fetch(`${API}/receitas/categoria`);
  const categorias = await res.json();
  const select = document.getElementById('categoriasSelect');

  if (select) {
    select.innerHTML = categorias.map(c => `
      <option value="${c.id}">${c.nome}</option>
    `).join('');
  }
}

async function carregarCategoriasFiltro() {
  try {
    const res = await fetch(`${API}/receitas/categoria`);
    const categorias = await res.json();
    const select = document.getElementById('filtroCategoria');

    if (select) {
      select.innerHTML = '<option value="">Todas</option>' +
        categorias.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
    }
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  }
}

async function filtrarPorCategoria() {
  const select = document.getElementById('filtroCategoria');
  const categoriaId = select.value;
  const lista = document.getElementById('lista');

  if (categoriaId === "") {
    return listarReceitas();
  }

  try {
    const res = await fetch(`${API}/receitas/categoria/${categoriaId}`);
    const receitas = await res.json();

    if (!Array.isArray(receitas) || receitas.length === 0) {
      lista.innerHTML = "<li>Nenhuma receita encontrada para esta categoria.</li>";
      return;
    }

    lista.innerHTML = receitas.map(r => `
      <li>
        <strong>${r.nome}</strong> - ${r.descricao}
        <br><small>Link: <a href="${r.link}" target="_blank">${r.link}</a></small>
      </li>
    `).join('');

  } catch (error) {
    console.error("Erro na filtragem:", error);
    alert("Erro ao filtrar receitas.");
  }
}

function limparFiltro() {
  const select = document.getElementById('filtroCategoria');
  if (!select) return;

  select.value = "";
  listarReceitas();
}

function exibirReceitas(receitas) {
  const lista = document.getElementById('lista');
  lista.innerHTML = receitas.map(r => `
    <li>
      <strong>${r.nome}</strong> - ${r.descricao}
      <br><small>Link: <a href="${r.link}" target="_blank">${r.link}</a></small>
    </li>
  `).join('');
}

if (window.location.pathname.includes("dashboard.html")) {
  carregarCategoriasFiltro();
  listarReceitas();
}

// Categorias
async function criarCategoria() {
  const token = getToken();
  const nome = document.getElementById('nomeCategoria')?.value;

  if (!nome) return alert("Digite o nome da categoria");

  const res = await fetch(`${API}/receitas/categoria`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ nome })
  });

  const data = await res.json();
  alert(data.mensagem || data.erro);

  listarCategorias();
}

async function listarCategorias() {
  const res = await fetch(`${API}/receitas/categoria`);
  const categorias = await res.json();

  const lista = document.getElementById('listaCategorias');
  if (!lista) return;

  lista.innerHTML = "";

  categorias.forEach(c => {
    const li = document.createElement('li');

    li.innerHTML = `
      ${c.nome}
      <br>
      <button onclick="deletarCategoria(${c.id})">Deletar</button>
    `;

    lista.appendChild(li);
  });
}

async function deletarCategoria(id) {
  const token = getToken();

  await fetch(`${API}/receitas/categoria/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  listarCategorias();
}

// Admin
async function listarUsuarios() {
  const token = getToken();

  const res = await fetch(`${API}/admin/usuarios`, {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  const lista = document.getElementById('usuarios');
  if (!lista) return;

  lista.innerHTML = "";

  data.forEach(u => {
    const li = document.createElement('li');

    li.innerHTML = `
      <b>${u.nome}</b><br>
      ${u.email}
      ${u.is_admin ? '<span class="badge">ADMIN</span>' : ''}<br>
      <button onclick="deletarUsuario(${u.id})">Deletar</button>
    `;

    lista.appendChild(li);
  });
}

async function deletarUsuario(id) {
  const token = getToken();

  if (!confirm("Deseja deletar este usuário?")) return;

  await fetch(`${API}/admin/usuarios/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  });

  listarUsuarios();
}

async function listarReceitasAdmin() {
  const token = getToken();

  const res = await fetch(`${API}/admin/receitas`, {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  const lista = document.getElementById('receitasAdmin');
  if (!lista) return;

  lista.innerHTML = "";

  data.forEach(r => {
    const li = document.createElement('li');

    li.innerHTML = `
      <b>${r.nome}</b> (${r.autor})<br>
      ${r.descricao}<br>
      <button onclick="editarReceitaAdmin(${r.id})">Editar</button>
      <button onclick="deletarReceitaAdmin(${r.id})">Deletar</button>
    `;

    lista.appendChild(li);
  });
}

async function criarReceitaAdmin() {
  const nomeInput = document.getElementById('adminNome');
  const descricaoInput = document.getElementById('adminDescricao');
  const linkInput = document.getElementById('adminLink');

  if (!nomeInput || !descricaoInput || !linkInput) {
    alert("Erro: campos não encontrados.");
    return;
  }

  const nome = nomeInput.value.trim();
  const descricao = descricaoInput.value.trim();
  const link = linkInput.value.trim();

  if (!nome || !descricao || !link) {
    alert("Preencha todos os campos!");
    return;
  }

  const token = getToken();
  const user = decodeToken();

  const res = await fetch(`${API}/admin/receitas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      nome,
      descricao,
      link,
      aluno_id: user.id
    })
  });

  const data = await res.json();
  alert(data.mensagem || data.erro);

  listarReceitasAdmin();
}

async function editarReceitaAdmin(id) {
  const token = getToken();

  const nome = prompt("Novo nome:");
  const descricao = prompt("Nova descrição:");
  const link = prompt("Novo link:");

  if (!nome) return;

  await fetch(`${API}/admin/receitas/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ nome, descricao, link })
  });

  listarReceitasAdmin();
}

async function deletarReceitaAdmin(id) {
  const token = getToken();

  await fetch(`${API}/admin/receitas/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  });

  listarReceitasAdmin();
}

// Cadastrar aluno admin
async function cadastrarAlunoPorAdmin() {
  const nome = document.getElementById('novoNomeUsuario').value;
  const email = document.getElementById('novoEmailUsuario').value;
  const senha = document.getElementById('novaSenhaUsuario').value;
  const token = getToken();

  const res = await fetch(`${API}/admin/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ nome, email, senha, is_admin: false })
  });

  if (res.ok) {
    alert("Aluno cadastrado!");
    listarUsuarios();
  } else {
    const erro = await res.json();
    alert("Erro: " + erro.erro);
  }
}

// Vincular habilidade
async function vincularHabilidade() {
  const habilidade_id = document.getElementById('listaHabilidadesDisponiveis').value;
  const nivel = document.getElementById('nivelHabilidade').value;
  const token = getToken();

  if (!nivel || nivel < 0 || nivel > 10) {
    alert("Insira um nível válido entre 0 e 10!");
    return;
  }

  const res = await fetch(`${API}/habilidades/vincular`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ habilidade_id, nivel })
  });

  if (res.ok) {
    alert("Habilidade adicionada!");
    listarMinhasHabilidades();
  } else {
    const erro = await res.json();
    alert(erro.erro);
  }
}

// Criar habilidade
async function criarHabilidade() {
  const nome = document.getElementById('nomeHabilidadeAdmin').value;
  const token = getToken();

  if (!nome) return alert("Digite o nome da habilidade!");

  const res = await fetch(`${API}/habilidades`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ nome })
  });

  if (res.ok) {
    alert("Habilidade cadastrada no sistema!");
    document.getElementById('nomeHabilidadeAdmin').value = "";
    listarHabilidadesAdmin();
  }
}

// Listar habilidades
async function listarHabilidadesAdmin() {
  const token = getToken();
  const res = await fetch(`${API}/habilidades/todas`, {
    headers: { "Authorization": "Bearer " + token }
  });

  const habilidades = await res.json();
  const lista = document.getElementById('listaHabilidadesAdmin');

  if (lista) {
    lista.innerHTML = habilidades.map(h => `
      <li>
        ${h.nome} 
        <small>(ID: ${h.id})</small>
      </li>
    `).join('');
  }
}

// Selecionar habilidade
async function carregarHabilidadesParaSelecao() {
  const res = await fetch(`${API}/habilidades/todas`);
  const habilidades = await res.json();
  const select = document.getElementById('listaHabilidadesDisponiveis');

  if (select) {
    select.innerHTML = habilidades.map(h => `
      <option value="${h.id}">${h.nome}</option>
    `).join('');
  }
}

if (window.location.pathname.includes("dashboard.html")) {
  carregarHabilidadesParaSelecao();
  listarMinhasHabilidades();
}

// Relatorio
async function carregarRelatorioPublico() {
  const res = await fetch(`${API}/receitas/relatorio/proporcao`);
  const dados = await res.json();
  const lista = document.getElementById('listaRelatorio');

  if (lista) {
    lista.innerHTML = dados.map(item => `
      <li>
        <strong>${item.categoria}:</strong> ${item.total} receitas
      </li>
    `).join('');
  }
}

// Informações das receitas
async function carregarPortfolio() {
  const container = document.getElementById('listaPortfolio');
  if (!container) return;

  try {
    const res = await fetch(`${API}/receitas/portfolio`);
    const receitas = await res.json();

    container.innerHTML = receitas.map(r => {
      const idReceita = r.id;

      return `
            <div class="card">
                <div style="margin-bottom: 10px;">
                    ${r.categorias
          ? r.categorias.split(', ').map(cat => `<span class="badge">${cat}</span>`).join('')
          : '<span class="badge">Sem Categoria</span>'}
                </div>
                <h3>${r.nome}</h3>
                <p>${r.descricao}</p>
                <p><small> Autor: ${r.autor}</small></p>
                
                <button onclick="toggleVisualizarComentarios(${idReceita})" class="btn-comentario" style="width: 100%; margin-top: 10px;">
                    Ver Comentários dos Alunos
                </button>
                
                <div id="lista-publica-comentarios-${idReceita}" style="display: none; margin-top: 10px; background: #0f172a; padding: 10px; border-radius: 8px; border: 1px solid #1e293b;">
                    <p style="font-size: 0.8em; color: #94a3b8;">Carregando...</p>
                </div>
            </div>
            `;
    }).join('');

  } catch (error) {
    console.error("Erro ao carregar portfólio:", error);
    container.innerHTML = "<p>Erro ao carregar as receitas do portfólio.</p>";
  }
}
// Relatório de habilidades
async function carregarRelatorioHabilidades() {
  const container = document.getElementById('relatorioHabilidades');
  if (!container) return;

  try {
    const res = await fetch(`${API}/habilidades/relatorio/proporcao`);
    const dados = await res.json();

    container.innerHTML = dados.map(item => `
      <div style="margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span><strong>${item.habilidade}</strong></span>
          <span>${item.proporcao}% (${item.quantidade} alunos)</span>
        </div>
        <div style="background: #1e293b; border-radius: 10px; height: 10px; width: 100%;">
          <div style="background: #38bdf8; height: 100%; width: ${item.proporcao}%; border-radius: 10px; transition: width 1s;"></div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error("Erro no relatório de habilidades:", error);
  }
}

if (window.location.pathname.includes("portfolio.html")) {
  carregarPortfolio();
  carregarRelatorioHabilidades();
}

// Comentários
function toggleComentarios(receitaId) {
  const secao = document.getElementById(`secao-comentarios-${receitaId}`);

  if (secao.style.display === "none") {
    secao.style.display = "block";
    buscarComentarios(receitaId);
  } else {
    secao.style.display = "none";
  }
}

async function buscarComentarios(receitaId) {
  const lista = document.getElementById(`lista-comentarios-${receitaId}`);

  try {
    const res = await fetch(`${API}/comentarios/${receitaId}`);
    const comentarios = await res.json();

    if (comentarios.length === 0) {
      lista.innerHTML = "<p style='font-size: 0.8em; color: #94a3b8;'>Nenhum comentário ainda.</p>";
      return;
    }

    lista.innerHTML = comentarios.map(c => `
      <div style="margin-bottom: 8px; border-bottom: 1px solid #1e293b; padding-bottom: 5px;">
        <span style="color: #38bdf8; font-size: 0.8em; font-weight: bold;">${c.autor}</span>
        <p style="margin: 2px 0; font-size: 0.85em; color: #cbd5e1;">${c.texto}</p>
        <small style="color: #475569; font-size: 0.7em;">${new Date(c.data_criacao).toLocaleDateString()}</small>
      </div>
    `).join('');
  } catch (error) {
    lista.innerHTML = "Erro ao carregar.";
  }
}

async function prepararComentario(receitaId) {
  const texto = prompt("Escreva seu comentário sobre esta receita:");

  if (!texto) return;

  const token = localStorage.getItem('token');
  if (!token) {
    alert("Você precisa estar logado para comentar!");
    return;
  }

  try {
    const res = await fetch(`${API}/comentarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ receita_id: receitaId, texto: texto })
    });

    if (res.ok) {
      alert("Comentário postado!");
      buscarComentarios(receitaId);
    } else {
      const err = await res.json();
      alert("Erro: " + err.erro);
    }
  } catch (error) {
    alert("Falha na conexão.");
  }
}

// Adiciona um campo de texto e um botão em cada card de receita no Dashboard
function renderReceitas(receitas) {
  const lista = document.getElementById('lista');
  if (!lista) return;

  lista.innerHTML = "";

  receitas.forEach(r => {
    const li = document.createElement('li');
    li.className = "card-receita-dash";

    li.innerHTML = `
      <b>${r.nome}</b><br>
      ${r.descricao}<br>
      <a href="${r.link}" target="_blank">Abrir</a><br>
      
      <div style="margin-top: 10px; background: #1e293b; padding: 10px; border-radius: 5px;">
        <textarea id="comentario-input-${r.id}" placeholder="Escreva um comentário sobre esta receita..." style="width: 90%; height: 40px; margin-bottom: 5px;"></textarea>
        <br>
        <button onclick="enviarComentario(${r.id})" style="font-size: 10px; padding: 5px;">Postar Comentário</button>
      </div>

      <button onclick="editarReceita(${r.id})">Editar</button>
      <button onclick="deletarReceita(${r.id})">Deletar</button>
      <hr>
    `;
    lista.appendChild(li);
  });
}

async function enviarComentario(receitaId) {
  const texto = document.getElementById(`comentario-input-${receitaId}`).value;
  if (!texto) return alert("Digite algo antes de enviar!");

  const token = localStorage.getItem('token');

  const res = await fetch(`${API}/comentarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ receita_id: receitaId, texto })
  });

  if (res.ok) {
    alert("Comentário adicionado com sucesso!");
    document.getElementById(`comentario-input-${receitaId}`).value = "";
  }
}

// Visualizar comentarios no portfolio
function toggleVisualizarComentarios(receitaId) {
  if (!receitaId) {
    console.error("ID da receita não encontrado.");
    return;
  }

  const secao = document.getElementById(`lista-publica-comentarios-${receitaId}`);

  if (secao.style.display === "none") {
    secao.style.display = "block";
    renderizarComentariosPublicos(receitaId);
  } else {
    secao.style.display = "none";
  }
}

async function renderizarComentariosPublicos(receitaId) {
  const container = document.getElementById(`lista-publica-comentarios-${receitaId}`);

  try {
    const res = await fetch(`${API}/comentarios/${receitaId}`);
    const dados = await res.json();

    const listaComentarios = Array.isArray(dados) ? dados : [];

    if (listaComentarios.length === 0) {
      container.innerHTML = "<p style='font-size: 0.8em; color: #64748b;'>Nenhum comentário dos alunos ainda.</p>";
      return;
    }

    container.innerHTML = listaComentarios.map(c => `
            <div style="border-bottom: 1px solid #1e293b; padding: 5px 0; margin-bottom: 5px;">
                <strong style="color: #38bdf8; font-size: 0.85em;">${c.autor}:</strong> 
                <p style="margin: 2px 0; color: #cbd5e1; font-size: 0.9em;">${c.texto}</p>
                <small style="color: #475569; font-size: 0.7em;">${new Date(c.data_criacao).toLocaleDateString()}</small>
            </div>
        `).join('');

  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    container.innerHTML = "<p style='color: #ef4444; font-size: 0.8em;'>Erro ao carregar comentários.</p>";
  }
}

// Função que faz o fetch dos comentários e desenha na tela
async function renderizarComentariosPublicos(receitaId) {
  const container = document.getElementById(`lista-publica-comentarios-${receitaId}`);

  try {
    const res = await fetch(`${API}/comentarios/${receitaId}`);
    const dados = await res.json();
    const listaComentarios = Array.isArray(dados) ? dados : [];

    if (listaComentarios.length === 0) {
      container.innerHTML = "<p style='font-size: 0.8em; color: #64748b;'>Nenhum comentário ainda.</p>";
      return;
    }

    container.innerHTML = listaComentarios.map(c => `
      <div style="border-bottom: 1px solid #1e293b; padding: 5px 0;">
        <strong style="color: #38bdf8;">${c.autor}:</strong> 
        <span style="color: #cbd5e1;">${c.texto}</span>
      </div>
    `).join('');

  } catch (error) {
    console.error("Erro detalhado:", error);
    container.innerHTML = "<p style='color: #ef4444;'>Erro ao carregar.</p>";
  }
}
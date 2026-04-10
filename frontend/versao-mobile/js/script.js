// Substituir https://backenddeploy.com pela url real quando em produção
const API_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://localhost:8080"
  : "https://backenddeploy.com";

const nomesMeses = ["Jun", "Jul"];
let mesAtual = 0; // 0 = Junho, 1 = Julho
const ano = 2026;
const agoraFixo = new Date(2026, 5, 8, 12, 0, 0); // Simulação de data atual
let diaSelecionado = null;
let streamRecurso = null;
let fotoCapturada = null;
let usandoFrontal = false;

// ===== AUTENTICAÇÃO =====

function isAdmin() {
  const u = getUsuarioLogado();
  return u && u.admin === true;
}

function retroDisponivel() {
  if (isAdmin()) return true;
  const fimSaoJoao = new Date(2026, 6, 6); // 6 de Julho de 2026
  return agoraFixo >= fimSaoJoao;
}

function usuarioLogado() {
  const btn = document.getElementById("btnLogin");
  return btn && btn.dataset.logged === "true";
}

function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem("usuarioLogado"));
}

function definirLogado(estado) {
  const botao = document.getElementById("btnLogin");
  botao.dataset.logged = estado;
  botao.innerText = estado ? "Sair" : "Entrar";
  if (!estado) { localStorage.removeItem("usuarioLogado"); location.reload(); }
  renderizarPaginaRetro();
}

async function registrar() {
  const email    = document.getElementById("cadastroEmail").value;
  const senha    = document.getElementById("cadastroSenha").value;
  const usuario  = document.getElementById("cadastroUsuario").value;
  const senhaConf = document.getElementById("cadastroSenhaConfirm").value;

  if (!email || !senha || !usuario || !senhaConf) { alert("Preencha todos os campos!"); return; }
  if (senha !== senhaConf) { alert("As senhas não conferem!"); return; }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: usuario, email, password: senha, confirmPassword: senhaConf })
    });
    if (res.status === 201) {
      alert("Conta criada com sucesso!");
      mostrarLogin();
    } else {
      const data = await res.json();
      alert("Erro: " + data.message);
    }
  } catch (e) {
    alert("Erro ao conectar com o servidor.");
  }
}

async function fazerLogin() {
  const emailInput = document.getElementById("loginUsuario").value;
  const senhaInput = document.getElementById("loginSenha").value;

  if (!emailInput || !senhaInput) { alert("Preencha todos os campos!"); return; }

  // Simulação admin
  if (emailInput === "admin" && senhaInput === "123") {
    localStorage.setItem("isAdmin", "true");
    window.location.href = "/frontend/versao-mobile/admin/admin.html";
    return;
  }

  // Conta admin (acesso à retrospectiva sempre disponível)
  if (emailInput === "adm" && senhaInput === "123") {
    localStorage.setItem("usuarioLogado", JSON.stringify({ usuario: "adm", email: "adm@pp.com", admin: true }));
    fecharLoginCadastro();
    definirLogado(true);
    renderizarCalendario();
    renderizarPaginaRetro();
    return;
  }

  // Conta de usuário comum
  if (emailInput === "user" && senhaInput === "123") {
    localStorage.setItem("usuarioLogado", JSON.stringify({ usuario: "user", email: "user@pp.com" }));
    fecharLoginCadastro();
    definirLogado(true);
    renderizarCalendario();
    renderizarPaginaRetro();
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailInput, password: senhaInput })
    });
    if (res.ok) {
      const data = await res.json();
      sessionStorage.setItem("token", data.token);
      localStorage.setItem("usuarioLogado", JSON.stringify({ usuario: emailInput, email: emailInput }));
      fecharLoginCadastro();
      definirLogado(true);
      renderizarCalendario();
    } else {
      const data = await res.json();
      alert("Erro: " + data.message);
    }
  } catch (e) {
    alert("Erro ao conectar com o servidor.");
  }
}

function loginComGoogle() {
  // TODO: implementar OAuth Google
}

// ===== NAVEGAÇÃO DE PÁGINAS =====

function mostrarPagina(pagina) {
  document.querySelectorAll(".pagina").forEach(p => p.classList.remove("active"));
  document.getElementById(pagina).classList.add("active");

  document.querySelectorAll(".nav-bottom button").forEach(btn => btn.classList.remove("active"));
  if (pagina === "programacao")  document.getElementById("btnProgramacao").classList.add("active");
  if (pagina === "ponto")        document.getElementById("btnPonto").classList.add("active");
  if (pagina === "retrospectiva") document.getElementById("btnRetrospectiva").classList.add("active");

  document.body.classList.remove("fundo-programacao", "fundo-ponto", "fundo-retro");
  if (pagina === "programacao")  document.body.classList.add("fundo-programacao");
  if (pagina === "ponto")        document.body.classList.add("fundo-ponto");
  if (pagina === "retrospectiva") { document.body.classList.add("fundo-retro"); renderizarPaginaRetro(); }
}

// ===== MODAIS LOGIN =====

function abrirLoginCadastro()  { document.getElementById("janela-login").style.display = "flex"; }
function fecharLoginCadastro() { document.getElementById("janela-login").style.display = "none"; }
function mostrarLogin()   { document.getElementById("loginForm").style.display = "block"; document.getElementById("registerForm").style.display = "none"; }
function mostrarCadastro() { document.getElementById("loginForm").style.display = "none"; document.getElementById("registerForm").style.display = "block"; }

function abrirEsqueciSenha() {
  document.getElementById("janela-esqueci-senha").style.setProperty("display", "flex", "important");
}

function fecharEsqueciSenha() {
  document.getElementById("janela-esqueci-senha").style.setProperty("display", "none", "important");
}

function enviarRecuperacao() {
  const email = document.getElementById("emailRecuperacao").value;
  if (!email) { alert("Digite um email válido!"); return; }
  alert(`Instruções de recuperação enviadas para ${email}`);
  fecharEsqueciSenha();
}

// ===== MODAIS DE AVISO =====

function fecharTodosModais() {
  fecharLoginCadastro();
  fecharJanelaEncerrado();
  fecharJanelaBloqueado();
}

function abrirJanelaEncerrado()  { fecharTodosModais(); document.getElementById("janela-dia-encerrado").style.display = "flex"; }
function fecharJanelaEncerrado() { document.getElementById("janela-dia-encerrado").style.display = "none"; }
function abrirJanelaBloqueado()  { fecharTodosModais(); document.getElementById("janela-dia-Bloqueado").style.display = "flex"; }
function fecharJanelaBloqueado() {
  const janela = document.getElementById("janela-dia-Bloqueado");
  if (janela) janela.style.display = "none";
}

// ===== CALENDÁRIO =====

function dentroDoEvento(mes, dia) {
  if (mes === 0 && dia >= 3) return true;
  if (mes === 1 && dia <= 5) return true;
  return false;
}

function obterStatus(mes, dia) {
  if (!dentroDoEvento(mes, dia)) return "fora";

  const mesReal    = mes === 0 ? 5 : 6;
  const dataEvento = new Date(ano, mesReal, dia);

  const inicio = new Date(dataEvento);
  inicio.setDate(inicio.getDate() + 1);
  inicio.setHours(0, 0, 0, 0);

  const fim = new Date(inicio);
  fim.setHours(23, 59, 59, 999);

  if (agoraFixo < inicio)                          return "bloqueado";
  if (agoraFixo >= inicio && agoraFixo <= fim) return "disponivel";
  return "encerrado";
}

function renderizarCalendario() {
  const containerDias = document.getElementById("dias");
  const labelMes      = document.getElementById("Mes");
  if (!containerDias) return;

  containerDias.innerHTML = "";
  labelMes.innerText = nomesMeses[mesAtual];

  const mesReal    = mesAtual === 0 ? 5 : 6;
  const primeiroDia = new Date(ano, mesReal, 1).getDay();
  const totalDias   = new Date(ano, mesReal + 1, 0).getDate();

  const usuario  = getUsuarioLogado();
  let registros  = [];
  if (usuario) {
    registros = JSON.parse(localStorage.getItem("registros_" + usuario.usuario)) || [];
  }

  for (let i = 0; i < primeiroDia; i++) containerDias.innerHTML += "<div></div>";

  for (let dia = 1; dia <= totalDias; dia++) {
    const flag  = document.createElement("div");
    flag.classList.add("flag");
    flag.innerText = dia;

    const status      = obterStatus(mesAtual, dia);
    const jaRegistrado = registros.some(r => r.dia === dia && r.mes === mesAtual);

    if (jaRegistrado) {
      flag.classList.add("encerrado");
    } else {
      flag.classList.add(status);
    }

    flag.onclick = () => {
      if (jaRegistrado && status === "disponivel") { alert("Você já registrou esse dia!"); return; }
      if (jaRegistrado) return;

      if (status === "disponivel") {
        if (!usuarioLogado()) { abrirLoginCadastro(); return; }
        diaSelecionado = dia;
        abrirJanelaRegistrarDia();
      } else if (status === "encerrado") {
        abrirJanelaEncerrado();
      } else if (status === "bloqueado") {
        abrirJanelaBloqueado();
      }
    };

    containerDias.appendChild(flag);
  }
}

function proximoMes()  { if (mesAtual < nomesMeses.length - 1) { mesAtual++; renderizarCalendario(); } }
function mesAnterior() { if (mesAtual > 0) { mesAtual--; renderizarCalendario(); } }

// ===== MODAL REGISTRAR DIA =====

function abrirJanelaRegistrarDia() {
  fecharTodosModais();
  document.getElementById("fundoTransparente").style.display = "block";
  document.getElementById("janela-registrar-dia").style.display = "flex";

  const usuario  = getUsuarioLogado();
  const areaCam  = document.getElementById("areaCamera");
  if (usuario && areaCam) {
    const registros = JSON.parse(localStorage.getItem("registros_" + usuario.usuario)) || [];
    areaCam.style.display = (registros.length === 0) ? "block" : "none";
  }

  carregarDadosFormulario();
  carregarSugestoesAmigos();

  const mesReal = mesAtual === 0 ? 5 : 6;
  const d = new Date(ano, mesReal, diaSelecionado);
  document.getElementById("tituloRegistro").innerText =
    `Registrar dia ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function fecharJanelaRegistrarDia() {
  document.getElementById("fundoTransparente").style.display = "none";
  document.getElementById("janela-registrar-dia").style.display = "none";
  if (streamRecurso) { streamRecurso.getTracks().forEach(t => t.stop()); streamRecurso = null; }
}

function enviarRegistro() {
  const arroba = document.getElementById("inputAmigos").value.trim();
  if (arroba) salvarSugestaoAmigo(arroba);

  // Coleta notas por show
  const notas = {};
  document.querySelectorAll("#notasShows .item").forEach(item => {
    const nomeEl = item.querySelector(".artista-nome");
    const nota   = parseFloat(item.dataset.nota) || 0;
    if (nomeEl && nota > 0) notas[nomeEl.textContent.trim()] = nota;
  });

  // Coleta bebidas consumidas
  const bebidas = {};
  document.querySelectorAll("#listaBebidas .card-bebida.com-item").forEach(card => {
    const nome = card.querySelector(".nome-bebida")?.textContent.trim();
    const qtd  = parseInt(card.querySelector(".bebidaQtd")?.value) || 0;
    if (nome && qtd > 0) bebidas[nome] = qtd;
  });

  const user  = getUsuarioLogado();
  const chave = "registros_" + user.usuario;
  const regs  = JSON.parse(localStorage.getItem(chave)) || [];
  regs.push({
    dia:    diaSelecionado,
    mes:    mesAtual,
    amigo:  arroba || null,
    notas,
    bebidas
  });
  localStorage.setItem(chave, JSON.stringify(regs));
  alert("Dia registrado!");
  fecharJanelaRegistrarDia();
  renderizarCalendario();
}

// ===== AMIGOS =====

function salvarSugestaoAmigo(arroba) {
  if (!arroba || !arroba.includes("@")) return;
  const usuario = getUsuarioLogado();
  if (!usuario) return;
  const chave  = "amigos_sugeridos_" + usuario.usuario;
  const amigos = JSON.parse(localStorage.getItem(chave)) || [];
  if (!amigos.includes(arroba)) {
    amigos.push(arroba);
    localStorage.setItem(chave, JSON.stringify(amigos));
  }
}

function carregarSugestoesAmigos() {
  const usuario  = getUsuarioLogado();
  const datalist = document.getElementById("sugestoesAmigos");
  if (!usuario || !datalist) return;
  const chave  = "amigos_sugeridos_" + usuario.usuario;
  const amigos = JSON.parse(localStorage.getItem(chave)) || [];
  datalist.innerHTML = "";
  amigos.forEach(amigo => {
    const option  = document.createElement("option");
    option.value  = amigo;
    datalist.appendChild(option);
  });
}

// ===== PROGRAMAÇÃO =====

function getProgramacaoPorDia(dia, mes) {
  const mesTexto    = mes === 0 ? "Jun" : "Jul";
  const diaFormatado = String(dia).padStart(2, "0");
  const entrada     = programacao.find(p => p.dia === `${diaFormatado} ${mesTexto}`);
  return entrada ? entrada.shows : [];
}

const programacao = [
  { dia: "03 Jun", shows: ["19:00 - Wesley Safadão", "20:30 - Falamansa", "22:00 - Alceu Valença"] },
  { dia: "04 Jun", shows: ["18:30 - Elba Ramalho", "20:00 - Xand Avião", "21:30 - Banda Aviões", "23:00 - Marília Mendonça"] },
  { dia: "05 Jun", shows: ["19:00 - Padre Fábio", "21:00 - Luan Santana"] },
  { dia: "06 Jun", shows: ["18:00 - Mastruz", "19:30 - Magníficos", "21:00 - Solange", "22:30 - Chico Pessoa"] },
  { dia: "07 Jun", shows: ["18:30 - Cavaleiros do Forró", "20:00 - Régis", "21:30 - Flávio José"] },
  { dia: "08 Jun", shows: ["19:00 - Calcinha Preta", "20:30 - Garota Safada", "22:00 - Zé Cantor"] },
  { dia: "09 Jun", shows: ["18:00 - Aviões", "19:30 - Limão com Mel", "21:00 - Forró do Muído"] },
  { dia: "10 Jun", shows: ["18:30 - Magníficos", "20:00 - Taty Girl", "21:30 - Dominguinhos"] }
];

let indiceAtual = 0;

function renderizarProgramacao() {
  const grid = document.getElementById("gridProgramacao");
  if (!grid) return;

  grid.innerHTML = "";
  const grupo = programacao.slice(indiceAtual, indiceAtual + 3);
  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

  const hoje = new Date(agoraFixo.getFullYear(), agoraFixo.getMonth(), agoraFixo.getDate());

  grupo.forEach(dia => {
    const partes     = dia.dia.split(" ");
    const diaNumero  = parseInt(partes[0]);
    const mesTexto   = partes[1];
    const mesNumero  = mesTexto === "Jul" ? 6 : 5;
    const dataEvento = new Date(ano, mesNumero, diaNumero);
    const diaSemana  = diasSemana[dataEvento.getDay()];

    let classeStatus = "futuro";
    if (dataEvento.getTime() === hoje.getTime()) classeStatus = "hoje";
    else if (dataEvento < hoje)                  classeStatus = "passado";

    const diaFormatado = String(diaNumero).padStart(2, "0");

    const div = document.createElement("div");
    div.classList.add("card-dia", classeStatus);
    div.innerHTML = `
      <div class="data-dia">
        <span class="semana">${diaSemana}</span>
        <span class="dia">${diaFormatado}</span>
        <span class="mes">${mesTexto.toUpperCase()}</span>
      </div>
      <div class="conteudo-dia">
        ${dia.shows.map(s => {
          const [hora, artista] = s.split(" - ");
          return `<div class="show"><span class="hora">${hora}</span><span class="artista">${artista}</span></div>`;
        }).join("")}
      </div>
    `;
    grid.appendChild(div);
  });
}

function avancarProgramacao() {
  if (indiceAtual + 3 < programacao.length) { indiceAtual += 3; renderizarProgramacao(); }
}

function voltarProgramacao() {
  if (indiceAtual - 3 >= 0) { indiceAtual -= 3; renderizarProgramacao(); }
}

function irParaDiaAtual() {
  const diaHoje = agoraFixo.getDate();
  const mesHoje = agoraFixo.getMonth();
  const index   = programacao.findIndex(d => {
    const partes    = d.dia.split(" ");
    const diaNumero = parseInt(partes[0]);
    const mesNumero = partes[1] === "Jul" ? 6 : 5;
    return diaNumero === diaHoje && mesNumero === mesHoje;
  });
  if (index !== -1) indiceAtual = Math.floor(index / 3) * 3;
}

function atualizarProgramacao() {
  const programacaoDias = Array.from(document.querySelectorAll(".programacao-dia"));
  if (programacaoDias.length === 0) return;
  const hoje = new Date(agoraFixo.getFullYear(), agoraFixo.getMonth(), agoraFixo.getDate());
  programacaoDias.forEach(diaDiv => {
    const diaNum  = parseInt(diaDiv.querySelector(".dia-numero").innerText);
    const mesStr  = diaDiv.querySelector(".mes").innerText;
    const meses   = { Jun: 5, Jul: 6 };
    const dataEvento = new Date(2026, meses[mesStr], diaNum);
    diaDiv.classList.remove("encerrado", "disponivel", "normal");
    if (dataEvento < hoje)                           diaDiv.classList.add("encerrado");
    else if (dataEvento.getTime() === hoje.getTime()) diaDiv.classList.add("disponivel");
    else                                             diaDiv.classList.add("normal");
  });
}

// ===== FORMULÁRIO DE REGISTRO =====

function getEstruturaBebidas() {
  return [
    { nome: "Beats",    sabores: ["Azul", "Vermelha", "Verde", "Beats 1L"] },
    { nome: "Matuta",   sabores: ["Mel e Limão", "Canela", "Cristal", "Coco"] },
    { nome: "Cerveja",  sabores: ["Brahma", "Heineken", "Skol"] },
    { nome: "Outros",   sabores: ["Água", "Refrigerante"] }
  ];
}

function carregarDadosFormulario() {
  const shows    = getProgramacaoPorDia(diaSelecionado, mesAtual);
  const estrutura = getEstruturaBebidas();
  const containerNotas   = document.getElementById("notasShows");
  const containerBebidas = document.getElementById("listaBebidas");
  containerNotas.innerHTML   = "";
  containerBebidas.innerHTML = "";

  if (shows.length === 0) {
    containerNotas.innerHTML = `<p class="sem-shows">Nenhum show cadastrado para este dia.</p>`;
  }

  let notaMaximaDada = false;

  shows.forEach(show => {
    const partes  = show.split(" - ");
    const artista = partes[1] || show;

    const div = document.createElement("div");
    div.classList.add("item");
    div.innerHTML = `
      <div class="show-header">
        <span class="artista-nome">${artista}</span>
      </div>
      <div class="notaShow-container"></div>
    `;
    const cont = div.querySelector(".notaShow-container");

    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement("button");
      btn.type      = "button";
      btn.innerHTML = "★";
      btn.onclick   = (e) => {
        const nota = e.offsetX < btn.offsetWidth / 2 ? i - 0.5 : i;
        const notaFinal = (nota === 5 && notaMaximaDada) ? 4.5 : nota;
        if (nota === 5 && notaMaximaDada) alert("Você só pode dar nota 5 para um show da noite!");

        cont.querySelectorAll("button").forEach((b, j) => {
          b.classList.remove("active", "meia");
          if (j + 1 < notaFinal)                                        b.classList.add("active");
          else if (j + 1 === Math.ceil(notaFinal) && notaFinal % 1 !== 0) b.classList.add("meia");
          else if (j + 1 <= notaFinal)                                  b.classList.add("active");
        });

        div.dataset.nota = notaFinal;
        if (notaFinal === 5) notaMaximaDada = true;
        else notaMaximaDada = Array.from(containerNotas.querySelectorAll(".item")).some(d => parseFloat(d.dataset.nota) === 5);
      };
      cont.appendChild(btn);
    }
    containerNotas.appendChild(div);
  });

  estrutura.forEach(cat => {
    const catDiv = document.createElement("div");
    catDiv.classList.add("categoria-bebida-wrapper");
    catDiv.innerHTML = `
      <div class="header-categoria" onclick="this.parentElement.classList.toggle('aberto')">
        <span class="nome-cat">${cat.nome}</span>
        <span class="seta-indicadora">▼</span>
      </div>
      <div class="lista-sub-bebidas"></div>
    `;
    const subLista = catDiv.querySelector(".lista-sub-bebidas");
    cat.sabores.forEach(sabor => {
      const item = document.createElement("div");
      item.classList.add("card-bebida");
      const idLimpo = `${cat.nome}-${sabor}`.replace(/\s+/g, "-");
      item.innerHTML = `
        <span class="nome-bebida">${sabor}</span>
        <div class="controles-qtd">
          <button type="button" onclick="ajustarQtd('${idLimpo}', -1)">−</button>
          <input type="number" id="qtd-${idLimpo}" value="0" class="bebidaQtd" readonly>
          <button type="button" onclick="ajustarQtd('${idLimpo}', 1)">+</button>
        </div>
      `;
      subLista.appendChild(item);
    });
    containerBebidas.appendChild(catDiv);
  });
}

function ajustarQtd(id, mudanca) {
  const input = document.getElementById(`qtd-${id}`);
  let v = (parseInt(input.value) || 0) + mudanca;
  if (v < 0) v = 0;
  input.value = v;
  const card = input.closest(".card-bebida");
  v > 0 ? card.classList.add("com-item") : card.classList.remove("com-item");
}

// ===== CÂMERA =====

async function ativarCamera() {
  try {
    const s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: usandoFrontal ? "user" : "environment" }
    });
    streamRecurso = s;
    const video = document.getElementById("videoFullscreen");
    if (video) {
      video.srcObject = s;
      usandoFrontal ? video.classList.add("video-frontal") : video.classList.remove("video-frontal");
    }
    document.getElementById("cameraFullscreen").style.display = "block";
    document.getElementById("janela-registrar-dia").style.display = "none";
  } catch (e) {
    alert("Erro ao abrir câmera.");
  }
}

function abrirOuRefazerFoto() {
  fotoCapturada = null;
  const preview = document.getElementById("previewFoto");
  if (preview) preview.style.display = "none";
  ativarCamera();
}

function capturarFoto() {
  const video = document.getElementById("videoFullscreen");
  if (!video) return;
  const canvas = document.createElement("canvas");
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (usandoFrontal) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
  ctx.drawImage(video, 0, 0);

  const flash = document.getElementById("flashCamera");
  if (flash) {
    flash.classList.add("flash-ativo");
    setTimeout(() => flash.classList.remove("flash-ativo"), 250);
  }

  const preview = document.getElementById("previewFoto");
  if (preview) { preview.src = canvas.toDataURL("image/png"); preview.style.display = "block"; }

  fecharCamera();

  const btn = document.getElementById("btnAtivarCamera");
  if (btn) btn.innerText = "Tirar outra foto";
}

function fecharCamera() {
  if (streamRecurso) { streamRecurso.getTracks().forEach(t => t.stop()); streamRecurso = null; }
  const tela = document.getElementById("cameraFullscreen");
  if (tela) tela.style.display = "none";
  document.getElementById("janela-registrar-dia").style.display = "flex";
}

function trocarCamera() {
  usandoFrontal = !usandoFrontal;
  if (streamRecurso) streamRecurso.getTracks().forEach(t => t.stop());
  ativarCamera();
}

// ===== INICIALIZAÇÃO (único DOMContentLoaded) =====

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("usuarioLogado")) definirLogado(true);

  renderizarCalendario();
  atualizarProgramacao();
  irParaDiaAtual();
  renderizarProgramacao();

  // Input galeria (mover foto da galeria para preview)
  const inputGaleria = document.getElementById("inputGaleria");
  if (inputGaleria) {
    inputGaleria.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (ev) {
          const preview = document.getElementById("previewFoto");
          if (preview) { preview.src = ev.target.result; preview.style.display = "block"; }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Fechar qualquer modal ao clicar no fundo escuro (backdrop)
  const backdropMap = [
    { id: "janela-login",          fechar: fecharLoginCadastro    },
    { id: "janela-esqueci-senha",  fechar: fecharEsqueciSenha     },
    { id: "janela-dia-encerrado",  fechar: fecharJanelaEncerrado  },
    { id: "janela-dia-Bloqueado",  fechar: fecharJanelaBloqueado  },
    { id: "fundoTransparente",     fechar: fecharJanelaRegistrarDia },
  ];

  backdropMap.forEach(({ id, fechar }) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", (e) => { if (e.target === el) fechar(); });
  });

  // Botão de login / logout
  const btnL = document.getElementById("btnLogin");
  if (btnL) {
    btnL.onclick = () => {
      if (btnL.dataset.logged === "true") definirLogado(false);
      else abrirLoginCadastro();
    };
  }
});

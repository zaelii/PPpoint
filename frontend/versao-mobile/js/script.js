// ====== CALENDÁRIO ======
const nomesMeses = ["Jun", "Jul"];
let mesAtual = 0;
const ano = 2026;
const agoraFixo = new Date(2026, 5, 9, 12, 0, 0);
let paginaAtual = "ponto";

renderizarCalendario();

function dentroDoEvento(mes, dia) {
  if (mes === 0 && dia >= 3) return true;
  if (mes === 1 && dia <= 5) return true;
  return false;
}

function obterStatus(mes, dia) {
  if (!dentroDoEvento(mes, dia)) return "fora";
  let mesReal = mes === 0 ? 5 : 6;
  let dataEvento = new Date(ano, mesReal, dia);
  let inicio = new Date(dataEvento);
  inicio.setDate(inicio.getDate() + 1);
  inicio.setHours(0,0,0,0);

  let fim = new Date(inicio);
  fim.setHours(23,59,59,999);

  if (agoraFixo < inicio) return "bloqueado";
  if (agoraFixo >= inicio && agoraFixo <= fim) return "disponivel";
  return "encerrado";
}

function renderizarCalendario() {
  const containerDias = document.getElementById("dias");
  const labelMes = document.getElementById("Mes");

  containerDias.innerHTML = "";
  labelMes.innerText = nomesMeses[mesAtual];

  let mesReal = mesAtual === 0 ? 5 : 6;
  let primeiroDia = new Date(ano, mesReal, 1).getDay();
  let totalDias = new Date(ano, mesReal + 1, 0).getDate();

  for (let i = 0; i < primeiroDia; i++) containerDias.innerHTML += "<div></div>";

  for (let dia = 1; dia <= totalDias; dia++) {
    let flag = document.createElement("div");
    flag.classList.add("flag");
    flag.innerText = dia;

    let status = obterStatus(mesAtual, dia);
    flag.classList.add(status);

    flag.onclick = () => {
      if (status === "disponivel") abrirLoginCadastro();
      else if (status === "encerrado") abrirJanelaEncerrado();
      else if (status === "bloqueado") abrirJanelaBloqueado();
    };

    containerDias.appendChild(flag);
  }
}

function proximoMes() {
  if (mesAtual < nomesMeses.length - 1) {
    mesAtual++;
    renderizarCalendario();
  }
}

function mesAnterior() {
  if (mesAtual > 0) {
    mesAtual--;
    renderizarCalendario();
  }
}

function mostrarPagina(alvo) {
  if (alvo === paginaAtual) return;

  document.getElementById(paginaAtual).classList.remove("active");
  document.getElementById(alvo).classList.add("active");

  atualizarMenu(alvo);
  paginaAtual = alvo;
}

function atualizarMenu(ativo) {
  document.querySelectorAll(".menu button").forEach(btn => btn.classList.remove("active"));
  const btnId = "btn" + ativo.charAt(0).toUpperCase() + ativo.slice(1);
  const botao = document.getElementById(btnId);
  if (botao) botao.classList.add("active");
}

function abrirLoginCadastro() {
  document.getElementById("janela-login").style.display = "flex";
}

function fecharLoginCadastro() {
  document.getElementById("janela-login").style.display = "none";
}

function mostrarLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
}

function mostrarCadastro() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "block";
}

function registrar() {
  const email = document.getElementById("cadastroEmail").value;
  const senha = document.getElementById("cadastroSenha").value;
  const usuario = document.getElementById("cadastroUsuario").value;

  if (!email || !senha || !usuario) {
    alert("Preencha todos os campos!");
    return;
  }

  localStorage.setItem("usuario", JSON.stringify({ email, senha, usuario }));

  alert("Conta criada com sucesso!.");

  mostrarLogin();
}
function fazerLogin() {
  const usuarioInput = document.getElementById("loginUsuario").value;
  const senhaInput = document.getElementById("loginSenha").value;
  const dados = JSON.parse(localStorage.getItem("usuario"));

  if (dados && senhaInput === dados.senha &&
      (usuarioInput === dados.email || usuarioInput === dados.usuario)) {
    alert("Login realizado!");
    fecharLoginCadastro();
    definirLogado(true);
  } else {
    alert("Usuário ou senha incorretos!");
  }
}

function definirLogado(estado) {
  const botao = document.getElementById("btnLogin");
  botao.dataset.logged = estado;
  botao.innerText = estado ? "Sair" : "Entrar";
}

function abrirJanelaEncerrado() { document.getElementById("janela-dia-encerrado").style.display = "flex"; }
function fecharJanelaEncerrado() { document.getElementById("janela-dia-encerrado").style.display = "none"; }
function abrirJanelaBloqueado() { document.getElementById("janela-dia-Bloqueado").style.display = "flex"; }
function fecharJanelaBloqueado() { document.getElementById("janela-dia-Bloqueado").style.display = "none"; }
function abrirJanelaRegistrarDia() { document.getElementById("janela-registrar-dia").style.display = "flex"; }
function fecharJanelaRegistrarDia() { document.getElementById("janela-registrar-dia").style.display = "none"; }
function abrirEsqueciSenha() { document.getElementById('janela-esqueci-senha').style.display = 'flex'; }
function fecharEsqueciSenha() { document.getElementById('janela-esqueci-senha').style.display = 'none'; }
function enviarRecuperacao() {
  const email = document.getElementById('emailRecuperacao').value;
  if(email) {
    alert('Link de redefinição enviado para: ' + email);
    fecharEsqueciSenha();
  } else {
    alert('Digite seu email!');
  }
}

//  BOTÃO LOGIN PRINCIPAL 
window.addEventListener("DOMContentLoaded", () => {
  const botao = document.getElementById("btnLogin");
  botao.addEventListener("click", () => {
    const logado = botao.dataset.logged === "true";
    if (logado) definirLogado(false);
    else abrirLoginCadastro();
  });
});

window.addEventListener('DOMContentLoaded', atualizarProgramacao);

window.addEventListener('DOMContentLoaded', () => {
  atualizarProgramacaoBandeiras();
});


function atualizarProgramacao() {
  const container = document.querySelector('.programacao-container');
  const programacaoDias = Array.from(document.querySelectorAll('.programacao-dia'));

  const hoje = new Date(agoraFixo.getFullYear(), agoraFixo.getMonth(), agoraFixo.getDate());

  let diaAtualDiv = null;

  programacaoDias.forEach(diaDiv => {
    const diaNum = parseInt(diaDiv.querySelector('.dia-numero').innerText);
    const mesStr = diaDiv.querySelector('.mes').innerText;
    const meses = { 'Jun': 5, 'Jul': 6 };
    const mesNum = meses[mesStr];

    const dataEvento = new Date(2026, mesNum, diaNum);

    diaDiv.classList.remove('encerrado','disponivel','normal');

    if (dataEvento < hoje) {
      diaDiv.classList.add('encerrado');
      diaDiv.querySelectorAll('.artista').forEach(a => a.style.pointerEvents = 'none');
    } else if (dataEvento.getTime() === hoje.getTime()) {
      diaDiv.classList.add('disponivel');
      diaDiv.querySelectorAll('.artista').forEach(a => a.style.pointerEvents = 'auto');
      diaAtualDiv = diaDiv; 
    } else {
      diaDiv.classList.add('normal');
      diaDiv.querySelectorAll('.artista').forEach(a => a.style.pointerEvents = 'auto');
    }
  });

  if (diaAtualDiv) {
    diaAtualDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

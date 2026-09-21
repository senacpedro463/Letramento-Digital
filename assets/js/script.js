// Aplica o tema antes do render para evitar "flash" de cor
        (function () {
            try {
                var t = localStorage.getItem('tema');
                if (!t && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    t = 'dark';
                }
                document.documentElement.setAttribute('data-theme', t || 'light');
            } catch (e) {
                document.documentElement.setAttribute('data-theme', 'light');
            }
        })();
// ==========================================================
// 0. Modo Claro / Escuro
// ==========================================================
function aplicarTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.innerHTML = tema === 'dark'
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';
    }
    try { localStorage.setItem('tema', tema); } catch (e) { /* ignora */ }
}

function alternarTema() {
    const atual = document.documentElement.getAttribute('data-theme') || 'light';
    aplicarTema(atual === 'dark' ? 'light' : 'dark');
}

function iniciarTema() {
    let tema = 'light';
    try { tema = localStorage.getItem('tema') || tema; } catch (e) { /* ignora */ }
    if (!localStorage.getItem('tema') && window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches) {
        tema = 'dark';
    }
    aplicarTema(tema);
}

// Aplica o tema o mais cedo possível para evitar "flash"
iniciarTema();

// ==========================================================
// 1. Menu Hamburguer
// ==========================================================
function toggleMenu() {
    const nav = document.getElementById('navLinks');
    const btn = document.getElementById('hamburger');
    const aberto = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    btn.innerHTML = aberto
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
}

// ==========================================================
// 2. Carrossel do Hero
// ==========================================================
let slideAtual = 0;
let carrosselTimer = null;

function iniciarCarrossel() {
    const track = document.getElementById('carouselTrack');
    const dots = document.getElementById('carouselDots');
    if (!track) return;

    const total = track.children.length;
    dots.innerHTML = '';
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Ir para o slide ${i + 1}`);
        dot.onclick = () => irParaSlide(i);
        dots.appendChild(dot);
    }

    atualizarCarrossel();
    carrosselTimer = setInterval(() => moverCarrossel(1), 7000);
}

function atualizarCarrossel() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    track.style.transform = `translateX(-${slideAtual * 100}%)`;
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === slideAtual);
    });
}

function moverCarrossel(direcao) {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    const total = track.children.length;
    slideAtual = (slideAtual + direcao + total) % total;
    atualizarCarrossel();
    reiniciarTimer();
}

function irParaSlide(indice) {
    slideAtual = indice;
    atualizarCarrossel();
    reiniciarTimer();
}

function reiniciarTimer() {
    if (carrosselTimer) {
        clearInterval(carrosselTimer);
        carrosselTimer = setInterval(() => moverCarrossel(1), 7000);
    }
}

// ==========================================================
// 3. Alternar Abas (Tabs)
// ==========================================================
function switchTab(tabId, botao) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');

    if (botao) {
        botao.classList.add('active');
    } else {
        const index = tabId === 'verificador-link' ? 0 : 1;
        const botoes = document.querySelectorAll('.tab-btn');
        if (botoes[index]) botoes[index].classList.add('active');
    }
}

function preencherExemplo(tipo, valor) {
    if (tipo === 'link') {
        document.getElementById('linkInput').value = valor;
        analisarLink();
    } else {
        document.getElementById('textoInput').value = valor;
        analisarTexto();
    }
}

// ==========================================================
// 4. Analisador de Links (URL) - completo
// ==========================================================
function analisarLink() {
    const input = document.getElementById('linkInput').value.trim();
    const result = document.getElementById('linkResult');

    if (!input) {
        exibirResultado(result, 'Por favor, insira um link válido para analisar.', 'warning');
        return;
    }

    const link = input.toLowerCase();
    let pontuacao = 0;
    const alertas = [];
    const bons = [];

    if (!link.startsWith('https://')) {
        pontuacao += 25;
        alertas.push('Não usa conexão segura (HTTPS). Dados podem ser interceptados.');
    } else {
        bons.push('Usa conexão segura HTTPS.');
    }

    const dominiosRisco = ['.tk', '.xyz', '.top', '.club', '.gq', '.cf', '.ml', '.work', '.click'];
    dominiosRisco.forEach(ext => {
        if (link.includes(ext)) {
            pontuacao += 20;
            alertas.push(`Domínio de alto risco: "${ext}" — muito usado em golpes.`);
        }
    });

    const termosRisco = {
        'free': 'promete algo gratuito (isca comum).',
        'gratis': 'promete algo grátis (isca comum).',
        'grátis': 'promete algo grátis (isca comum).',
        'premio': 'menciona "prêmio" — recompensa falsa.',
        'prêmio': 'menciona "prêmio" — recompensa falsa.',
        'ganhar': 'promete ganhos fáceis.',
        'ganhe': 'promete ganhos fáceis.',
        'bonus': 'oferece bônus suspeito.',
        'bônus': 'oferece bônus suspeito.',
        'pix': 'menciona PIX — alvo frequente de fraudes.',
        'login': 'contém "login" — verifique se é o site oficial.',
        'senha': 'solicita senha — nunca confie.',
        'atualizar': 'pede atualização cadastral (golpe clássico).',
        'verificar': 'pede verificação de conta (phishing).',
        'bloquead': 'alerta de bloqueio (pressão psicológica).',
        'promocao': 'promoção suspeita.',
        'promoção': 'promoção suspeita.',
        'sorteio': 'sorteio falso é golpe comum.',
        'clique': 'chama para "clicar" — verifique o destino.',
        'urgente': 'usa urgência para te apressar.'
    };

    Object.keys(termosRisco).forEach(termo => {
        if (link.includes(termo)) {
            pontuacao += 12;
            alertas.push(`Contém o termo suspeito "${termo}": ${termosRisco[termo]}`);
        }
    });

    const encurtadores = ['bit.ly', 'tinyurl', 'goo.gl', 't.co', 'is.gd', 'cutt.ly', 'encurta', 'shorturl'];
    if (encurtadores.some(e => link.includes(e))) {
        pontuacao += 15;
        alertas.push('Usa encurtador de link — o destino real fica escondido.');
    }

    if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(link)) {
        pontuacao += 30;
        alertas.push('Usa um endereço IP direto em vez de um nome de site — muito suspeito.');
    }

    const hifens = (link.split('-').length - 1);
    if (hifens >= 2) {
        pontuacao += 10;
        alertas.push(`Muitos hífens no endereço (${hifens}) — típico de sites que imitam empresas.`);
    }

    const semProtocolo = link.replace(/^https?:\/\//, '').split('/')[0];
    if ((semProtocolo.match(/\./g) || []).length >= 3) {
        pontuacao += 15;
        alertas.push('Muitos subdomínios — tentativa de confundir com domínio oficial.');
    }

    let nivel, tipo, emoji;
    if (pontuacao >= 60) {
        nivel = 'EXTREMO GOLPE'; tipo = 'extremo'; emoji = '🚨';
    } else if (pontuacao >= 35) {
        nivel = 'ALTO RISCO'; tipo = 'danger'; emoji = '⚠️';
    } else if (pontuacao >= 15) {
        nivel = 'RISCO MODERADO'; tipo = 'warning'; emoji = '🔶';
    } else {
        nivel = 'BAIXO RISCO'; tipo = 'success'; emoji = '✓';
    }

    let msg = `<strong>${emoji} Análise do Link — ${nivel} (risco: ${pontuacao})</strong><br><em>${input}</em><br><br>`;
    if (alertas.length > 0) msg += `<strong>Pontos de atenção:</strong><br>• ${alertas.join('<br>• ')}<br>`;
    if (bons.length > 0) msg += `<br><strong>Pontos positivos:</strong><br>• ${bons.join('<br>• ')}<br>`;

    msg += `<br><strong>Recomendação:</strong> `;
    if (tipo === 'extremo') msg += 'NÃO ACESSE DE FORMA ALGUMA! Este link tem todos os sinais de um golpe. Bloqueie o remetente e apague a mensagem.';
    else if (tipo === 'danger') msg += 'Não acesse, não informe dados e não faça login. Apague a mensagem.';
    else if (tipo === 'warning') msg += 'Evite clicar. Se precisar, digite o endereço oficial manualmente no navegador.';
    else msg += 'A estrutura parece segura, mas confirme sempre se o domínio pertence à empresa oficial.';

    exibirResultado(result, msg, tipo);
}

// ==========================================================
// 5. Analisador de Texto - completo
// ==========================================================
const categoriasTexto = {
    urgencia: { titulo: 'Pressão de urgência', peso: 15, termos: ['urgente', 'agora', 'imediatamente', 'vence hoje', 'últimas horas', 'corra', 'rápido', 'prazo final', 'expira', 'bloqueada', 'bloqueado', 'suspensa', 'suspenso', 'cancelada', 'cancelado'] },
    recompensa: { titulo: 'Recompensa / prêmio fácil', peso: 18, termos: ['parabéns', 'premiado', 'contemplado', 'ganhou', 'ganhe', 'prêmio', 'premio', 'sorteio', 'bônus', 'bonus', 'dinheiro fácil', 'grátis', 'gratis', 'desconto exclusivo'] },
    dados: { titulo: 'Pedido de dados sensíveis', peso: 25, termos: ['senha', 'código', 'codigo', 'token', 'cpf', 'cartão', 'cartao', 'dados bancários', 'dados bancarios', 'confirme seus dados', 'atualize seus dados', 'código de verificação'] },
    acao: { titulo: 'Chamada para clicar / transferir', peso: 20, termos: ['clique aqui', 'clique no link', 'acesse o link', 'toque aqui', 'faça o pix', 'fazer o pix', 'transfira', 'transferência', 'deposite', 'pague agora', 'envie o valor'] },
    emocional: { titulo: 'Apelo emocional / ameaça', peso: 15, termos: ['conta será', 'será bloqueada', 'evitar bloqueio', 'multa', 'processo', 'preso', 'arresto', 'perder tudo', 'prejuízo'] }
};

function analisarTexto() {
    const texto = document.getElementById('textoInput').value.trim().toLowerCase();
    const result = document.getElementById('textoResult');

    if (!texto) {
        exibirResultado(result, 'Por favor, insira o texto da mensagem.', 'warning');
        return;
    }

    let pontuacao = 0;
    let blocos = [];

    Object.keys(categoriasTexto).forEach(chave => {
        const cat = categoriasTexto[chave];
        const encontrados = cat.termos.filter(t => texto.includes(t));
        if (encontrados.length > 0) {
            pontuacao += cat.peso;
            blocos.push(`<strong>${cat.titulo}</strong>: "${encontrados.join('", "')}"`);
        }
    });

    const extras = [];
    if (/https?:\/\/|bit\.ly|\.tk|\.xyz|www\./.test(texto)) {
        pontuacao += 15;
        extras.push('Contém link — não clique antes de verificar o destino (use o Analisador de Link).');
    }

    let nivel, tipo;
    if (pontuacao >= 45) { nivel = 'PROVÁVEL GOLPE'; tipo = 'danger'; }
    else if (pontuacao >= 20) { nivel = 'SUSPEITO'; tipo = 'warning'; }
    else { nivel = 'SEM SINAIS CLAROS'; tipo = 'success'; }

    let msg = `<strong>🔎 Análise da Mensagem — ${nivel} (risco: ${pontuacao})</strong><br><br>`;
    if (blocos.length > 0) msg += `<strong>Padrões de manipulação encontrados:</strong><br>• ${blocos.join('<br>• ')}<br>`;
    else msg += 'Nenhum gatilho clássico de golpe foi identificado.<br>';
    if (extras.length > 0) msg += `<br>• ${extras.join('<br>• ')}<br>`;

    msg += `<br><strong>Recomendação:</strong> `;
    if (tipo === 'danger') msg += 'Não clique em links, não informe códigos ou senhas e confirme por um canal oficial do remetente.';
    else if (tipo === 'warning') msg += 'Verifique o remetente e confirme a informação por um canal oficial antes de agir.';
    else msg += 'Mesmo sem sinais óbvios, desconfie de pedidos de dinheiro, códigos ou dados pessoais.';

    exibirResultado(result, msg, tipo);
}

function exibirResultado(elemento, mensagem, tipo) {
    elemento.classList.remove('hidden');
    elemento.innerHTML = mensagem;

    if (tipo === 'extremo') {
        elemento.style.backgroundColor = '#450a0a';
        elemento.style.color = '#fecaca';
        elemento.style.border = '2px solid #ef4444';
    } else if (tipo === 'danger') {
        elemento.style.backgroundColor = '#fee2e2';
        elemento.style.color = '#991b1b';
        elemento.style.border = '1px solid #f87171';
    } else if (tipo === 'success') {
        elemento.style.backgroundColor = '#dcfce7';
        elemento.style.color = '#166534';
        elemento.style.border = '1px solid #4ade80';
    } else {
        elemento.style.backgroundColor = '#fef3c7';
        elemento.style.color = '#92400e';
        elemento.style.border = '1px solid #fcd34d';
    }
}

// ==========================================================
// 6. Quiz Interativo
// ==========================================================
const quizData = [
    {
        pergunta: "Você recebe uma mensagem no WhatsApp do seu banco dizendo que sua conta será bloqueada hoje se você não atualizar seus dados. O que fazer?",
        opcoes: [
            "Clicar no link imediatamente e atualizar os dados.",
            "Ignorar a mensagem e entrar em contato com o banco pelo aplicativo oficial ou telefone do cartão.",
            "Enviar seus dados pessoais para o número para tentar resolver logo."
        ],
        correta: 1,
        explicacao: "Bancos não enviam links por SMS ou WhatsApp solicitando atualização urgente de senhas ou dados bancários."
    },
    {
        pergunta: "Um amigo envia um link com a mensagem: 'Ganhe R$ 200 de bônus no PIX respondendo a essa pesquisa rápida'. É seguro?",
        opcoes: [
            "Sim, se veio de um amigo de confiança.",
            "Não, golpistas usam contas clonadas de amigos para espalhar links maliciosos de roubo de dados.",
            "Sim, desde que você use o PIX de um parente."
        ],
        correta: 1,
        explicacao: "Golpes de 'PIX premiado' usando contas de amigos hackeados são extremamente comuns."
    },
    {
        pergunta: "Qual destes sinais indica que uma notícia pode ser FALSA?",
        opcoes: [
            "Título sensacionalista com muitos pontos de exclamação e sem fonte.",
            "Reportagem com nome do autor e links para fontes oficiais.",
            "Publicação com data e local da ocorrência bem definidos."
        ],
        correta: 0,
        explicacao: "Títulos exagerados, sem autoria e sem fontes verificáveis são fortes indícios de desinformação."
    },
    {
        pergunta: "Você vai usar o Wi-Fi gratuito de um shopping. Qual atitude é mais segura?",
        opcoes: [
            "Acessar o banco pelo aplicativo normalmente.",
            "Evitar operações sensíveis (bancos, compras) e usar seus dados móveis para isso.",
            "Digitar sua senha com cuidado extra."
        ],
        correta: 1,
        explicacao: "Redes públicas podem ser monitoradas. O ideal é não realizar operações sensíveis nelas."
    },
    {
        pergunta: "Um site de compras oferece um produto muito abaixo do preço e pede pagamento por PIX para 'garantir a promoção'. O que fazer?",
        opcoes: [
            "Aproveitar rápido, pois promoções acabam.",
            "Pesquisar a reputação da loja e desconfiar de preços irreais antes de qualquer pagamento.",
            "Pagar metade agora e o resto na entrega."
        ],
        correta: 1,
        explicacao: "Preços muito abaixo do mercado e pedidos de PIX direto são táticas clássicas de fraude em compras."
    },
    {
        pergunta: "Qual é a melhor forma de proteger suas contas online?",
        opcoes: [
            "Usar a mesma senha simples em todos os sites para não esquecer.",
            "Usar senhas únicas e fortes junto com a verificação em duas etapas.",
            "Anotar as senhas em um papel deixado perto do computador."
        ],
        correta: 1,
        explicacao: "Senhas únicas e a verificação em 2 etapas dificultam muito o acesso de criminosos às suas contas."
    }
];

let perguntaAtual = 0;
let acertos = 0;

function carregarPergunta() {
    const q = quizData[perguntaAtual];
    document.getElementById('question-title').innerText = `${perguntaAtual + 1}. ${q.pergunta}`;

    const container = document.getElementById('options-container');
    container.innerHTML = '';

    q.opcoes.forEach((opcao, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt';
        btn.innerText = opcao;
        btn.onclick = () => verificarResposta(index, btn);
        container.appendChild(btn);
    });

    document.getElementById('quiz-feedback').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    atualizarProgresso();
}

function atualizarProgresso() {
    const total = quizData.length;
    const barra = document.getElementById('quizProgressBar');
    const contador = document.getElementById('quizCounter');
    if (barra) barra.style.width = ((perguntaAtual / total) * 100) + '%';
    if (contador) contador.innerText = `Pergunta ${perguntaAtual + 1} de ${total}`;
}

function verificarResposta(selecionada, botao) {
    const q = quizData[perguntaAtual];
    const feedback = document.getElementById('quiz-feedback');
    feedback.classList.remove('hidden');

    document.querySelectorAll('.quiz-opt').forEach((b, i) => {
        b.disabled = true;
        if (i === q.correta) b.classList.add('correta');
    });

    if (selecionada === q.correta) {
        acertos++;
        feedback.style.backgroundColor = '#dcfce7';
        feedback.style.color = '#166534';
        feedback.innerHTML = `✓ Resposta Correta! ${q.explicacao}`;
    } else {
        if (botao) botao.classList.add('errada');
        feedback.style.backgroundColor = '#fee2e2';
        feedback.style.color = '#991b1b';
        feedback.innerHTML = `❌ Resposta Incorreta. ${q.explicacao}`;
    }

    document.getElementById('next-btn').classList.remove('hidden');
    const barra = document.getElementById('quizProgressBar');
    if (barra) barra.style.width = (((perguntaAtual + 1) / quizData.length) * 100) + '%';
}

function proximaPergunta() {
    perguntaAtual++;
    if (perguntaAtual < quizData.length) {
        carregarPergunta();
    } else {
        const total = quizData.length;
        const pct = Math.round((acertos / total) * 100);
        let msg;
        if (pct === 100) msg = '🏆 Excelente! Você é um especialista em segurança digital!';
        else if (pct >= 60) msg = '👏 Muito bom! Você reconhece a maioria dos golpes.';
        else msg = '📚 Atenção! Revise as dicas de prevenção para se proteger melhor.';

        document.getElementById('quiz-container').innerHTML =
            `<div class="quiz-resultado">
                <h3>🎉 Quiz concluído!</h3>
                <p class="quiz-score">Você acertou <strong>${acertos}</strong> de <strong>${total}</strong> (${pct}%)</p>
                <p>${msg}</p>
                <button class="btn btn-primary" onclick="reiniciarQuiz()"><i class="fa-solid fa-rotate-right"></i> Refazer o Quiz</button>
            </div>`;
        document.getElementById('quizProgressBar').style.width = '100%';
        document.getElementById('quizCounter').innerText = `Concluído — ${acertos}/${total} acertos`;
    }
}

function reiniciarQuiz() {
    perguntaAtual = 0;
    acertos = 0;
    document.getElementById('quiz-container').innerHTML =
        `<div class="quiz-question" id="question-title"></div>
         <div class="quiz-options" id="options-container"></div>
         <div id="quiz-feedback" class="quiz-feedback hidden"></div>
         <button id="next-btn" class="btn btn-primary hidden" onclick="proximaPergunta()">Próxima Pergunta <i class="fa-solid fa-arrow-right"></i></button>`;
    carregarPergunta();
}

// ==========================================================
// 7. Envio do Formulário de Denúncia
// ==========================================================
function enviarDenuncia(e) {
    e.preventDefault();
    document.getElementById('formAlert').classList.remove('hidden');
    document.getElementById('denunciaForm').reset();

    setTimeout(() => {
        document.getElementById('formAlert').classList.add('hidden');
    }, 4000);
}

// ==========================================================
// 8. Pesquisa do Site (topo) com filtros
// ==========================================================
// Cada item é um tópico pesquisável. "secao" é o rótulo que aparece no resultado.
const indicePesquisa = [
    // --- Seções gerais ---
    { titulo: 'Início', secao: 'Topo do site', categoria: 'sobre', alvo: '#inicio', termos: ['inicio', 'início', 'home', 'carrossel', 'principal', 'topo', 'comeco', 'começo'] },
    { titulo: 'Sobre o Projeto', secao: 'Sobre', categoria: 'sobre', alvo: '#problema', termos: ['sobre', 'projeto', 'problema', 'objetivo', 'propósito', 'proposito', 'fake news', 'desinformação', 'desinformacao', 'danos', 'prevenir'] },

    // --- Ferramentas ---
    { titulo: 'Analisar Link (URL)', secao: 'Ferramentas', categoria: 'ferramentas', alvo: '#ferramentas', tab: 'verificador-link', termos: ['link', 'url', 'analisar link', 'verificar link', 'site', 'phishing', 'domínio', 'dominio', 'endereço', 'endereco', 'suspenso'] },
    { titulo: 'Analisar Mensagem / Texto', secao: 'Ferramentas', categoria: 'ferramentas', alvo: '#ferramentas', tab: 'analisador-texto', termos: ['texto', 'mensagem', 'whatsapp', 'sms', 'email', 'e-mail', 'zap', 'conversa', 'golpe'] },

    // --- Quiz ---
    { titulo: 'Quiz de Segurança', secao: 'Quiz', categoria: 'quiz', alvo: '#quiz', termos: ['quiz', 'teste', 'pergunta', 'jogo', 'conhecimento', 'desafio', 'pontuação', 'pontuacao', 'acerto'] },

    // --- Dicas ---
    { titulo: 'Senhas fortes e únicas', secao: 'Dicas', categoria: 'dicas', alvo: '#dicas', termos: ['senha', 'senhas', 'password', 'login', 'conta', 'proteger conta'] },
    { titulo: 'Verificação em 2 etapas', secao: 'Dicas', categoria: 'dicas', alvo: '#dicas', termos: ['2 etapas', 'duas etapas', 'verificação', 'verificacao', 'autenticação', 'autenticacao', 'segurança', 'seguranca', 'seguro'] },
    { titulo: 'Cuidado com Wi-Fi público', secao: 'Dicas', categoria: 'dicas', alvo: '#dicas', termos: ['wifi', 'wi-fi', 'rede', 'internet', 'público', 'publico', 'shopping'] },
    { titulo: 'Desconfie de links encurtados', secao: 'Dicas', categoria: 'dicas', alvo: '#dicas', termos: ['encurtado', 'encurtador', 'bit.ly', 'shortlink', 'link suspeito'] },
    { titulo: 'Cheque a fonte das notícias', secao: 'Dicas', categoria: 'dicas', alvo: '#dicas', termos: ['fonte', 'notícia', 'noticia', 'notícias', 'verdade', 'verificar notícia', 'checar'] },
    { titulo: 'Na dúvida, não clique', secao: 'Dicas', categoria: 'dicas', alvo: '#dicas', termos: ['dúvida', 'duvida', 'cuidado', 'atenção', 'atencao', 'clique'] },

    // --- Denúncias ---
    { titulo: 'Como denunciar um golpe', secao: 'Denúncias', categoria: 'denuncia', alvo: '#denuncia', termos: ['denuncia', 'denúncia', 'denunciar', 'reportar', 'reclamar', 'queixa', 'central', 'registrar'] },
    { titulo: 'Denunciar Phishing / Link Malicioso', secao: 'Denúncias', categoria: 'denuncia', alvo: '#denuncia', termos: ['phishing', 'link malicioso', 'link falso', 'malware', 'vírus', 'virus', 'link suspeito'] },
    { titulo: 'Denunciar Notícia Falsa (Fake News)', secao: 'Denúncias', categoria: 'denuncia', alvo: '#denuncia', termos: ['notícia falsa', 'noticia falsa', 'fake news', 'fakenews', 'boato', 'desinformação', 'desinformacao'] },
    { titulo: 'Denunciar Perfil Falso / Clone', secao: 'Denúncias', categoria: 'denuncia', alvo: '#denuncia', termos: ['perfil falso', 'perfil clonado', 'clone', 'conta falsa', 'rede social', 'instagram', 'facebook'] },
    { titulo: 'Denunciar Fraude via PIX / Cobrança Indevida', secao: 'Denúncias', categoria: 'denuncia', alvo: '#denuncia', termos: ['pix', 'fraude', 'cobrança', 'cobranca', 'golpe pix', 'dinheiro', 'transferência', 'transferencia', 'cartão', 'cartao', 'banco'] }
];

// Rótulos amigáveis para os filtros
const rotulosFiltro = {
    todos: 'Tudo',
    ferramentas: 'Ferramentas',
    quiz: 'Quiz',
    dicas: 'Dicas',
    denuncia: 'Denúncias',
    sobre: 'Sobre'
};

function pesquisarSite(event) {
    if (event) event.preventDefault();
    const termo = document.getElementById('siteSearch').value.trim().toLowerCase();
    const filtro = document.getElementById('siteSearchFilter').value;
    const resultado = document.getElementById('siteSearchResult');

    if (!termo) {
        resultado.className = 'site-search-result';
        resultado.innerHTML = '';
        return false;
    }

    // Correspondência: o termo digitado casa com um termo do índice
    // em qualquer direção (igual, contido, ou contendo).
    function corresponde(item) {
        const titulo = item.titulo.toLowerCase();
        const alvos = [...item.termos, titulo, item.categoria, item.secao.toLowerCase()];
        return alvos.some(t => {
            t = t.toLowerCase();
            return t === termo || t.includes(termo) || termo.includes(t);
        });
    }

    let encontrados = indicePesquisa.filter(corresponde);

    // Aplica o filtro de categoria, se não for "todos"
    if (filtro !== 'todos') {
        encontrados = encontrados.filter(item => item.categoria === filtro);
    }

    if (encontrados.length === 0) {
        resultado.className = 'site-search-result show warning';
        resultado.innerHTML = `Nenhum resultado para "<strong>${termo}</strong>"${filtro !== 'todos' ? ` em <strong>${rotulosFiltro[filtro] || filtro}</strong>` : ''}.`;
        return false;
    }

    resultado.className = 'site-search-result show success';
    resultado.innerHTML = `<strong>${encontrados.length} resultado(s) para "${termo}"${filtro !== 'todos' ? ` em ${rotulosFiltro[filtro] || filtro}` : ''}:</strong><div class="search-hits">` +
        encontrados.map(item =>
            `<button class="search-hit" onclick="irParaResultado('${item.alvo}', '${item.tab || ''}')">` +
            `<i class="fa-solid fa-arrow-right"></i> ${item.titulo}` +
            `<span class="search-hit-tag">${item.secao}</span></button>`
        ).join('') + '</div>';

    return false;
}

function irParaResultado(alvo, tab) {
    if (tab) switchTab(tab);
    const el = document.querySelector(alvo);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==========================================================
// Inicialização
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    iniciarCarrossel();
    carregarPergunta();

    document.querySelectorAll('#navLinks a').forEach(link => {
        link.addEventListener('click', () => {
            const nav = document.getElementById('navLinks');
            const btn = document.getElementById('hamburger');
            if (nav.classList.contains('open')) {
                nav.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
                btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            }
        });
    });

    iniciarDestaqueMenu();
});

// Destaca no menu a seção visível na tela
function iniciarDestaqueMenu() {
    const links = [...document.querySelectorAll('#navLinks a')];
    const secoes = links
        .map(l => document.querySelector(l.getAttribute('href')))
        .filter(Boolean);
    if (secoes.length === 0) return;

    const observador = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = '#' + entry.target.id;
                links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    secoes.forEach(s => observador.observe(s));
}

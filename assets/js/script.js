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
// 1b. Bibliografia (abre/fecha pelo menu)
// ==========================================================
function alternarBibliografia(event) {
    if (event) event.preventDefault();
    const sec = document.getElementById('bibliografia');
    if (sec.hidden) {
        abrirBibliografia();
    } else {
        fecharBibliografia();
    }
}

function abrirBibliografia() {
    const sec = document.getElementById('bibliografia');
    if (sec) {
        sec.hidden = false;
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    fecharMenuMobile();
}

function fecharBibliografia() {
    const sec = document.getElementById('bibliografia');
    if (sec) sec.hidden = true;
    const quiz = document.getElementById('quiz');
    if (quiz) quiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Fecha o menu hamburguer, se estiver aberto (usado ao abrir a bibliografia)
function fecharMenuMobile() {
    const nav = document.getElementById('navLinks');
    const btn = document.getElementById('hamburger');
    if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        if (btn) {
            btn.setAttribute('aria-expanded', 'false');
            btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
    }
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
        pergunta: "Você recebe um SMS que parece ser do seu banco: 'Sua conta será BLOQUEADA hoje. Atualize seus dados agora: bradesco-seguranca.net/atualizar'. O link usa HTTPS e tem o nome do banco. O que isso indica?",
        opcoes: [
            "É seguro usar, porque o link tem HTTPS e o nome do banco aparece no endereço.",
            "É seguro, desde que você digite os dados apenas no campo de login que aparecer.",
            "É um golpe: o domínio verdadeiro do banco não usa um hífen e o HTTPS sozinho não garante que o site é oficial.",
            "É seguro, porque bancos sempre usam dominíos com hífen para separar o nome."
        ],
        correta: 2,
        explicacao: "O cadeado (HTTPS) indica apenas que a conexão é criptografada, não que o site seja confiável. Golpistas registram domínios parecidos, com hífen e subdomínios, para imitar o site oficial."
    },
    {
        pergunta: "Uma amiga de longa data envia um link no WhatsApp: 'Ganhei R$ 500 nesse teste do governo, responde 5 perguntas e cai o PIX na hora!'. A conta dela é antiga e tem fotos reais. Qual é a atitude mais correta?",
        opcoes: [
            "Não clicar e ligar para ela por outro canal para confirmar se realmente foi ela quem enviou.",
            "Clicar sem preencher dados, pois só olhar o site não faz mal.",
            "Confiar, porque a conta é antiga e tem histórico real de conversas.",
            "Responder as perguntas, já que R$ 500 não é valor alto o suficiente para ser golpe."
        ],
        correta: 0,
        explicacao: "Contas clonadas ou invadidas usam o histórico e a confiança da vítima. A única verificação segura é confirmar por outro canal (ligação, encontro presencial) antes de clicar."
    },
    {
        pergunta: "Ao usar o Wi-Fi gratuito de um aeroporto para pagar uma conta pelo aplicativo do banco, você é avisado que a rede é 'aberta e não criptografada'. Qual é o risco real?",
        opcoes: [
            "Nenhum, pois os aplicativos de banco sempre usam conexão própria e ignoram a rede do Wi-Fi.",
            "O risco existe, mas só afeta quem acessa sites, nunca quem usa aplicativos.",
            "Basta ativar o modo anônimo do navegador para ficar totalmente protegido.",
            "Outros usuários da mesma rede podem capturar seus dados, por meio de técnicas como o ataque 'man-in-the-middle'."
        ],
        correta: 3,
        explicacao: "Redes abertas permitem interceptação de tráfego. Até aplicativos podem ser afetados se o atacante usar pontos de acesso falsos. O ideal é usar os dados móveis em operações sensíveis."
    },
    {
        pergunta: "Uma notícia viral afirma: 'CIENTISTAS PROVAM QUE VACINA CAUSA DOENÇA X!!! COMPARTILHE ANTES QUE APAGUEM!'. O texto não traz autor, nem data, nem link para o estudo original. O que esse conjunto de sinais indica?",
        opcoes: [
            "Que a notícia é verdadeira, porque pede para compartilhar rápido antes de ser apagada.",
            "Que provavelmente é desinformação: falta de autoria, de fonte e apelo emocional para compartilhar são sinais clássicos de fake news.",
            "Que é uma notícia confiável, pois usa letras maiúsculas para dar ênfase ao assunto.",
            "Que é verdadeira, pois se estivesse errada já teria sido removida pelos cientistas."
        ],
        correta: 1,
        explicacao: "Ausência de autor, de data, de fonte verificável e o apelo emocional para 'compartilhar antes que apaguem' são padrões típicos de desinformação."
    },
    {
        pergunta: "Uma loja online desconhecida oferece um celular de R$ 3.500 por R$ 700, mas só aceita PIX imediato e avisa: 'promoção válida pelos próximos 10 minutos'. Qual é a análise mais correta?",
        opcoes: [
            "É suspeito, pois a urgência artificial associada a preço irreal e PIX sem intermediário são táticas clássicas de fraude.",
            "É seguro, porque quem aceita PIX normalmente é uma loja com boa reputação.",
            "É seguro, porque preços baixos são o resultado natural de lojas novas tentando ganhar clientes.",
            "É seguro pagar, desde que você consiga baixar um recibo em PDF depois."
        ],
        correta: 0,
        explicacao: "Preço muito abaixo do mercado, urgência forçada ('10 minutos') e pagamento só por PIX sem proteção são a combinação clássica de golpe em compras online. O recibo em PDF não protege ninguém."
    },
    {
        pergunta: "Sobre a verificação em duas etapas (2FA), qual afirmação está correta?",
        opcoes: [
            "O 2FA só protege se você nunca usar o celular para receber ligações.",
            "O 2FA é útil, mas deve ser desativado em bancos, porque atrasa as transações.",
            "O 2FA substitui a necessidade de criar uma senha forte.",
            "O 2FA é uma camada extra de segurança e deve ser ativado sempre que possível, de preferência usando aplicativo autenticador em vez de SMS."
        ],
        correta: 3,
        explicacao: "O 2FA adiciona uma etapa que dificulta o acesso mesmo se a senha vazar. O autenticador por app é mais seguro que o SMS, que pode ser interceptado por clonagem de chip."
    },
    {
        pergunta: "Você recebe uma ligação de alguém que diz ser do suporte do seu banco. A pessoa pede o código de 6 dígitos que acabou de chegar por SMS, 'para confirmar sua identidade'. O que você deve fazer?",
        opcoes: [
            "Informar o código, já que a ligação parece oficial e o atendente é educado.",
            "Nunca informar: esse código é a chave de acesso da sua conta e nenhum funcionário real do banco vai pedi-lo.",
            "Informar o código apenas se o número que ligou tiver o DDD da sua cidade.",
            "Desligar e ligar de volta para o mesmo número para confirmar que é o banco."
        ],
        correta: 1,
        explicacao: "Nenhum banco legítimo pede o código de verificação recebido por SMS. Ele serve justamente para autorizar transações: informá-lo é entregar a conta ao golpista. O número exibido pode ser falsificado."
    },
    {
        pergunta: "Um anúncio patrocinado nas redes sociais mostra o rosto de um famoso apresentador oferecendo 'rendimento garantido de 30% ao mês' em um investimento, com depósito direto por PIX para uma 'corretora'. Qual é a análise correta?",
        opcoes: [
            "Pode ser real, pois anúncios patrocinados passam por verificação da plataforma antes de ir ao ar.",
            "É confiável, porque usar imagem de famoso prova que a empresa é grande e séria.",
            "É golpe: o rosto foi usado sem autorização e nenhum investimento sério garante rendimento fixo tão alto sem risco.",
            "É seguro investir um valor pequeno primeiro, para testar se o rendimento aparece."
        ],
        correta: 2,
        explicacao: "Anúncios patrocinados são pagos e não passam por análise de conteúdo confiável. Famosos têm a imagem usada sem permissão e 'rendimento garantido de 30% ao mês' é promessa matematicamente insustentável. Testar valores pequenos só aumenta a confiança da vítima antes do golpe maior."
    },
    {
        pergunta: "Você precisa fazer login em um site importante, mas a rede é insegura. Sobre o uso de senhas fortes, qual é a prática realmente segura?",
        opcoes: [
            "Usar senhas únicas e longas por site, guardadas em um gerenciador de senhas confiável.",
            "Usar a mesma senha complexa em todos os sites, pois assim você nunca esquece e ninguém adivinha.",
            "Trocar apenas uma letra entre as senhas (ex.: Banco1, Banco2) para facilitar a memorização.",
            "Anotar as senhas no bloco de notas do celular, que fica sempre com você."
        ],
        correta: 0,
        explicacao: "Reutilizar senhas faz com que o vazamento de um único site exponha todas as contas. Pequenas variações (Banco1, Banco2) são previsíveis. O gerenciador de senhas gera e guarda senhas únicas com segurança."
    },
    {
        pergunta: "Você quer compartilhar uma informação importante que recebeu por encaminhamento e ainda não sabe se é verdadeira. De acordo com o letramento digital, qual é a atitude mais responsável?",
        opcoes: [
            "Compartilhar com um aviso 'não sei se é verdade, mas repasso' para não ser responsabilizado.",
            "Compartilhar apenas em grupos pequenos, pois grupos grandes é que espalham fake news.",
            "Compartilhar rapidamente, porque a informação pode ser útil e o conteúdo é responsabilidade de quem criou.",
            "Não compartilhar enquanto não confirmar em fontes oficiais ou agências de checagem: compartilhar sem verificar também espalha desinformação."
        ],
        correta: 3,
        explicacao: "A marca jurídica e ética da desinformação não está em quem criou, e sim em quem a espalha. O aviso 'não sei se é verdade' não exime a responsabilidade: a verificação deve vir antes do compartilhamento."
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

    // --- Bibliografia ---
    { titulo: 'Bibliografia e Referências', secao: 'Bibliografia', categoria: 'bibliografia', alvo: '#bibliografia', abrirBiblio: true, termos: ['bibliografia', 'referência', 'referencia', 'referências', 'referencias', 'fonte', 'fontes', 'livro', 'livros', 'autor', 'autores', 'safernet', 'cetic', 'banco central', 'oms', 'who', 'lupa'] },

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
    sobre: 'Sobre',
    bibliografia: 'Bibliografia'
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
            `<button class="search-hit" onclick="irParaResultado('${item.alvo}', '${item.tab || ''}', ${item.abrirBiblio ? 'true' : 'false'})">` +
            `<i class="fa-solid fa-arrow-right"></i> ${item.titulo}` +
            `<span class="search-hit-tag">${item.secao}</span></button>`
        ).join('') + '</div>';

    return false;
}

function irParaResultado(alvo, tab, abrirBiblio) {
    if (abrirBiblio) {
        const sec = document.getElementById('bibliografia');
        if (sec) sec.hidden = false;
    }
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

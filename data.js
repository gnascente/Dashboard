// =================================================================
// data.js - GERENCIAMENTO DE DADOS, ESTADO E NOTIFICAÇÕES
// =================================================================

// --- DADOS E ESTADO DA APLICAÇÃO ---
export let lancamentos = [];
export let categorias = [];
export let carteiras = [];
export let fornecedores = [];

// Funções para permitir que o backup/restauração altere os arrays
export function updateLancamentos(newData) {
    lancamentos.length = 0; // Limpa o array sem quebrar a referência
    lancamentos.push(...newData); // Adiciona os novos itens
}
export function updateCategorias(newData) {
    categorias.length = 0;
    categorias.push(...newData);
}
export function updateCarteiras(newData) {
    carteiras.length = 0;
    carteiras.push(...newData);
}
export function updateFornecedores(newData) {
    fornecedores.length = 0;
    fornecedores.push(...newData);
}


// --- PERSISTÊNCIA DE DADOS (LocalStorage) ---
export const salvarDados = () => {
    const dataToSave = {
        lancamentos,
        categorias,
        carteiras,
        fornecedores
    };
    localStorage.setItem('controleObraData', JSON.stringify(dataToSave));

    try {
        if (window.OneSignal && OneSignal.User.PushSubscription.id) {
            checarEAgendarNotificacaoDiaria();
        }
    } catch (error) {
        console.error("Falha ao processar agendamento de notificação (servidor não encontrado):", error);
    }
};

export const carregarDados = () => {
    const dadosSalvos = localStorage.getItem('controleObraData');
    if (dadosSalvos) {
        const data = JSON.parse(dadosSalvos);
        lancamentos = data.lancamentos || [];
        categorias = data.categorias || [];
        carteiras = data.carteiras || [];
        fornecedores = data.fornecedores || [];
    } else {
        // Se não houver dados, carrega um conjunto inicial
        categorias = ['Estrutura e Vedações', 'Acabamentos', 'Terraplanagem/Tratores', 'Hidráulica', 'Elétrica'];
        carteiras = ['Conta Corrente', 'Investimentos'];
        fornecedores = ['Leroy Merlin', 'C&C Casa e Construção'];
        lancamentos = [
            { id: 1, data: '2025-10-06', carteira: 'Conta Corrente', categoria: 'Estrutura e Vedações', descricao: 'Cimento (atrasado)', valor: 500, pago: false, fotos: [], fornecedor: 'Leroy Merlin' },
            { id: 2, data: '2025-10-09', carteira: 'Investimentos', categoria: 'Acabamentos', descricao: 'Tinta (vence amanhã)', valor: 250, pago: false, fotos: [], fornecedor: 'C&C Casa e Construção' },
            { id: 3, data: '2025-09-25', carteira: 'Conta Corrente', categoria: 'Terraplanagem/Tratores', descricao: 'Pisos (pago)', valor: 3317.16, pago: true, fotos: [], fornecedor: 'Leroy Merlin' },
        ];
    }
};

export const adicionarItem = (tipo, nome) => {
    const dataArray = { 'categoria': categorias, 'fornecedor': fornecedores, 'carteira': carteiras }[tipo];
    if (dataArray && nome && !dataArray.some(item => item.toLowerCase() === nome.toLowerCase())) {
        dataArray.push(nome);
        return true;
    }
    return false;
};

export const removerItem = (tipo, nome, substituto = null) => {
    const dataArray = { 'categoria': categorias, 'fornecedor': fornecedores, 'carteira': carteiras }[tipo];
    const index = dataArray.indexOf(nome);

    if (index === -1) return; // Item não existe

    if (substituto) {
        lancamentos.forEach(lanc => {
            if (lanc[tipo] === nome) {
                lanc[tipo] = substituto;
            }
        });
    }
    dataArray.splice(index, 1);
};


export const adicionarLancamento = (dados) => {
    const novoId = lancamentos.length > 0 ? Math.max(...lancamentos.map(l => l.id)) + 1 : 1;
    lancamentos.push({ id: novoId, ...dados });
    return novoId;
};

export const atualizarLancamento = (id, dados) => {
    const index = lancamentos.findIndex(l => l.id === id);
    if (index !== -1) {
        lancamentos[index] = { ...lancamentos[index], ...dados };
    }
};

export const removerLancamento = (id) => {
    const index = lancamentos.findIndex(l => l.id === id);
    if (index > -1) {
        lancamentos.splice(index, 1);
    }
};

// --- LÓGICA DE NOTIFICAÇÕES PUSH ---
async function cancelarNotificacao(notificationId) {
    try {
        const response = await fetch('/api/cancelNotification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId })
        });
        if (!response.ok) {
            console.error('Falha ao cancelar a notificação.', await response.text());
            return { success: false };
        }
        return await response.json();
    } catch (error) {
        console.error('Erro de rede ao cancelar notificação:', error);
        return { success: false };
    }
}

async function agendarNotificacao(notificationPayload) {
    try {
        const { app_id, ...payload } = notificationPayload;
        const response = await fetch('/api/scheduleNotification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            console.error('Falha ao agendar a notificação.', await response.text());
            return { id: null };
        }
        return await response.json();
    } catch (error) {
        console.error('Erro de rede ao agendar notificação:', error);
        return { id: null };
    }
}

async function checarEAgendarNotificacaoDiaria() {
    const scheduledNotificationId = localStorage.getItem('scheduledDailyNotificationId');
    if (scheduledNotificationId) {
        await cancelarNotificacao(scheduledNotificationId);
        localStorage.removeItem('scheduledDailyNotificationId');
    }

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(0, 0, 0, 0);
    const amanhaStr = amanha.toISOString().slice(0, 10);

    const lancamentosNaoPagos = lancamentos.filter(l => !l.pago);
    const atrasados = lancamentosNaoPagos.filter(l => new Date(l.data + "T12:00:00Z") < amanha);
    const vencendoAmanha = lancamentosNaoPagos.filter(l => l.data === amanhaStr);

    let partesMensagem = [];

    if (atrasados.length > 0) {
        partesMensagem.push(`você tem <b>${atrasados.length}</b> lançamento${atrasados.length > 1 ? 's' : ''} atrasado${atrasados.length > 1 ? 's' : ''}`);
    }
    if (vencendoAmanha.length > 0) {
        partesMensagem.push(`<br><b>${vencendoAmanha.length}</b> vencendo hoje`);
    }

    if (partesMensagem.length === 0) return;

    let mensagem = "Lembrete da Obra: <br>" + partesMensagem.join(', ') + ".";
    mensagem += "<br><br>Clique aqui para ver os detalhes.";
    
    // --- [NOVA LÓGICA DE AGENDAMENTO INTELIGENTE] ---
    const agora = new Date();
    let dataEnvio = new Date();

    // Define o horário de "corte" para 8h da manhã de hoje
    dataEnvio.setHours(8, 0, 0, 0); 

    // Se o horário atual (agora) já passou das 8h de hoje,
    // a notificação é agendada para 8h de amanhã.
    if (agora.getTime() > dataEnvio.getTime()) {
        dataEnvio.setDate(dataEnvio.getDate() + 1);
    }
    // Caso contrário (se ainda não são 8h), a notificação
    // permanece agendada para 8h de hoje.
    // --- [FIM DA NOVA LÓGICA] ---

    const dataFormatada = dataEnvio.toString().match(/(\w{3} \w{3} \d{2} \d{4} \d{2}:\d{2}:\d{2} GMT[-+]\d{4})/)[0];
    
    const playerId = OneSignal.User.PushSubscription.id;
    if (!playerId) return;

    const notificationPayload = {
        include_player_ids: [playerId],
        headings: { pt: "Resumo Diário da Obra", en: "Daily Construction Summary" },
        contents: { pt: mensagem, en: "You have pending items. Check the app." },
        send_after: dataFormatada
    };

    const response = await agendarNotificacao(notificationPayload);
    if (response && response.id) {
        localStorage.setItem('scheduledDailyNotificationId', response.id);
    }
}

export async function agendarNotificacaoDeTeste(mostrarNotificacaoCallback) {
    mostrarNotificacaoCallback('Preparando agendamento de teste...', true);
    
    const playerId = OneSignal.User.PushSubscription.id;
    if (!playerId) {
        mostrarNotificacaoCallback("Não foi possível obter seu ID de usuário para o teste.");
        return;
    }

    const dataEnvio = new Date();
    dataEnvio.setMinutes(dataEnvio.getMinutes() + 1);
    const dataFormatada = dataEnvio.toString().match(/(\w{3} \w{3} \d{2} \d{4} \d{2}:\d{2}:\d{2} GMT[-+]\d{4})/)[0];

    const notificationPayload = {
        include_player_ids: [playerId],
        headings: { pt: "Teste de Notificação da Obra", en: "Test Notification" },
        contents: { pt: "Esta é uma notificação de teste agendada. Tudo funcionando!", en: "This is a scheduled test notification." },
        send_after: dataFormatada
    };

    const response = await agendarNotificacao(notificationPayload);
    if (response && response.id) {
        mostrarNotificacaoCallback('Notificação agendada para daqui a 1 minuto!', true);
    } else {
        mostrarNotificacaoCallback('Falha ao agendar notificação de teste.');
    }
}

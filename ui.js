// =================================================================
// ui.js - GERENCIAMENTO DA INTERFACE DO USUÁRIO (DOM)
// =================================================================

// Removida a importação de { categorias, carteiras, fornecedores } daqui
import { lancamentos } from './data.js'; 

// --- SELETORES DE DOM ---
export const containerLista = document.getElementById('lancamentos-lista');
export const resumoTotalContainer = document.getElementById('resumo-total');
export const campoPesquisa = document.getElementById('campo-pesquisa');
export const lancamentosTabBtn = document.getElementById('lancamentos-tab-btn');
export const relatoriosTabBtn = document.getElementById('relatorios-tab-btn');
export const lancamentosContent = document.getElementById('lancamentos-content');
export const relatoriosContent = document.getElementById('relatorios-content');
export const mainContent = document.getElementById('main-content');
export const backupContent = document.getElementById('backup-content');
export const settingsContent = document.getElementById('settings-content');
export const lancamentoModal = document.getElementById('lancamento-modal');
export const lancamentoForm = document.getElementById('lancamento-form');
export const fecharLancamentoModalBtn = document.getElementById('fechar-lancamento-modal');
export const cancelarLancamentoBtn = document.getElementById('cancelar-lancamento');
export const abrirNovoLancamentoBtn = document.getElementById('abrir-novo-lancamento-modal');
export const lancamentoModalTitulo = document.getElementById('lancamento-modal-titulo');
export const categoriaDropdown = document.getElementById('lancamento-categoria');
export const carteiraDropdown = document.getElementById('lancamento-carteira');
export const fornecedorDropdown = document.getElementById('lancamento-fornecedor');
export const addCategoriaModal = document.getElementById('add-categoria-modal');
export const addCategoriaForm = document.getElementById('add-categoria-form');
export const addCarteiraModal = document.getElementById('add-carteira-modal');
export const addCarteiraForm = document.getElementById('add-carteira-form');
export const addFornecedorModal = document.getElementById('add-fornecedor-modal');
export const addFornecedorForm = document.getElementById('add-fornecedor-form');
export const btnGaleriaUpload = document.getElementById('btn-galeria-upload');
export const btnCameraUpload = document.getElementById('btn-camera-upload');
export const galeriaInput = document.getElementById('galeria-input');
export const cameraInput = document.getElementById('camera-input');
export const arquivoInput = document.getElementById('arquivo-input');
export const fotosThumbnailsContainer = document.getElementById('fotos-thumbnails-container');
export const notificacaoModal = document.getElementById('notificacao-modal');
export const notificacaoMensagem = document.getElementById('notificacao-mensagem');
export const galeriaModal = document.getElementById('galeria-modal');
export const galeriaContainer = document.getElementById('galeria-fotos-container');
export const fecharGaleriaBtn = document.getElementById('fechar-galeria');
export const galeriaTitulo = document.getElementById('galeria-titulo');
export const zoomModal = document.getElementById('zoom-modal');
export const zoomedImage = document.getElementById('zoomed-image');
export const fecharZoomBtn = document.getElementById('fechar-zoom');
export const abrirMenuBtn = document.getElementById('abrir-menu-btn');
export const menuLateral = document.getElementById('menu-lateral');
export const menuLateralOverlay = document.getElementById('menu-lateral-overlay');
export const menuLancamentosBtn = document.getElementById('menu-lancamentos-btn');
export const menuBackupBtn = document.getElementById('menu-backup-btn');
export const menuConfiguracoesBtn = document.getElementById('menu-configuracoes-btn');
export const notificationToggle = document.getElementById('notification-toggle');
export const notificationStatusText = document.getElementById('notification-status-text');
export const exportarBtn = document.getElementById('exportar-btn');
export const importarBtn = document.getElementById('importar-btn');
export const importarInput = document.getElementById('importar-input');
export const abrirFiltroBtn = document.getElementById('abrir-filtro-btn');
export const filtroAvancadoOverlay = document.getElementById('filtro-avancado-overlay');
export const filtroAvancadoPanel = document.getElementById('filtro-avancado-panel');
export const fecharFiltroBtn = document.getElementById('fechar-filtro-btn');
export const aplicarFiltrosBtn = document.getElementById('aplicar-filtros-btn');
export const limparFiltrosBtn = document.getElementById('limpar-filtros-btn');
export const filtroBadge = document.getElementById('filtro-badge');
export const deleteItemModal = document.getElementById('delete-item-modal');
export const deleteItemTitle = document.getElementById('delete-item-title');
export const deleteItemLabel = document.getElementById('delete-item-label');
export const deleteItemSelect = document.getElementById('delete-item-select');
export const deleteItemInfoSection = document.getElementById('delete-item-info-section');
export const deleteItemMessage = document.getElementById('delete-item-message');
export const deleteItemReplaceSection = document.getElementById('delete-item-replace-section');
export const deleteItemReplaceSelect = document.getElementById('delete-item-replace-select');
export const deleteItemAddReplacementBtn = document.getElementById('delete-item-add-replacement-btn');
export const cancelarDeleteItemBtn = document.getElementById('cancelar-delete-item');
export const confirmarDeleteSimplesBtn = document.getElementById('confirmar-delete-simples');
export const confirmarDeleteReplaceBtn = document.getElementById('confirmar-delete-replace');
export const confirmacaoModal = document.getElementById('confirmacao-modal');
export const confirmacaoTitulo = document.getElementById('confirmacao-titulo');
export const confirmacaoMensagem = document.getElementById('confirmacao-mensagem');
export const cancelarConfirmacaoBtn = document.getElementById('cancelar-confirmacao-btn');
export const confirmarAcaoBtn = document.getElementById('confirmar-acao-btn');
export const excluirLancamentoBtn = document.getElementById('excluir-lancamento-btn');
export const totalizerFooter = document.getElementById('totalizer-footer');
export const toggleBtn = document.getElementById('toggle-totalizer-btn');

// --- LISTENER PARA O TOGGLE 'PAGO' ---
const pagoCheckbox = lancamentoForm['lancamento-pago'];
const pagoStatusText = document.getElementById('pago-status-text');
if (pagoCheckbox && pagoStatusText) {
    pagoCheckbox.addEventListener('change', () => {
        const isChecked = pagoCheckbox.checked;
        pagoStatusText.textContent = isChecked ? 'Sim' : 'Não';
        pagoStatusText.classList.toggle('text-green-600', isChecked);
        pagoStatusText.classList.toggle('text-gray-500', !isChecked);
    });
}

// --- VARIÁVEIS DE UI ---
// O ID do último lançamento agora é salvo no localStorage para persistir
export let ultimoLancamentoId = localStorage.getItem('ultimoLancamentoId') ? Number(localStorage.getItem('ultimoLancamentoId')) : null;
let categoryChartInstance = null;

// --- FUNÇÃO PARA ATUALIZAR O ID DO ÚLTIMO LANÇAMENTO ---
export const setUltimoLancamentoId = (id) => {
    ultimoLancamentoId = id;
    // Salva o ID no localStorage para que o destaque não se perca ao recarregar a página
    localStorage.setItem('ultimoLancamentoId', id);
};

// --- FUNÇÕES UTILITÁRIAS DE FORMATAÇÃO ---
export const formatarMoeda = (valor) => (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatarDataSimples = (dataString) => {
    const dataObj = new Date(dataString + 'T12:00:00');
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(dataObj).replace('.', '');
    return `${dia} de ${mes}`;
};
export const vibrarDispositivo = (pattern = 200) => {
    if ('vibrate' in navigator) {
        try { navigator.vibrate(pattern); }
        catch (error) { console.error("A vibração falhou:", error); }
    }
};
const formatarData = (item) => {
    if (!item || !item.data) return { text: '', color: 'gray' };
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataLancamento = new Date(item.data + 'T12:00:00Z');
    dataLancamento.setUTCHours(0, 0, 0, 0);

    const diffTime = dataLancamento.getTime() - hoje.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (item.pago) return { text: 'Pago', color: 'green' };
    if (diffDays < 0) {
        const diasAtraso = Math.abs(diffDays);
        return { text: `Vencido há ${diasAtraso} dia${diasAtraso > 1 ? 's' : ''}`, color: 'orange' };
    }
    if (diffDays === 0) return { text: 'Vence hoje', color: 'orange' };
    return { text: `Vence em ${diffDays} dia${diffDays > 1 ? 's' : ''}`, color: 'gray' };
};

// --- RENDERIZAÇÃO PRINCIPAL ---
export const renderizarLancamentos = (filtrosAtivos, categorias, fornecedores, carteiras) => {
    let lancamentosFiltrados = [...lancamentos];
    const filtroTexto = campoPesquisa.value.toLowerCase();
    if (filtroTexto) lancamentosFiltrados = lancamentosFiltrados.filter(lanc => lanc.descricao.toLowerCase().includes(filtroTexto));
    if (filtrosAtivos.status) { const pago = filtrosAtivos.status === 'pago'; lancamentosFiltrados = lancamentosFiltrados.filter(lanc => lanc.pago === pago); }
    if (filtrosAtivos.categorias.length > 0) lancamentosFiltrados = lancamentosFiltrados.filter(lanc => filtrosAtivos.categorias.includes(lanc.categoria));
    if (filtrosAtivos.fornecedores.length > 0) lancamentosFiltrados = lancamentosFiltrados.filter(lanc => filtrosAtivos.fornecedores.includes(lanc.fornecedor));
    if (filtrosAtivos.carteiras.length > 0) lancamentosFiltrados = lancamentosFiltrados.filter(lanc => filtrosAtivos.carteiras.includes(lanc.carteira));

    containerLista.innerHTML = '';

    if (lancamentosFiltrados.length === 0) {
        containerLista.innerHTML = `<div class="text-center py-16 px-6 bg-white rounded-2xl shadow-sm border border-gray-200"><svg class="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg><h3 class="mt-4 text-lg font-semibold text-gray-700">Nenhum lançamento encontrado</h3><p class="mt-1 text-sm text-gray-500">Comece adicionando uma nova despesa da obra no botão de mais.</p></div>`;
    } else {
        const agrupadoPorMes = [...lancamentosFiltrados].sort((a, b) => new Date(b.data) - new Date(a.data) || b.id - a.id)
            .reduce((acc, lanc) => {
                const mesAno = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(lanc.data + 'T12:00:00'));
                if (!acc[mesAno]) acc[mesAno] = [];
                acc[mesAno].push(lanc);
                return acc;
            }, {});

        for (const mesAno in agrupadoPorMes) {
            const lancamentosDoMes = agrupadoPorMes[mesAno];
            const totalMes = lancamentosDoMes.reduce((soma, item) => soma + Number(item.valor || 0), 0);
            containerLista.insertAdjacentHTML('beforeend', `<div class="flex justify-between items-center mb-2"><h2 class="font-bold text-lg text-gray-900">${mesAno.charAt(0).toUpperCase() + mesAno.slice(1)}</h2><p class="text-gray-600 font-semibold">${formatarMoeda(totalMes)}</p></div>`);

            const listContainer = document.createElement('div');
            listContainer.className = 'space-y-3';
            lancamentosDoMes.forEach(item => {
                const tagInfo = formatarData(item);
                const dataSimples = formatarDataSimples(item.data);
                const tagClasses = { 'green': 'bg-green-100 text-green-800', 'orange': 'bg-amber-100 text-amber-800', 'gray': 'bg-gray-100 text-gray-800' };
                const statusTagHTML = `<span class="px-2 py-0.5 text-xs font-semibold ${tagClasses[tagInfo.color]} rounded-md">${tagInfo.text}</span>`;
                const liquidarBtn = !item.pago ? `<button class="btn-toggle-pago bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600" data-id="${item.id}">Liquidar</button>` : '';

                const maxFornecedorLength = item.pago ? 16 : 12;
                let fornecedorDisplay = item.fornecedor;
                if (fornecedorDisplay && fornecedorDisplay.length > maxFornecedorLength) {
                    fornecedorDisplay = fornecedorDisplay.substring(0, maxFornecedorLength) + '...';
                }

                const cardHTML = `
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex items-center gap-2 flex-wrap">${statusTagHTML}<p class="text-sm text-gray-500 font-medium">${dataSimples}</p></div>
                            <p class="font-bold text-xl text-gray-800 whitespace-nowrap pl-2">${formatarMoeda(item.valor)}</p>
                        </div>
                        <p class="font-semibold text-base ${item.id === ultimoLancamentoId ? 'text-highlight' : 'text-gray-900'} line-clamp-3 mb-3" title="${item.descricao}">${item.descricao}</p>
                        <div class="border-t border-gray-200 pt-3 flex items-end justify-between">
                            <div>
                                <div class="text-xs text-gray-500"><p>${item.categoria}</p><p>${fornecedorDisplay} — ${item.carteira}</p></div>
                                <div class="mt-2">
                                    <button class="btn-galeria text-sm text-violet-600 font-semibold p-1 -ml-1 rounded-lg hover:bg-violet-50 ${item.fotos && item.fotos.length > 0 ? 'inline-block' : 'hidden'}" data-id="${item.id}">
                                        Ver Anexos (${item.fotos ? item.fotos.length : 0})
                                    </button>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button class="btn-editar p-2 rounded-full bg-gray-100 hover:bg-gray-200" data-id="${item.id}" title="Editar lançamento">
                                    <svg class="w-5 h-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.862 4.487zm0 0L19.5 7.125"></path></svg>
                                </button>
                                ${liquidarBtn}
                            </div>
                        </div>
                    </div>`;
                listContainer.insertAdjacentHTML('beforeend', cardHTML);
            });
            containerLista.appendChild(listContainer);
        }
    }

    const totalExibido = lancamentosFiltrados.reduce((soma, item) => soma + Number(item.valor || 0), 0);
    resumoTotalContainer.innerHTML = `<div><span class="font-semibold">Total Exibido</span><p class="text-xs text-gray-500">Exibindo ${lancamentosFiltrados.length} de ${lancamentos.length} itens</p></div><span class="font-bold text-lg">${formatarMoeda(totalExibido)}</span>`;
};

// --- COMPONENTES DE UI (MODAIS, FILTROS, NAVEGAÇÃO, ETC) ---

export const mostrarNotificacao = (mensagem, success = false) => {
    notificacaoMensagem.textContent = mensagem;
    notificacaoModal.classList.toggle('bg-red-500', !success);
    notificacaoModal.classList.toggle('bg-green-500', success);
    notificacaoModal.classList.remove('hidden');
    setTimeout(() => { notificacaoModal.classList.remove('translate-x-[120%]'); }, 10);
    setTimeout(() => {
        notificacaoModal.classList.add('translate-x-[120%]');
        setTimeout(() => { notificacaoModal.classList.add('hidden'); }, 300);
    }, 3000);
};

export function abrirModalLancamento(id = null, fotosTemporariasRef, dataArrays) {
    fotosTemporariasRef.set([]);
    lancamentoForm['lancamento-valor'].classList.remove('border-red-500');

    const pagoCheckbox = lancamentoForm['lancamento-pago'];
    const pagoStatusText = document.getElementById('pago-status-text');

    if (id) {
        const lancamento = lancamentos.find(l => l.id === id);
        if (!lancamento) return mostrarNotificacao('Lançamento não encontrado.');

        lancamentoModalTitulo.textContent = 'Editar Lançamento';
        excluirLancamentoBtn.classList.remove('hidden');
        lancamentoForm['lancamento-id'].value = lancamento.id;
        lancamentoForm['lancamento-data'].value = lancamento.data;
        lancamentoForm['lancamento-descricao'].value = lancamento.descricao;
        pagoCheckbox.checked = lancamento.pago;
        lancamentoForm['lancamento-valor'].value = lancamento.valor ? String(lancamento.valor).replace('.', ',') : '';
        fotosTemporariasRef.set([...(lancamento.fotos || [])]);

        atualizarTodosDropdownsEPopups(dataArrays.categorias, dataArrays.carteiras, dataArrays.fornecedores);
        categoriaDropdown.value = lancamento.categoria;
        fornecedorDropdown.value = lancamento.fornecedor;
        carteiraDropdown.value = lancamento.carteira;
    } else {
        lancamentoForm.reset();
        lancamentoModalTitulo.textContent = 'Novo Lançamento';
        excluirLancamentoBtn.classList.add('hidden');
        lancamentoForm['lancamento-id'].value = '';
        lancamentoForm['lancamento-data'].valueAsDate = new Date();
        pagoCheckbox.checked = false;
        atualizarTodosDropdownsEPopups(dataArrays.categorias, dataArrays.carteiras, dataArrays.fornecedores);
    }

    pagoStatusText.textContent = pagoCheckbox.checked ? 'Sim' : 'Não';
    pagoStatusText.classList.toggle('text-green-600', pagoCheckbox.checked);
    pagoStatusText.classList.toggle('text-gray-500', !pagoCheckbox.checked);

    renderizarThumbnails(fotosTemporariasRef.get());
    lancamentoModal.classList.remove('hidden');
}
export const fecharModalLancamento = () => lancamentoModal.classList.add('hidden');

export const popularDropdown = (dropdown, items, placeholder = null) => {
    const currentValue = dropdown.value;
    dropdown.innerHTML = '';
    if (placeholder) dropdown.add(new Option(placeholder, ""));
    [...items].sort((a, b) => a.localeCompare(b)).forEach(item => dropdown.add(new Option(item, item)));
    if (items.includes(currentValue)) dropdown.value = currentValue;
};

export const atualizarTodosDropdownsEPopups = (categorias, carteiras, fornecedores) => {
    popularDropdown(categoriaDropdown, categorias);
    popularDropdown(carteiraDropdown, carteiras);
    popularDropdown(fornecedorDropdown, fornecedores);
    inicializarFiltros(categorias, carteiras, fornecedores);
};

export const renderizarThumbnails = (fotos) => {
    fotosThumbnailsContainer.innerHTML = '';
    fotos.forEach((anexo, index) => {
        const div = document.createElement('div');
        div.className = 'relative';
        let thumbnailHTML = '';

        if (anexo.type && anexo.type.startsWith('image/')) {
            thumbnailHTML = `<img src="${anexo.src}" class="w-full h-24 object-cover rounded-md" title="${anexo.name}">`;
        } else {
            thumbnailHTML = `
                <div class="w-full h-24 bg-gray-100 rounded-md flex flex-col items-center justify-center p-2 border border-gray-200" title="${anexo.name}">
                    <svg class="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v.01a1 1 0 102 0V12zm3 0a1 1 0 10-2 0v.01a1 1 0 102 0V12z" clip-rule="evenodd" /></svg>
                    <span class="text-xs text-gray-600 mt-2 text-center w-full truncate">${anexo.name}</span>
                </div>`;
        }
        div.innerHTML = thumbnailHTML + `<button type="button" data-index="${index}" class="btn-remover-foto absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs shadow-md">&times;</button>`;
        fotosThumbnailsContainer.appendChild(div);
    });
};

export const handleAnexos = (files, fotosTemporariasRef) => {
    [...files].forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const currentPhotos = fotosTemporariasRef.get();
            currentPhotos.push({ name: file.name, type: file.type, src: e.target.result });
            fotosTemporariasRef.set(currentPhotos);
            renderizarThumbnails(currentPhotos);
        };
        reader.readAsDataURL(file);
    });
};

export const alternarAbas = (aba) => {
    const isLancamentos = aba === 'lancamentos';
    lancamentosTabBtn.setAttribute('aria-selected', isLancamentos);
    relatoriosTabBtn.setAttribute('aria-selected', !isLancamentos);
    [lancamentosTabBtn, relatoriosTabBtn].forEach(btn => {
        const isSelected = btn.id.startsWith(aba);
        btn.classList.toggle('text-violet-600', isSelected);
        btn.classList.toggle('border-violet-600', isSelected);
        btn.classList.toggle('text-gray-500', !isSelected);
        btn.classList.toggle('border-transparent', !isSelected);
    });
    lancamentosContent.classList.toggle('hidden', !isLancamentos);
    relatoriosContent.classList.toggle('hidden', isLancamentos);
    totalizerFooter.classList.toggle('hidden', !isLancamentos);
    if (!isLancamentos) {
        renderizarResumoObra();
        renderizarGraficoCategorias();
    }
};

export const fecharMenu = () => { menuLateral.classList.add('-translate-x-full'); menuLateralOverlay.classList.add('hidden'); };
export const abrirMenu = () => { menuLateral.classList.remove('-translate-x-full'); menuLateralOverlay.classList.remove('hidden'); };

export const fecharFiltroPanel = () => { filtroAvancadoPanel.classList.add('translate-x-full'); filtroAvancadoOverlay.classList.add('hidden'); };
export const abrirFiltroPanel = (filtrosAtivos) => { filtroAvancadoPanel.classList.remove('translate-x-full'); filtroAvancadoOverlay.classList.remove('hidden'); atualizarPillsUI(filtrosAtivos); };
const criarPill = (text, value, group) => {
    const pill = document.createElement('button');
    pill.className = 'px-3 py-1 border rounded-full text-sm cursor-pointer hover:bg-gray-200 transition-colors';
    pill.textContent = text;
    pill.dataset.value = value;
    pill.dataset.group = group;
    return pill;
};
export const atualizarPillsUI = (filtrosAtivos) => {
    document.querySelectorAll('#filtro-avancado-panel .accordion-content button').forEach(pill => {
        const { group, value } = pill.dataset;
        const isActive = (group === 'status') ? (filtrosAtivos.status === value) : filtrosAtivos[group]?.includes(value);
        pill.classList.toggle('bg-violet-500', isActive);
        pill.classList.toggle('text-white', isActive);
    });
    const count = (filtrosAtivos.status ? 1 : 0) + (filtrosAtivos.categorias?.length || 0) + (filtrosAtivos.fornecedores?.length || 0) + (filtrosAtivos.carteiras?.length || 0);
    filtroBadge.textContent = count;
    filtroBadge.classList.toggle('hidden', count === 0);
};
export const handlePillClick = (pill, filtrosAtivos) => {
    const { group, value } = pill.dataset;
    if (group === 'status') {
        filtrosAtivos.status = (filtrosAtivos.status === value) ? null : value;
    } else {
        if (!filtrosAtivos[group]) filtrosAtivos[group] = [];
        const index = filtrosAtivos[group].indexOf(value);
        if (index > -1) filtrosAtivos[group].splice(index, 1);
        else filtrosAtivos[group].push(value);
    }
    atualizarPillsUI(filtrosAtivos);
};
export const inicializarFiltros = (categorias, carteiras, fornecedores) => {
    const statusContainer = document.getElementById('filtro-status-container');
    statusContainer.innerHTML = '';
    ['Pagos', 'Não Pago'].forEach(status => statusContainer.appendChild(criarPill(status, status === 'Pagos' ? 'pago' : 'aberto', 'status')));

    const categoriasContainer = document.getElementById('filtro-categorias-container');
    categoriasContainer.innerHTML = '';
    [...categorias].sort().forEach(cat => categoriasContainer.appendChild(criarPill(cat, cat, 'categorias')));

    const fornecedoresContainer = document.getElementById('filtro-fornecedores-container');
    fornecedoresContainer.innerHTML = '';
    [...fornecedores].sort().forEach(forn => fornecedoresContainer.appendChild(criarPill(forn, forn, 'fornecedores')));

    const carteirasContainer = document.getElementById('filtro-carteiras-container');
    carteirasContainer.innerHTML = '';
    [...carteiras].sort().forEach(cart => carteirasContainer.appendChild(criarPill(cart, cart, 'carteiras')));
};

export const renderizarResumoObra = () => {
    const totalPago = lancamentos.filter(l => l.pago).reduce((soma, l) => soma + (l.valor || 0), 0);
    const totalPendente = lancamentos.filter(l => !l.pago).reduce((soma, l) => soma + (l.valor || 0), 0);
    document.getElementById('resumo-pago').textContent = formatarMoeda(totalPago);
    document.getElementById('resumo-pendente').textContent = formatarMoeda(totalPendente);
    document.getElementById('resumo-custo-total').textContent = formatarMoeda(totalPago + totalPendente);
};
export const renderizarGraficoCategorias = () => {
    if (categoryChartInstance) categoryChartInstance.destroy();
    const ctx = document.getElementById('category-chart').getContext('2d');
    const gastosPorCategoria = lancamentos.reduce((acc, lanc) => {
        acc[lanc.categoria] = (acc[lanc.categoria] || 0) + (Number(lanc.valor) || 0);
        return acc;
    }, {});
    const sorted = Object.entries(gastosPorCategoria).sort(([, a], [, b]) => b - a);
    categoryChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(([cat]) => cat),
            datasets: [{
                label: 'Total Gasto',
                data: sorted.map(([, val]) => val),
                backgroundColor: sorted.map(() => `rgba(124, 58, 237, ${Math.random() * 0.5 + 0.4})`)
            }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
};

export const abrirGaleria = (lancamentoId) => {
    const lancamento = lancamentos.find(l => l.id === lancamentoId);
    if (!lancamento) return;
    galeriaTitulo.textContent = `Anexos: ${lancamento.descricao}`;
    galeriaContainer.innerHTML = '';

    if (lancamento.fotos && lancamento.fotos.length > 0) {
        lancamento.fotos.forEach(anexo => {
            if (anexo.type && anexo.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = anexo.src;
                img.className = 'w-full h-auto object-cover rounded-md shadow-sm cursor-pointer hover:opacity-80 transition-opacity';
                img.title = anexo.name;
                galeriaContainer.appendChild(img);
            } else {
                const link = document.createElement('a');
                link.href = anexo.src;
                link.download = anexo.name;
                link.className = 'block w-full h-auto p-4 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-3 text-gray-700';
                link.innerHTML = `
                    <svg class="w-8 h-8 text-gray-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v.01a1 1 0 102 0V12zm3 0a1 1 0 10-2 0v.01a1 1 0 102 0V12z" clip-rule="evenodd" /></svg>
                    <span class="truncate font-medium">${anexo.name}</span>`;
                galeriaContainer.appendChild(link);
            }
        });
    } else {
        galeriaContainer.innerHTML = `<p class="text-center text-gray-500 col-span-full">Nenhum anexo para este lançamento.</p>`;
    }
    galeriaModal.classList.remove('hidden');
};
export const fecharGaleria = () => galeriaModal.classList.add('hidden');
export const abrirZoom = (src) => { zoomedImage.src = src; zoomModal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; };
export const fecharZoom = () => { zoomModal.classList.add('hidden'); document.body.style.overflow = ''; };

export const applyTotalizerState = () => {
    const footer = document.getElementById('totalizer-footer');
    const arrowDown = document.getElementById('totalizer-arrow-down');
    const arrowUp = document.getElementById('totalizer-arrow-up');
    const isCollapsed = localStorage.getItem('totalizerCollapsed') === 'true';
    footer.dataset.collapsed = isCollapsed;
    if (isCollapsed) {
        const height = document.getElementById('totalizer-footer-content').offsetHeight;
        footer.style.transform = `translateY(${height - 1}px)`;
        arrowDown.classList.add('hidden');
        arrowUp.classList.remove('hidden');
    } else {
        footer.style.transform = 'translateY(0)';
        arrowDown.classList.remove('hidden');
        arrowUp.classList.add('hidden');
    }
};

export const setupAddModal = (modal, form, successCallback) => {
    const modalContent = modal.querySelector('div[id$="-content"]');
    const openModal = () => {
        form.reset();
        modal.classList.remove('hidden');
        setTimeout(() => modalContent.classList.remove('scale-95', 'opacity-0'), 10);
    };
    const closeModal = () => {
        modalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 300);
    };
    modal.querySelector('.cancelar-add-item').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="text"]');
        if (input.value.trim()) {
            successCallback(input.value.trim());
            closeModal();
        }
    });
    return openModal;
};

export const mostrarConfirmacao = (titulo, mensagem) => {
    confirmacaoTitulo.textContent = titulo;
    confirmacaoMensagem.textContent = mensagem;
    confirmacaoModal.classList.remove('hidden');
};

export const fecharConfirmacao = () => {
    confirmacaoModal.classList.add('hidden');
};

export const handleExclusao = (tipo, setItemParaExcluir, dataArrays) => {
    setItemParaExcluir({ tipo: tipo, valor: '' });
    
    const titulos = { 'categoria': 'Categoria', 'fornecedor': 'Fornecedor', 'carteira': 'Carteira' };

    deleteItemTitle.textContent = `Excluir ${titulos[tipo]}`;
    deleteItemLabel.textContent = `Selecione a ${titulos[tipo].toLowerCase()} para excluir:`;

    // CORREÇÃO: Lógica mais robusta para encontrar a chave plural correta.
    const pluralKey = tipo === 'fornecedor' ? 'fornecedores' : tipo + 's';
    popularDropdown(deleteItemSelect, dataArrays[pluralKey], 'Selecione uma opção...');

    deleteItemInfoSection.classList.add('hidden');
    deleteItemReplaceSection.classList.add('hidden');
    confirmarDeleteSimplesBtn.classList.add('hidden');
    confirmarDeleteReplaceBtn.classList.add('hidden');
    deleteItemSelect.value = '';

    deleteItemModal.classList.remove('hidden');
};

export const updateNotificationToggleState = (isSubscribed) => {
    if (notificationToggle) {
        notificationToggle.checked = isSubscribed;
    }
    if (notificationStatusText) {
        notificationStatusText.textContent = isSubscribed ? 'Notificações Habilitadas' : 'Habilitar Notificações';
    }
};
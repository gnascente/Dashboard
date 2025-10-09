// =================================================================
// app.js - ARQUIVO PRINCIPAL E CONTROLADOR DE EVENTOS
// =================================================================

import {
    lancamentos, categorias, carteiras, fornecedores,
    salvarDados, carregarDados, adicionarLancamento, atualizarLancamento, removerLancamento,
    agendarNotificacaoDeTeste, updateCategorias, updateCarteiras, updateFornecedores,
    updateLancamentos, adicionarItem, removerItem
} from './data.js';

import * as UI from './ui.js';

let fotosTemporarias = [];
let filtrosAtivos = { status: null, categorias: [], fornecedores: [], carteiras: [] };
let onConfirmAction = null;
let itemParaExcluir = { tipo: '', valor: '' };

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    const dataArrays = { categorias, carteiras, fornecedores };
    UI.atualizarTodosDropdownsEPopups(categorias, carteiras, fornecedores);
    UI.renderizarLancamentos(filtrosAtivos, categorias, fornecedores, carteiras);
    UI.applyTotalizerState();
    setupEventListeners();
    // --- [NOVO BLOCO UNIFICADO ONESIGNAL] ---
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(function(OneSignal) {
        OneSignal.init({
            appId: "9ba8834c-e59a-4dcd-bd78-435ff070e262", // SEU APP ID
            allowLocalhostAsSecureOrigin: true,
            promptOptions: {
                slidedown: {
                    enabled: true,
                    actionMessage: "Nós gostaríamos de enviar notificações com atualizações sobre sua obra.",
                    acceptButtonText: "Permitir",
                    cancelButtonText: "Agora não",
                }
            }
        });

        OneSignal.User.PushSubscription.addEventListener("change", function(isSubscribed) {
            if (isSubscribed) {
                console.log("Usuário inscrito para notificações.");
                salvarDados();
            }
        });
    });
    // Registra o Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('Service Worker registrado com sucesso:', registration.scope))
                .catch(error => console.log('Falha ao registrar o Service Worker:', error));
        });
    }
});

// --- CONFIGURAÇÃO DE EVENT LISTENERS ---
function setupEventListeners() {
    
    const fotosRef = { 
        set: (val) => { fotosTemporarias = val; }, 
        get: () => fotosTemporarias 
    };
    const dataArrays = { categorias, carteiras, fornecedores };

    // --- MODAL DE LANÇAMENTO (Formulário Principal) ---
    UI.abrirNovoLancamentoBtn.addEventListener('click', () => UI.abrirModalLancamento(null, fotosRef, dataArrays));
    [UI.fecharLancamentoModalBtn, UI.cancelarLancamentoBtn].forEach(btn => btn.addEventListener('click', UI.fecharModalLancamento));
    UI.lancamentoModal.addEventListener('click', (e) => { if (e.target === UI.lancamentoModal) UI.fecharModalLancamento(); });

    UI.lancamentoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(UI.lancamentoForm['lancamento-id'].value);
        const valorInput = UI.lancamentoForm['lancamento-valor'];
        if (!id && valorInput.value.trim() === '') {
            UI.mostrarNotificacao('O campo Valor é obrigatório para novos lançamentos.');
            valorInput.classList.add('border-red-500');
            return;
        }
        valorInput.classList.remove('border-red-500');
        
        const dados = {
            data: UI.lancamentoForm['lancamento-data'].value,
            valor: parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0,
            descricao: UI.lancamentoForm['lancamento-descricao'].value,
            categoria: UI.lancamentoForm['lancamento-categoria'].value,
            fornecedor: UI.lancamentoForm['lancamento-fornecedor'].value,
            carteira: UI.lancamentoForm['lancamento-carteira'].value,
            pago: UI.lancamentoForm['lancamento-pago'].checked,
            fotos: [...fotosTemporarias]
        };

        if (id) {
            atualizarLancamento(id, dados);
            UI.setUltimoLancamentoId(id); // CORREÇÃO ADICIONADA
        } else {
            const novoId = adicionarLancamento(dados);
            UI.setUltimoLancamentoId(novoId);
        }

        salvarDados();
        UI.renderizarLancamentos(filtrosAtivos, categorias, fornecedores, carteiras);
        UI.fecharModalLancamento();
        UI.mostrarNotificacao('Lançamento salvo com sucesso!', true);
    });
    
    // --- INTERAÇÕES NA LISTA ---
    UI.containerLista.addEventListener('click', (e) => {
        const btnEditar = e.target.closest('.btn-editar');
        const btnToggle = e.target.closest('.btn-toggle-pago');
        const btnGaleria = e.target.closest('.btn-galeria');

        if (btnEditar) UI.abrirModalLancamento(parseInt(btnEditar.dataset.id), fotosRef, dataArrays);
        if (btnToggle) {
            const lancamento = lancamentos.find(l => l.id === parseInt(btnToggle.dataset.id));
            if (lancamento) {
                lancamento.pago = !lancamento.pago;
                salvarDados();
                UI.renderizarLancamentos(filtrosAtivos, categorias, fornecedores, carteiras);
            }
        }
        if (btnGaleria) UI.abrirGaleria(parseInt(btnGaleria.dataset.id));
    });
    
    // --- NAVEGAÇÃO E MENUS ---
    document.getElementById('menu-teste-notificacao-btn').addEventListener('click', (e) => {
        e.preventDefault();
        agendarNotificacaoDeTeste(UI.mostrarNotificacao);
        UI.fecharMenu();
    });
    UI.lancamentosTabBtn.addEventListener('click', () => UI.alternarAbas('lancamentos'));
    UI.relatoriosTabBtn.addEventListener('click', () => UI.alternarAbas('relatorios'));
    UI.abrirMenuBtn.addEventListener('click', UI.abrirMenu);
    UI.menuLateralOverlay.addEventListener('click', UI.fecharMenu);
    UI.menuLancamentosBtn.addEventListener('click', (e) => {
        e.preventDefault();
        UI.mainContent.classList.remove('hidden');
        UI.backupContent.classList.add('hidden');
        UI.alternarAbas('lancamentos');
        UI.fecharMenu();
    });
    UI.menuBackupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        UI.mainContent.classList.add('hidden');
        UI.backupContent.classList.remove('hidden');
        UI.totalizerFooter.classList.add('hidden');
        UI.fecharMenu();
    });
    
    // --- FILTROS E PESQUISA ---
    UI.campoPesquisa.addEventListener('input', () => UI.renderizarLancamentos(filtrosAtivos, categorias, fornecedores, carteiras));
    UI.abrirFiltroBtn.addEventListener('click', () => UI.abrirFiltroPanel(filtrosAtivos));
    UI.fecharFiltroBtn.addEventListener('click', UI.fecharFiltroPanel);
    UI.filtroAvancadoOverlay.addEventListener('click', UI.fecharFiltroPanel);
    UI.aplicarFiltrosBtn.addEventListener('click', () => {
        UI.fecharFiltroPanel();
        UI.renderizarLancamentos(filtrosAtivos, categorias, fornecedores, carteiras);
    });
    UI.limparFiltrosBtn.addEventListener('click', () => {
        filtrosAtivos = { status: null, categorias: [], fornecedores: [], carteiras: [] };
        UI.atualizarPillsUI(filtrosAtivos);
        UI.renderizarLancamentos(filtrosAtivos, categorias, fornecedores, carteiras);
    });
    UI.filtroAvancadoPanel.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.group) {
            UI.handlePillClick(e.target, filtrosAtivos);
        }
    });

    // --- ANEXOS E GALERIA ---
    UI.btnGaleriaUpload.addEventListener('click', () => UI.galeriaInput.click());
    UI.btnCameraUpload.addEventListener('click', () => UI.cameraInput.click());
    document.getElementById('btn-arquivo-upload').addEventListener('click', () => UI.arquivoInput.click());
    
    UI.fotosThumbnailsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.btn-remover-foto')) {
            const index = parseInt(e.target.closest('.btn-remover-foto').dataset.index);
            fotosTemporarias.splice(index, 1);
            UI.renderizarThumbnails(fotosTemporarias);
        }
    });
    [UI.galeriaInput, UI.cameraInput, UI.arquivoInput].forEach(input => {
        input.addEventListener('change', (e) => UI.handleAnexos(e.target.files, fotosRef));
    });
    UI.galeriaContainer.addEventListener('click', (e) => { if (e.target.tagName === 'IMG') UI.abrirZoom(e.target.src); });
    UI.fecharGaleriaBtn.addEventListener('click', UI.fecharGaleria);
    UI.galeriaModal.addEventListener('click', (e) => { if (e.target === UI.galeriaModal) UI.fecharGaleria(); });
    UI.fecharZoomBtn.addEventListener('click', UI.fecharZoom);

    // --- BACKUP E RESTAURAÇÃO ---
    UI.exportarBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify({ lancamentos, categorias, carteiras, fornecedores }, null, 2);
        const url = URL.createObjectURL(new Blob([dataStr], {type: "application/json"}));
        const link = document.createElement('a');
        link.download = `backup_obra_${new Date().toISOString().slice(0, 10)}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        UI.mostrarNotificacao('Backup exportado com sucesso!', true);
        UI.vibrarDispositivo(200);
    });
    UI.importarBtn.addEventListener('click', () => UI.importarInput.click());
    UI.importarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.lancamentos && data.categorias && data.carteiras && data.fornecedores) {
                    updateLancamentos(data.lancamentos);
                    updateCategorias(data.categorias);
                    updateCarteiras(data.carteiras);
                    updateFornecedores(data.fornecedores);
                    salvarDados();
                    UI.atualizarTodosDropdownsEPopups(categorias, carteiras, fornecedores);
                    UI.renderizarLancamentos(filtrosAtivos, categorias, fornecedores, carteiras);
                    UI.mostrarNotificacao('Backup importado com sucesso!', true);
                    UI.vibrarDispositivo(200);
                } else { 
                    UI.mostrarNotificacao('Arquivo de backup inválido.'); 
                }
            } catch (error) { 
                console.error("Erro ao importar backup:", error);
                UI.mostrarNotificacao('Erro ao ler o arquivo de backup.'); 
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    // --- TOTALIZADOR/RODAPÉ ---
    UI.toggleBtn.addEventListener('click', () => {
        const isCollapsed = UI.totalizerFooter.dataset.collapsed === 'true';
        localStorage.setItem('totalizerCollapsed', !isCollapsed);
        UI.applyTotalizerState();
    });
    
    // --- MODAIS DE ADICIONAR/EXCLUIR ITENS ---
    const abrirAddCategoria = UI.setupAddModal(UI.addCategoriaModal, UI.addCategoriaForm, (nome) => {
        if(adicionarItem('categoria', nome)) {
            salvarDados();
            UI.atualizarTodosDropdownsEPopups(categorias, carteiras, fornecedores);
            UI.categoriaDropdown.value = nome;
            // CORREÇÃO: Atualiza o dropdown de substituição se o modal de exclusão estiver aberto
            const itemSendoExcluido = UI.deleteItemSelect.value;
            const novasOpcoes = categorias.filter(item => item !== itemSendoExcluido);
            UI.popularDropdown(UI.deleteItemReplaceSelect, novasOpcoes, 'Selecione um substituto...');
            UI.deleteItemReplaceSelect.value = nome;
        } else { UI.mostrarNotificacao('Esta categoria já existe!'); }
    });
    const abrirAddFornecedor = UI.setupAddModal(UI.addFornecedorModal, UI.addFornecedorForm, (nome) => {
        if(adicionarItem('fornecedor', nome)) {
            salvarDados();
            UI.atualizarTodosDropdownsEPopups(categorias, carteiras, fornecedores);
            UI.fornecedorDropdown.value = nome;
            const itemSendoExcluido = UI.deleteItemSelect.value;
            const novasOpcoes = fornecedores.filter(item => item !== itemSendoExcluido);
            UI.popularDropdown(UI.deleteItemReplaceSelect, novasOpcoes, 'Selecione um substituto...');
            UI.deleteItemReplaceSelect.value = nome;
        } else { UI.mostrarNotificacao('Este fornecedor já existe!'); }
    });
    const abrirAddCarteira = UI.setupAddModal(UI.addCarteiraModal, UI.addCarteiraForm, (nome) => {
        if(adicionarItem('carteira', nome)) {
            salvarDados();
            UI.atualizarTodosDropdownsEPopups(categorias, carteiras, fornecedores);
            UI.carteiraDropdown.value = nome;
            // CORREÇÃO: Atualiza o dropdown de substituição
            const itemSendoExcluido = UI.deleteItemSelect.value;
            const novasOpcoes = carteiras.filter(item => item !== itemSendoExcluido);
            UI.popularDropdown(UI.deleteItemReplaceSelect, novasOpcoes, 'Selecione um substituto...');
            UI.deleteItemReplaceSelect.value = nome;
        } else { UI.mostrarNotificacao('Esta carteira já existe!'); }
    });

    UI.lancamentoForm.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.btn-adicionar');
        const delBtn = e.target.closest('.btn-excluir');
        if (addBtn) {
            const tipo = addBtn.dataset.tipo;
            if (tipo === 'categoria') abrirAddCategoria();
            if (tipo === 'fornecedor') abrirAddFornecedor();
            if (tipo === 'carteira') abrirAddCarteira();
        }
        if (delBtn) UI.handleExclusao(delBtn.dataset.tipo, (params) => { itemParaExcluir = params; }, dataArrays);
    });

    // --- CONFIRMAÇÃO MODAL ---
    UI.cancelarConfirmacaoBtn.addEventListener('click', UI.fecharConfirmacao);
    UI.confirmarAcaoBtn.addEventListener('click', () => {
        if (typeof onConfirmAction === 'function') {
            onConfirmAction();
        }
        UI.fecharConfirmacao();
    });

    UI.excluirLancamentoBtn.addEventListener('click', () => {
        const id = parseInt(UI.lancamentoForm['lancamento-id'].value);
        if (!id) return;
        onConfirmAction = () => {
            removerLancamento(id);
            salvarDados();
            UI.fecharModalLancamento();
            UI.renderizarLancamentos(filtrosAtivos, categorias, fornecedores, carteiras);
            UI.mostrarNotificacao('Lançamento excluído!', true);
        };
        UI.mostrarConfirmacao('Excluir Lançamento', 'Tem certeza? Esta ação não pode ser desfeita.');
    });

    // --- LÓGICA DO ACORDEÃO DO FILTRO ---
    const accordionHeaders = document.querySelectorAll('#filtro-avancado-panel .accordion-header');
    
    if (accordionHeaders.length > 0) {
        const firstHeader = accordionHeaders[0];
        const firstContent = firstHeader.nextElementSibling;
        const firstIcon = firstHeader.querySelector('svg');
        if (firstContent && firstIcon) {
            firstContent.classList.remove('hidden');
            firstIcon.classList.add('rotate-180');
        }
    }

    accordionHeaders.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const icon = button.querySelector('svg');
            content.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
        });
    });
    
    // --- LÓGICA DO MODAL DE EXCLUSÃO DE ITEM ---
    
    // CORREÇÃO: Adiciona listener para o botão de adicionar substituto
    UI.deleteItemAddReplacementBtn.addEventListener('click', () => {
        const tipo = itemParaExcluir.tipo;
        if (tipo === 'categoria') abrirAddCategoria();
        if (tipo === 'fornecedor') abrirAddFornecedor();
        if (tipo === 'carteira') abrirAddCarteira();
    });

    UI.cancelarDeleteItemBtn.addEventListener('click', () => UI.deleteItemModal.classList.add('hidden'));

    UI.deleteItemSelect.addEventListener('change', () => {
        const itemSelecionado = UI.deleteItemSelect.value;
        const tipo = itemParaExcluir.tipo;
        
        itemParaExcluir.valor = itemSelecionado;

        if (!itemSelecionado) {
            UI.deleteItemInfoSection.classList.add('hidden');
            return;
        }

        const lancamentosUsandoItem = lancamentos.filter(l => l[tipo] === itemSelecionado);
        const dataArrayOriginal = { 'categoria': categorias, 'fornecedor': fornecedores, 'carteira': carteiras }[tipo];
        
        UI.deleteItemInfoSection.classList.remove('hidden');

        if (lancamentosUsandoItem.length === 0) {
            // Caso 1: Item não está em uso
            UI.deleteItemMessage.textContent = `Este item não está em uso em nenhum lançamento e pode ser excluído com segurança.`;
            UI.deleteItemMessage.className = 'text-sm text-green-700 mt-2 p-3 rounded-md bg-green-50 border border-green-200';
            UI.deleteItemReplaceSection.classList.add('hidden');
            UI.confirmarDeleteSimplesBtn.classList.remove('hidden');
            UI.confirmarDeleteReplaceBtn.classList.add('hidden');
        } else {
            // Caso 2: Item está em uso
            const count = lancamentosUsandoItem.length;
            UI.deleteItemMessage.innerHTML = `Este item está sendo usado em <strong>${count} lançamento${count > 1 ? 's' : ''}</strong>. Para excluí-lo, você deve escolher um item para substituí-lo.`;
            UI.deleteItemMessage.className = 'text-sm text-amber-800 mt-2 p-3 rounded-md bg-amber-50 border border-amber-200';
            
            const opcoesDeSubstituicao = dataArrayOriginal.filter(item => item !== itemSelecionado);
            UI.popularDropdown(UI.deleteItemReplaceSelect, opcoesDeSubstituicao, 'Selecione um substituto...');
            
            UI.deleteItemReplaceSection.classList.remove('hidden');
            UI.confirmarDeleteSimplesBtn.classList.add('hidden');
            UI.confirmarDeleteReplaceBtn.classList.remove('hidden');
        }
    });

    // Ação do botão de exclusão simples
    UI.confirmarDeleteSimplesBtn.addEventListener('click', () => {
        removerItem(itemParaExcluir.tipo, itemParaExcluir.valor);
        salvarDados();
        UI.atualizarTodosDropdownsEPopups(categorias, carteiras, fornecedores);
        UI.deleteItemModal.classList.add('hidden');
        UI.mostrarNotificacao('Item excluído com sucesso!', true);
    });

    // Ação do botão de substituir e excluir
    UI.confirmarDeleteReplaceBtn.addEventListener('click', () => {
        const substituto = UI.deleteItemReplaceSelect.value;
        if (!substituto) {
            UI.mostrarNotificacao('Por favor, selecione um item para substituir.');
            return;
        }

        removerItem(itemParaExcluir.tipo, itemParaExcluir.valor, substituto);
        salvarDados();
        UI.renderizarLancamentos(filtrosAtivos, categorias, fornecedores, carteiras);
        UI.atualizarTodosDropdownsEPopups(categorias, carteiras, fornecedores);
        UI.deleteItemModal.classList.add('hidden');
        UI.mostrarNotificacao('Item substituído e excluído com sucesso!', true);
    });
}


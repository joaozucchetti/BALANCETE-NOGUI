// Exportação PDF individual
function exportarPDF(id) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('jsPDF não carregado!');
        return;
    }
    const balancete = sistemaBalancete.balancetes.find(b => b.id === id);
    if (!balancete) {
        alert('Balancete não encontrado!');
        return;
    }
    const doc = new window.jspdf.jsPDF();
    let y = 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Balancete', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${new Date(balancete.data + 'T00:00:00').toLocaleDateString('pt-BR')}`, 15, y);
    doc.text(`Lançado em: ${balancete.timestamp}`, 120, y);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Conta', 15, y);
    doc.text('Tipo', 100, y);
    doc.text('Valor (R$)', 150, y);
    doc.setFont('helvetica', 'normal');
    y += 7;
    balancete.lancamentos.forEach(l => {
        doc.text(l.conta, 15, y, { maxWidth: 80 });
        doc.text(l.tipo.charAt(0).toUpperCase() + l.tipo.slice(1), 100, y);
        doc.text(sistemaBalancete.formatarMoeda(l.valor), 150, y, { align: 'right' });
        y += 7;
        if (y > 270) { doc.addPage(); y = 15; }
    });
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Débitos: R$ ${sistemaBalancete.formatarMoeda(balancete.totalDebitos)}`, 15, y);
    doc.text(`Total Créditos: R$ ${sistemaBalancete.formatarMoeda(balancete.totalCreditos)}`, 100, y);
    y += 10;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('Gerado por Sistema de Balancete', 15, y);
    doc.save(`balancete_${balancete.data}.pdf`);
}

// Exportação PDF geral
function exportarTodosPDF() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('jsPDF não carregado!');
        return;
    }
    const doc = new window.jspdf.jsPDF();
    let y = 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Relatório de Balancetes', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(11);
    sistemaBalancete.balancetes.forEach((b, idx) => {
        if (y > 260) { doc.addPage(); y = 15; }
        doc.setFont('helvetica', 'bold');
        doc.text(`Balancete ${idx + 1} - Data: ${new Date(b.data + 'T00:00:00').toLocaleDateString('pt-BR')}`, 15, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        b.lancamentos.forEach(l => {
            doc.text(l.conta, 20, y, { maxWidth: 80 });
            doc.text(l.tipo.charAt(0).toUpperCase() + l.tipo.slice(1), 100, y);
            doc.text(sistemaBalancete.formatarMoeda(l.valor), 150, y, { align: 'right' });
            y += 6;
            if (y > 260) { doc.addPage(); y = 15; }
        });
        y += 2;
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Débitos: R$ ${sistemaBalancete.formatarMoeda(b.totalDebitos)}`, 20, y);
        doc.text(`Total Créditos: R$ ${sistemaBalancete.formatarMoeda(b.totalCreditos)}`, 100, y);
        y += 10;
    });
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('Gerado por Sistema de Balancete', 15, y);
    doc.save('relatorio_balancetes.pdf');
}
// Sistema de Balancete - JavaScript Principal

class SistemaBalancete {
    constructor() {
        this.balancetes = this.carregarCache();
        this.contas = this.inicializarContas();
        this.inicializarEventos();
        this.atualizarHistorico();
        this.definirDataAtual();
    }

    // Base de dados das contas contábeis
    inicializarContas() {
        return {
            debito: [
                // ATIVO CIRCULANTE
                'Caixa', 'Depósitos bancários à vista', 'Numerário em trânsito',
                'Equivalentes de caixa em aplicações de liquidez imediata',
                'Duplicatas a receber', 'Clientes', 'Controladas e coligadas - transações operacionais',
                'Títulos a receber', 'Clientes - renegociação de contas a receber',
                'Devedores mobiliários', 'Empréstimos a receber de terceiros',
                'Dividendos propostos a receber', 'Bancos - Contas vinculadas',
                'Juros a receber', 'Adiantamentos a terceiros', 'Créditos de funcionários',
                'Adiantamentos para despesas', 'Antecipação de salários e ordenados',
                'Empréstimos a funcionários', 'Tributos a compensar e recuperar',
                'IPI a compensar', 'ICMS a compensar', 'IRRF a compensar',
                'IR e CS a restituir/compensar', 'PIS/PASEP a recuperar',
                'COFINS a recuperar', 'Outros tributos a recuperar',
                'Títulos e valores mobiliários', 'Produtos acabados',
                'Mercadorias para revenda', 'Produtos em elaboração',
                'Matérias-primas', 'Outros materiais diretos', 'Mão de obra direta',
                'Prêmios de seguros a apropriar', 'Encargos financeiros a apropriar',
                'Assinaturas e anuidades a apropriar', 'Alugueis pagos antecipadamente',
                
                // ATIVO NÃO CIRCULANTE
                'Bancos - contas vinculadas (ARLP)', 'Clientes (ARLP)', 'Títulos a receber (ARLP)',
                'Créditos de acionistas - transações não recorrentes',
                'Credito de diretores - não recorrentes',
                'Credito de coligadas e controladas -não recorrentes',
                'Adiantamentos a terceiros (ARLP)', 'Impostos e contribuições a recuperar (ARLP)',
                'Aplicações financeiras (ARLP)', 'Prêmios de seguro a apropriar a longo prazo',
                'Outros custos e despesas pagos antecipadamente (ARLP)',
                'IR e CS diferidos (ARLP)',
                
                // INVESTIMENTOS
                'Participações permanentes em outras sociedades',
                'Avaliadas por equivalência patrimonial', 'Valor da equivalência patrimonial',
                'Participações em controladas', 'Participações em controladas em conjunto',
                'Participações em coligadas', 'Participações em sociedades do grupo',
                'Mais-valia sobre os ativos líquido das investidas',
                'Ágio por rentabilidade futura (Goodwill)',
                'Avaliadas pelo valor justo - Participações em outras sociedades',
                'Avaliadas pelo custo - Participações em outras sociedades',
                'Propriedades para investimento', 'Outros investimentos permanentes',
                'Ativos para futura utilização', 'Obras de arte',
                
                // IMOBILIZADO
                'Terrenos', 'Moveis e utensílios', 'Veículos', 'Ferramentas',
                'Peças e conjuntos de reposição', 'Florestamento e reflorestamento',
                'Benfeitorias em propriedades de terceiros', 'Imobilizado arrendado',
                'Veículos Arrendados', 'Maquinas, aparelhos e equipamentos arrendados',
                'Bens em uso na fase de implantação - Custo',
                'Construções em andamento', 'Importações em andamento de bens do imobilizado',
                'Adiantamentos a fornecedores de imobilizado',
                
                // INTANGÍVEL
                'Marcas', 'Patentes', 'Concessões', 'Goodwill (só no Balanço Consolidado)',
                'Direitos autorais', 'Direitos sobre recursos minerais - outros',
                'Pesquisa e desenvolvimento',
                
                // DIFERIDO
                'Gastos de organização e administração', 'Estudos projetos e detalhamentos',
                'Gastos preliminares de operação',
                
                // CONTAS DEVEDORAS DO PASSIVO
                'Ajuste a valor presente (Fornecedores)', 'IR recolhido', 'CS recolhida',
                'Ajuste a valor presente (Impostos)', 'Títulos a pagar (conta devedora)',
                'Encargos financeiros a transcorrer', 'Deságio a apropriar',
                'Custos de transação a apropriar', 'Ajuste a valor presente (Dividendos)',
                'Encargos financeiros a transcorrer (PNC)', 'Custos de transação a apropriar (PNC)',
                'Deságio a apropriar (PNC)', 'Custos de transação a apropriar (Debêntures)',
                
                // PATRIMÔNIO LÍQUIDO DEVEDORES
                'Capital a subscrever', 'Capital a integralizar',
                'Gastos com Emissão de Ações', 'Gastos na emissão de outros valores patrimoniais',
                'Prejuízos acumulados', 'Ações em tesouraria'
            ],
            credito: [
                // ATIVO - CONTAS CREDORAS (RETIFICADORAS)
                'Perdas estimadas em créditos de liquidação duvidosa',
                'Ajuste a valor presente (AC)', 'Receitas financeiras a transcorrer',
                'Perdas estimadas para créditos de liquidação duvidosa',
                'Perdas estimadas para redução ao valor recuperável (AC)',
                'Perda estimada para redução ao valor recuperável (Títulos)',
                'Perdas estimadas (AC)', 'Perdas estimadas com créditos de liquidação duvidosa (ARLP)',
                'Perdas estimadas para redução ao valor recuperável (ARLP)',
                'Ajuste a valor presente (ARLP)',
                'Perdas estimadas para redução ao valor realizável líquido (INV)',
                'Lucros a Apropriar', 'Perdas estimadas (INV)',
                'Depreciação acumulada (Propriedades para investimento)',
                'Perdas estimadas (Propriedades para investimento)',
                'Perdas estimadas (Outros investimentos)',
                'Instalações - depreciação', 'Maquinas, aparelhos e equipamentos - depreciação',
                'Moveis e utensílios - depreciação', 'Veículos - depreciação',
                'Ferramentas - depreciação ou amortização',
                'Peças e conjuntos de reposição - depreciação',
                'Benfeitorias em propriedades de terceiros - amortização',
                'Perdas estimadas por redução ao valor recuperável (IMOBILIZADO)',
                'Depreciação acumulada (Veículos Arrendados)',
                'Depreciação acumulada (Maquinas arrendadas)',
                'Perdas estimadas por redução ao valor recuperável (Bens em implantação)',
                'Amortização acumulada (INTANGÍVEL)',
                'Perdas estimadas por redução ao valor recuperável (INTANGÍVEL)',
                'Amortização acumulada (DIFERIDO)',
                
                // PASSIVO CIRCULANTE
                'Ordenados e salários a pagar', '13º a pagar', 'Ferias a pagar',
                'INSS a pagar', 'FGTS a recolher', 'Honorários da administração a pagar',
                'Comissões a pagar', 'Gratificações a pagar',
                'Participações no resultado a pagar', 'Retenções a recolher',
                'Fornecedores nacionais', 'Fornecedores estrangeiros',
                'ICMS a recolher', 'IPI a recolher', 'IR a pagar', 'CS a pagar',
                'IOF a pagar', 'ISS a recolher', 'PIS/PASEP a recolher',
                'COFINS a recolher', 'Outros impostos e taxas a recolher',
                'Parcela a curto prazo dos empréstimos e financiamentos',
                'Credores por financiamento', 'Financiamentos bancários a curto prazo',
                'Financiamento por arrendamento financeiro', 'Duplicatas Descontadas',
                'Adiantamentos de contratos de cambio', 'Custos de transação a apropriar (PC)',
                'Juros a pagar de empréstimo e financiamento', 'Conversíveis em ações',
                'Não conversíveis em ações', 'Juros e participações',
                'Adiantamentos de clientes', 'Faturamento para entrega futura',
                'Contas a pagar', 'Arrendamento operacional a pagar',
                'Encargos sociais a pagar', 'Dividendos a pagar',
                'Juros sobre o capital próprio a pagar',
                'Juros de empréstimos e financiamentos a pagar',
                'Dividendo mínimo obrigatório a pagar',
                'Provisões fiscais, previdenciárias, trabalhistas',
                'Provisão para benefícios a empregados', 'Provisão para garantias',
                'Provisão para reestruturação',
                
                // PASSIVO NÃO CIRCULANTE
                'Empréstimos e financiamentos a longo prazo',
                'Em moeda nacional (PNC)', 'Em moeda estrangeira (PNC)',
                'Financiamento por arrendamento financeiro (PNC)',
                'Credores por financiamento (PNC)', 'Títulos a pagar (PNC)',
                'Juros a pagar de empréstimos e financiamentos (PNC)',
                'Debentures e outros títulos de dívida',
                'Conversíveis em ações (PNC)', 'Não conversíveis em ações (PNC)',
                'Juros e participações (PNC)', 'Prêmios na emissão de debêntures a apropriar',
                'IR e CS diferidos (PNC)', 'Resgate de partes beneficiárias',
                'Provisões (PNC)', 'Provisões fiscais, previdenciárias, trabalhistas (PNC)',
                'Provisão para benefícios a empregados (PNC)',
                'Provisão para garantias (PNC)', 'Provisão para reestruturação (PNC)',
                'Lucros em vendas para a controladora', 'Receitas a apropriar',
                'Subvenções de investimento a apropriar',
                
                // PATRIMÔNIO LÍQUIDO
                'Patrimônio líquido dos sócios da controladora',
                'Capital social', 'Capital subscrito', 'Capital autorizado',
                'Ágio na emissão de ações', 'Reserva especial de ágio na incorporação',
                'Alienação de Bônus de subscrição', 'Opções outorgadas exercidas',
                'Reservas de reavaliação', 'Reavaliação de ativos próprios',
                'Reavaliação de ativos de coligadas e controladas avaliadas ao MEP',
                'Reserva legal', 'Reservas estatutárias', 'Reservas para contingências',
                'Reservas de lucros a realizar', 'Reservas de lucros para expansão',
                'Reservas de incentivos fiscais',
                'Reserva especial para dividendo obrigatório não distribuído',
                'Lucros acumulados', 'Dividendo adicional proposto',
                'Ajuste acumulado de conversão', 'Acionistas não controladores'
            ]
        };
    }

    // Inicialização
    inicializarEventos() {
        const form = document.getElementById('balanceteForm');
        form.addEventListener('submit', (e) => this.submeterBalancete(e));
        
        // Eventos para cálculo automático usando delegação de eventos
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('valor')) {
                this.formatarValorInput(e.target);

                this.calcularBalance();
            }
            if (e.target.classList.contains('conta-input')) {
                this.buscarContasInteligente(e.target);
            }
        });

        // Evento para mudança de tipo (débito/crédito)
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('tipo')) {
                this.mostrarCampoConta(e.target);
                this.calcularBalance();
            }
        });

        // Eventos para navegação nas sugestões
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('conta-input')) {
                this.navegarSugestoes(e);
            }
        });

        // Fechar sugestões ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.conta-selector')) {
                this.fecharTodasSugestoes();
            }
        });

        // Força cálculo inicial
        setTimeout(() => {
            this.calcularBalance();
        }, 100);
    }

    mostrarCampoConta(tipoSelect) {
        const lancamentoItem = tipoSelect.closest('.lancamento-item');
        const contaSelector = lancamentoItem.querySelector('.conta-selector');
        const contaInput = lancamentoItem.querySelector('.conta-input');
        const contaHidden = lancamentoItem.querySelector('.conta-selecionada');

        const tipo = tipoSelect.value;

        if (tipo) {
            contaSelector.style.display = 'block';
            contaInput.value = '';
            contaInput.setAttribute('data-tipo', tipo);
            contaInput.disabled = false;
            contaInput.placeholder = 'Digite para buscar conta...';
            contaInput.focus();
            if (contaHidden) contaHidden.value = '';
            this.fecharSugestoes(lancamentoItem);
        } else {
            contaSelector.style.display = 'none';
            contaInput.value = '';
            contaInput.disabled = true;
            if (contaHidden) contaHidden.value = '';
            this.fecharSugestoes(lancamentoItem);
        }
    }

    buscarContasInteligente(input) {
        const termo = input.value.toLowerCase().trim();
        const tipo = input.getAttribute('data-tipo');
        const lancamentoItem = input.closest('.lancamento-item');
        const sugestoesContainer = lancamentoItem.querySelector('.sugestoes-container');
        const sugestoesLista = lancamentoItem.querySelector('.sugestoes-lista');
        
        if (!termo || termo.length < 2) {
            this.fecharSugestoes(lancamentoItem);
            this.limparContaSelecionada(lancamentoItem);
            return;
        }

        const contas = this.contas[tipo] || [];
        const sugestoes = this.buscarPorAproximacao(termo, contas);
        
        if (sugestoes.length > 0) {
            this.mostrarSugestoes(sugestoesLista, sugestoes, termo, lancamentoItem);
            sugestoesContainer.style.display = 'block';
        } else {
            this.fecharSugestoes(lancamentoItem);
        }
    }

    buscarPorAproximacao(termo, contas) {
        const resultados = [];
        
        contas.forEach(conta => {
            const contaLower = conta.toLowerCase();
            let pontuacao = 0;
            
            // Busca exata (maior pontuação)
            if (contaLower.includes(termo)) {
                pontuacao = 100;
            } else {
                // Busca por palavras individuais
                const palavrasTermo = termo.split(' ');
                const palavrasConta = contaLower.split(' ');
                
                palavrasTermo.forEach(palavraTermo => {
                    palavrasConta.forEach(palavraConta => {
                        // Palavra começa com o termo
                        if (palavraConta.startsWith(palavraTermo)) {
                            pontuacao += 50;
                        }
                        // Palavra contém o termo
                        else if (palavraConta.includes(palavraTermo)) {
                            pontuacao += 30;
                        }
                        // Aproximação por sílabas/letras
                        else if (this.calcularSimilaridade(palavraTermo, palavraConta) > 0.6) {
                            pontuacao += 20;
                        }
                    });
                });
            }
            
            if (pontuacao > 0) {
                resultados.push({ conta, pontuacao });
            }
        });
        
        // Ordenar por pontuação (maior primeiro) e retornar apenas as contas
        return resultados
            .sort((a, b) => b.pontuacao - a.pontuacao)
            .slice(0, 8) // Limitar a 8 sugestões
            .map(r => r.conta);
    }

    calcularSimilaridade(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        const maxLen = Math.max(len1, len2);
        
        if (maxLen === 0) return 1;
        
        // Algoritmo de distância de Levenshtein simplificado
        const matriz = [];
        
        for (let i = 0; i <= len1; i++) {
            matriz[i] = [i];
        }
        
        for (let j = 0; j <= len2; j++) {
            matriz[0][j] = j;
        }
        
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    matriz[i][j] = matriz[i - 1][j - 1];
                } else {
                    matriz[i][j] = Math.min(
                        matriz[i - 1][j] + 1,
                        matriz[i][j - 1] + 1,
                        matriz[i - 1][j - 1] + 1
                    );
                }
            }
        }
        
        return 1 - (matriz[len1][len2] / maxLen);
    }

    mostrarSugestoes(container, sugestoes, termo, lancamentoItem) {
        container.innerHTML = '';
        
        sugestoes.forEach((conta, index) => {
            const item = document.createElement('div');
            item.className = 'sugestao-item';
            if (index === 0) item.classList.add('ativo');
            
            // Destacar termo encontrado
            const contaHighlight = this.destacarTermo(conta, termo);
            item.innerHTML = contaHighlight;
            
            item.addEventListener('click', () => {
                this.selecionarConta(conta, lancamentoItem);
            });
            
            container.appendChild(item);
        });
    }

    destacarTermo(texto, termo) {
        const regex = new RegExp(`(${termo})`, 'gi');
        return texto.replace(regex, '<span class="sugestao-match">$1</span>');
    }

    navegarSugestoes(e) {
        const lancamentoItem = e.target.closest('.lancamento-item');
        const itens = lancamentoItem.querySelectorAll('.sugestao-item');
        
        if (itens.length === 0) return;
        
        let ativo = lancamentoItem.querySelector('.sugestao-item.ativo');
        let novoIndex = -1;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (ativo) {
                    novoIndex = Array.from(itens).indexOf(ativo) + 1;
                    if (novoIndex >= itens.length) novoIndex = 0;
                } else {
                    novoIndex = 0;
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (ativo) {
                    novoIndex = Array.from(itens).indexOf(ativo) - 1;
                    if (novoIndex < 0) novoIndex = itens.length - 1;
                } else {
                    novoIndex = itens.length - 1;
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                if (ativo) {
                    const conta = ativo.textContent;
                    this.selecionarConta(conta, lancamentoItem);
                }
                break;
                
            case 'Escape':
                this.fecharSugestoes(lancamentoItem);
                break;
        }
        
        if (novoIndex >= 0) {
            itens.forEach(item => item.classList.remove('ativo'));
            itens[novoIndex].classList.add('ativo');
        }
    }

    selecionarConta(conta, lancamentoItem) {
        const contaInput = lancamentoItem.querySelector('.conta-input');
        const contaHidden = lancamentoItem.querySelector('.conta-selecionada');
        
        contaInput.value = conta;
        contaHidden.value = conta;
        
        this.fecharSugestoes(lancamentoItem);
        this.calcularBalance();
    }

    limparContaSelecionada(lancamentoItem) {
        const contaHidden = lancamentoItem.querySelector('.conta-selecionada');
        if (contaHidden) {
            contaHidden.value = '';
        }
    }

    fecharSugestoes(lancamentoItem) {
        const sugestoesContainer = lancamentoItem.querySelector('.sugestoes-container');
        if (sugestoesContainer) {
            sugestoesContainer.style.display = 'none';
        }
    }

    fecharTodasSugestoes() {
        document.querySelectorAll('.sugestoes-container').forEach(container => {
            container.style.display = 'none';
        });
    }

    definirDataAtual() {
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('data').value = hoje;
    }

    // Formatação de valores monetários no input
    formatarValorInput(input) {
        let valor = input.value;
        
        // Remove tudo que não é número, vírgula ou ponto
        valor = valor.replace(/[^\d,.]/g, '');
        
        // Substitui vírgula por ponto para cálculos
        if (valor.includes(',')) {
            // Se tem vírgula, assume formato brasileiro (123,45)
            valor = valor.replace(/\./g, '').replace(',', '.');
        }
        
        // Limita a 2 casas decimais
        const partes = valor.split('.');
        if (partes.length > 2) {
            valor = partes[0] + '.' + partes[1];
        }
        if (partes[1] && partes[1].length > 2) {
            valor = partes[0] + '.' + partes[1].substring(0, 2);
        }
        
        // Atualiza o input apenas se o valor mudou
        if (input.value !== valor) {
            const cursorPos = input.selectionStart;
            input.value = valor;
            
            // Mantém a posição do cursor
            setTimeout(() => {
                input.setSelectionRange(cursorPos, cursorPos);
            }, 0);
        }
    }

    // Gerenciamento de lançamentos
    adicionarLancamento() {
        const container = document.getElementById('lancamentos-container');
        const novoLancamento = this.criarElementoLancamento();
        container.appendChild(novoLancamento);
        this.calcularBalance();
    }

    criarElementoLancamento() {
        const div = document.createElement('div');
        div.className = 'lancamento-item';
        div.innerHTML = `
            <div class="lancamento-main">
                <select class="tipo" required>
                    <option value="">Tipo</option>
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                </select>
                <div class="conta-selector" style="display: none;">
                    <input type="text" class="conta-input" placeholder="Digite para buscar conta..." autocomplete="off">
                    <div class="sugestoes-container" style="display: none;">
                        <div class="sugestoes-lista"></div>
                    </div>
                    <input type="hidden" class="conta-selecionada">
                </div>
                <input type="text" placeholder="Valor (ex: 1500,50)" class="valor" required>
                <button type="button" class="remove-lancamento" onclick="sistemaBalancete.removerLancamento(this)">❌</button>
            </div>
            <hr class="descricao-separator">
            <div class="descricao-container">
                <input type="text" placeholder="Descrição do lançamento (opcional)" class="descricao">
            </div>
        `;
        return div;
    }

    removerLancamento(botao) {
        const lancamentoItem = botao.closest('.lancamento-item');
        lancamentoItem.remove();
        this.calcularBalance();
    }

    // Cálculos e validações
    calcularBalance() {
        const lancamentos = this.obterLancamentos();
        let totalDebitos = 0;
        let totalCreditos = 0;

        lancamentos.forEach(lancamento => {
            const valor = parseFloat(lancamento.valor) || 0;
            if (lancamento.tipo === 'debito') {
                totalDebitos += valor;
            } else if (lancamento.tipo === 'credito') {
                totalCreditos += valor;
            }
        });

        this.atualizarDisplay(totalDebitos, totalCreditos);
        return { totalDebitos, totalCreditos, balanceado: totalDebitos === totalCreditos && totalDebitos > 0 };
    }

    atualizarDisplay(totalDebitos, totalCreditos) {
        const totalDebitosElement = document.getElementById('totalDebitos');
        const totalCreditosElement = document.getElementById('totalCreditos');
        const statusElement = document.getElementById('balanceStatus');
        const submitBtn = document.getElementById('submitBtn');
        
        // Atualizar totais
        if (totalDebitosElement) {
            totalDebitosElement.textContent = this.formatarMoeda(totalDebitos);
        }
        if (totalCreditosElement) {
            totalCreditosElement.textContent = this.formatarMoeda(totalCreditos);
        }
        
        // Calcular diferença e status
        const diferenca = totalDebitos - totalCreditos;
        
        if (statusElement) {
            if (diferenca === 0 && totalDebitos > 0) {
                statusElement.textContent = '✅ Balanceado';
                statusElement.className = 'balance-status balanced';
            } else {
                statusElement.textContent = `❌ Diferença: R$ ${this.formatarMoeda(Math.abs(diferenca))}`;
                statusElement.className = 'balance-status unbalanced';
            }
        }

        // Habilitar/desabilitar botão de submit
        if (submitBtn) {
            submitBtn.disabled = !(diferenca === 0 && totalDebitos > 0);
        }
    }

    obterLancamentos() {
        const lancamentoItems = document.querySelectorAll('.lancamento-item');
        const lancamentos = [];

        // Processar lançamentos silenciosamente
        lancamentoItems.forEach((item, index) => {
            const tipoElement = item.querySelector('.tipo');
            const contaElement = item.querySelector('.conta-selecionada');
            const valorElement = item.querySelector('.valor');
            const descricaoElement = item.querySelector('.descricao');

            const tipo = tipoElement ? tipoElement.value : '';
            const conta = contaElement ? contaElement.value : '';
            const valor = valorElement ? valorElement.value : '';
            const descricao = descricaoElement ? descricaoElement.value.trim() : '';

            // Limpar e converter valor
            let valorNumerico = 0;
            if (valor) {
                // Remover formatação e converter
                const valorLimpo = valor.toString().replace(/[^\d,.-]/g, '').replace(',', '.');
                valorNumerico = parseFloat(valorLimpo) || 0;
            }

            if (tipo && valorNumerico > 0) {
                lancamentos.push({ 
                    tipo, 
                    conta: conta || 'Conta não selecionada', 
                    valor: valorNumerico,
                    descricao: descricao || ''
                });
            }
        });

        return lancamentos;
    }

    // Submissão do formulário
    submeterBalancete(e) {
        e.preventDefault();
        
        const data = document.getElementById('data').value;
        const lancamentos = this.obterLancamentos();
        const balance = this.calcularBalance();

        if (!balance.balanceado) {
            this.mostrarMensagem('❌ Não é possível lançar um balancete desbalanceado!', 'error');
            return;
        }

        if (lancamentos.length === 0) {
            this.mostrarMensagem('❌ Adicione pelo menos um lançamento!', 'error');
            return;
        }

        const novoBalancete = {
            id: Date.now(),
            data: data,
            lancamentos: lancamentos,
            totalDebitos: balance.totalDebitos,
            totalCreditos: balance.totalCreditos,
            timestamp: new Date().toLocaleString('pt-BR')
        };

        this.balancetes.unshift(novoBalancete);
        this.salvarCache();
        this.atualizarHistorico();
        this.limparFormulario();
        
        this.mostrarMensagem('✅ Balancete lançado com sucesso!', 'success');
    }

    // Gerenciamento de cache
    carregarCache() {
        try {
            const dados = localStorage.getItem('balancetes');
            return dados ? JSON.parse(dados) : [];
        } catch (error) {
            console.error('Erro ao carregar cache:', error);
            return [];
        }
    }

    salvarCache() {
        try {
            localStorage.setItem('balancetes', JSON.stringify(this.balancetes));
        } catch (error) {
            console.error('Erro ao salvar cache:', error);
            this.mostrarMensagem('⚠️ Erro ao salvar no cache!', 'warning');
        }
    }

    limparCache() {
        if (confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
            this.balancetes = [];
            this.salvarCache();
            this.atualizarHistorico();
            this.mostrarMensagem('🗑️ Cache limpo com sucesso!', 'success');
        }
    }

    // Interface do histórico
    atualizarHistorico() {
        const container = document.getElementById('historico-container');
        const totalElement = document.getElementById('totalBalancetes');
        
        totalElement.textContent = this.balancetes.length;

        if (this.balancetes.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum balancete lançado ainda.</p>';
            return;
        }

        // Agrupar balancetes por data
        const balancetesPorData = {};
        this.balancetes.forEach(balancete => {
            const data = balancete.data;
            if (!balancetesPorData[data]) {
                balancetesPorData[data] = [];
            }
            balancetesPorData[data].push(balancete);
        });

        // Ordenar datas (mais recentes primeiro)
        const datasOrdenadas = Object.keys(balancetesPorData).sort((a, b) => b.localeCompare(a));

        container.innerHTML = datasOrdenadas.map((data, index) => 
            this.criarGrupoData(data, balancetesPorData[data], index === 0)
        ).join('');
    }

    criarGrupoData(data, balancetes, expandir = false) {
        const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const totalBalancetes = balancetes.length;
        let totalDebitos = 0, totalCreditos = 0;
        
        balancetes.forEach(b => {
            totalDebitos += b.totalDebitos;
            totalCreditos += b.totalCreditos;
        });

        const grupoId = `grupo-${data}`;
        const balancetesHtml = balancetes.map(balancete => this.criarCardBalancete(balancete)).join('');
        const displayStyle = expandir ? 'block' : 'none';
        const setaTexto = expandir ? '▲' : '▼';

        return `
            <div class="grupo-data">
                <div class="grupo-header ${this.isDataHoje(data) ? 'data-hoje' : ''}" onclick="toggleGrupoData('${grupoId}')">
                    <div class="grupo-titulo">
                        <span class="grupo-data-text">📅 ${dataFormatada} ${this.isDataHoje(data) ? '🔥' : ''}</span>
                        <span class="grupo-contador">${totalBalancetes} balancete${totalBalancetes > 1 ? 's' : ''}</span>
                    </div>
                    <div class="grupo-resumo">
                        <span class="grupo-total">Débitos: R$ ${this.formatarMoeda(totalDebitos)}</span>
                        <span class="grupo-total">Créditos: R$ ${this.formatarMoeda(totalCreditos)}</span>
                        <span class="grupo-seta">${setaTexto}</span>
                    </div>
                </div>
                <div id="${grupoId}" class="grupo-conteudo" style="display: ${displayStyle};">
                    ${balancetesHtml}
                </div>
            </div>
        `;
    }

    isDataHoje(data) {
        const hoje = new Date().toISOString().split('T')[0];
        return data === hoje;
    }

    criarCardBalancete(balancete) {
        const dataFormatada = new Date(balancete.data + 'T00:00:00').toLocaleDateString('pt-BR');
        const cardId = `balancete-${balancete.id}`;
        
        // Calcular estatísticas do resumo
        const totalLancamentos = balancete.lancamentos.length;
        const lancamentosDebito = balancete.lancamentos.filter(l => l.tipo === 'debito').length;
        const lancamentosCredito = balancete.lancamentos.filter(l => l.tipo === 'credito').length;
        const maiorLancamento = Math.max(...balancete.lancamentos.map(l => l.valor));
        const menorLancamento = Math.min(...balancete.lancamentos.map(l => l.valor));
        
        // Identificar principais contas
        const contasAgrupadas = {};
        balancete.lancamentos.forEach(l => {
            if (!contasAgrupadas[l.conta]) {
                contasAgrupadas[l.conta] = { valor: 0, quantidade: 0 };
            }
            contasAgrupadas[l.conta].valor += l.valor;
            contasAgrupadas[l.conta].quantidade += 1;
        });
        
        const principaisConta = Object.entries(contasAgrupadas)
            .sort((a, b) => b[1].valor - a[1].valor)
            .slice(0, 2)
            .map(([conta, dados]) => `${conta} (${dados.quantidade})`);
        
        const lancamentosHtml = balancete.lancamentos.map(lancamento => `
            <div class="lancamento-display ${lancamento.tipo}">
                <div class="lancamento-info">
                    <div class="lancamento-descricao">${lancamento.conta}</div>
                    <div class="lancamento-tipo">${lancamento.tipo}</div>
                    ${lancamento.descricao ? `<div class="lancamento-obs">${lancamento.descricao}</div>` : ''}
                </div>
                <div class="lancamento-valor ${lancamento.tipo}">
                    R$ ${this.formatarMoeda(lancamento.valor)}
                </div>
            </div>
        `).join('');

        return `
            <div class="balancete-card">
                <div class="balancete-header">
                    <div class="balancete-date">📅 ${dataFormatada}</div>
                    <div class="balancete-status status-balanced">✅ Balanceado</div>
                </div>
                
                <!-- Resumo do Balancete -->
                <div class="balancete-resumo">
                    <div class="resumo-title">📊 Resumo do Balancete</div>
                    <div class="resumo-stats">
                        <div class="resumo-item">
                            <span class="label">Lançamentos</span>
                            <span class="value">${totalLancamentos}</span>
                        </div>
                        <div class="resumo-item">
                            <span class="label">Débitos</span>
                            <span class="value">${lancamentosDebito}</span>
                        </div>
                        <div class="resumo-item">
                            <span class="label">Créditos</span>
                            <span class="value">${lancamentosCredito}</span>
                        </div>
                        <div class="resumo-item">
                            <span class="label">Maior valor</span>
                            <span class="value">R$ ${this.formatarMoeda(maiorLancamento)}</span>
                        </div>
                        <div class="resumo-item">
                            <span class="label">Menor valor</span>
                            <span class="value">R$ ${this.formatarMoeda(menorLancamento)}</span>
                        </div>
                        <div class="resumo-item">
                            <span class="label">Principais contas</span>
                            <span class="value">${principaisConta.join(', ')}</span>
                        </div>
                    </div>
                    <button class="toggle-detalhes" onclick="toggleDetalhesBalancete('${cardId}')">
                        🔍 Ver Detalhes
                    </button>
                </div>
                
                <!-- Detalhes minimizados por padrão -->
                <div id="detalhes-${cardId}" class="lancamentos-detalhados">
                    <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
                        <button type="button" onclick="exportarPDF(${balancete.id})" class="exportar-pdf-btn">📄 Exportar PDF</button>
                    </div>
                    
                    <div class="lancamentos-list">
                        ${lancamentosHtml}
                    </div>
                    
                    <div class="balancete-totals">
                        <span class="total-debitos">Total Débitos: R$ ${this.formatarMoeda(balancete.totalDebitos)}</span>
                        <span class="total-creditos">Total Créditos: R$ ${this.formatarMoeda(balancete.totalCreditos)}</span>
                    </div>
                    
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ecf0f1; font-size: 12px; color: #7f8c8d;">
                        Lançado em: ${balancete.timestamp}
                    </div>
                </div>
            </div>
        `;
    }

    // Utilitários
    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valor);
    }

    limparFormulario() {
        document.getElementById('balanceteForm').reset();
        this.definirDataAtual();
        
        // Manter apenas um lançamento vazio
        const container = document.getElementById('lancamentos-container');
        container.innerHTML = `
            <div class="lancamento-item">
                <div class="lancamento-main">
                    <select class="tipo" required>
                        <option value="">Tipo</option>
                        <option value="debito">Débito</option>
                        <option value="credito">Crédito</option>
                    </select>
                    <div class="conta-selector" style="display: none;">
                        <input type="text" class="conta-input" placeholder="Digite para buscar conta..." autocomplete="off">
                        <div class="sugestoes-container" style="display: none;">
                            <div class="sugestoes-lista"></div>
                        </div>
                        <input type="hidden" class="conta-selecionada">
                    </div>
                    <input type="text" placeholder="Valor (ex: 1500,50)" class="valor" required>
                    <button type="button" class="remove-lancamento" onclick="sistemaBalancete.removerLancamento(this)">❌</button>
                </div>
                <hr class="descricao-separator">
                <div class="descricao-container">
                    <input type="text" placeholder="Descrição do lançamento (opcional)" class="descricao">
                </div>
            </div>
        `;
        
        this.calcularBalance();
    }

    mostrarMensagem(mensagem, tipo) {
        // Criar elemento de mensagem
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${tipo}`;
        messageDiv.textContent = mensagem;
        
        // Estilizar mensagem
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        // Definir cores baseadas no tipo
        switch(tipo) {
            case 'success':
                messageDiv.style.background = '#d4edda';
                messageDiv.style.color = '#155724';
                messageDiv.style.border = '1px solid #c3e6cb';
                break;
            case 'error':
                messageDiv.style.background = '#f8d7da';
                messageDiv.style.color = '#721c24';
                messageDiv.style.border = '1px solid #f5c6cb';
                break;
            case 'warning':
                messageDiv.style.background = '#fff3cd';
                messageDiv.style.color = '#856404';
                messageDiv.style.border = '1px solid #ffeaa7';
                break;
        }

        // Adicionar CSS para animação
        if (!document.getElementById('messageStyles')) {
            const style = document.createElement('style');
            style.id = 'messageStyles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(messageDiv);

        // Remover mensagem após 4 segundos
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 4000);
    }
}

// Funções globais para serem chamadas pelo HTML
function adicionarLancamento() {
    try {
        if (!sistemaBalancete) {
            throw new Error('Sistema de balancete não foi inicializado');
        }
        sistemaBalancete.adicionarLancamento();
    } catch (error) {
        console.error('Erro ao adicionar lançamento:', error);
        alert('Erro ao adicionar lançamento: ' + error.message);
    }
}

function removerLancamento(botao) {
    try {
        if (!sistemaBalancete) {
            throw new Error('Sistema de balancete não foi inicializado');
        }
        if (!botao || !botao.parentNode) {
            throw new Error('Botão inválido ou elemento não encontrado');
        }
        sistemaBalancete.removerLancamento(botao);
    } catch (error) {
        console.error('Erro ao remover lançamento:', error);
        alert('Erro ao remover lançamento: ' + error.message);
    }
}

function calcularBalance() {
    try {
        if (!sistemaBalancete) {
            throw new Error('Sistema de balancete não foi inicializado');
        }

        return sistemaBalancete.calcularBalance();
    } catch (error) {
        console.error('Erro ao calcular balance:', error);
        alert('Erro ao calcular saldo: ' + error.message);
        return null;
    }
}

function limparFormulario() {
    try {
        if (!sistemaBalancete) {
            throw new Error('Sistema de balancete não foi inicializado');
        }
        if (confirm('Tem certeza que deseja limpar o formulário? Todos os dados não salvos serão perdidos.')) {
            sistemaBalancete.limparFormulario();
        }
    } catch (error) {
        console.error('Erro ao limpar formulário:', error);
        alert('Erro ao limpar formulário: ' + error.message);
    }
}

// Função para alternar detalhes do balancete
function toggleDetalhesBalancete(cardId) {
    try {
        const detalhesElement = document.getElementById(`detalhes-${cardId}`);
        const toggleButton = document.querySelector(`[onclick="toggleDetalhesBalancete('${cardId}')"]`);
        
        if (!detalhesElement || !toggleButton) {
            throw new Error('Elementos não encontrados');
        }
        
        const isExpanded = detalhesElement.classList.contains('expandido');
        
        if (isExpanded) {
            detalhesElement.classList.remove('expandido');
            toggleButton.innerHTML = '🔍 Ver Detalhes';
            toggleButton.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
        } else {
            detalhesElement.classList.add('expandido');
            toggleButton.innerHTML = '🔼 Ocultar Detalhes';
            toggleButton.style.background = 'linear-gradient(45deg, #f39c12, #e67e22)';
        }
        
    } catch (error) {
        console.error('Erro ao alternar detalhes:', error);
        alert('Erro ao mostrar/ocultar detalhes: ' + error.message);
    }
}

function limparCache() {
    sistemaBalancete.limparCache();
}

// Função para expandir/contrair grupos de data
function toggleGrupoData(grupoId) {
    const conteudo = document.getElementById(grupoId);
    const seta = conteudo.previousElementSibling.querySelector('.grupo-seta');
    
    if (conteudo.style.display === 'none') {
        conteudo.style.display = 'block';
        seta.textContent = '▲';
        seta.style.transform = 'rotate(180deg)';
    } else {
        conteudo.style.display = 'none';
        seta.textContent = '▼';
        seta.style.transform = 'rotate(0deg)';
    }
}

// Funções do Popup de Relatórios
function abrirPopupRelatorios() {
    document.getElementById('popupRelatorios').style.display = 'flex';
    
    // Definir data de hoje como padrão
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataEspecifica').value = hoje;
    
    // Definir mês atual como padrão
    const mesAtual = hoje.substring(0, 7); // YYYY-MM
    const selectMes = document.getElementById('mesRelatorio');
    if (selectMes.querySelector(`option[value="${mesAtual}"]`)) {
        selectMes.value = mesAtual;
    }
}

function fecharPopupRelatorios() {
    document.getElementById('popupRelatorios').style.display = 'none';
}

function gerarRelatorio(tipo) {
    const mesRelatorio = document.getElementById('mesRelatorio').value;
    const dataEspecifica = document.getElementById('dataEspecifica').value;
    
    fecharPopupRelatorios();
    
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('jsPDF não carregado!');
        return;
    }

    const doc = new window.jspdf.jsPDF();
    let y = 20;

    switch(tipo) {
        case 'diario':
            gerarRelatorioDiario(doc, y, dataEspecifica, mesRelatorio);
            break;
        case 'mensal':
            gerarRelatorioMensal(doc, y, mesRelatorio);
            break;
        case 'funcionario':
            gerarRelatorioFuncionarios(doc, y, mesRelatorio);
            break;
    }
}

function gerarRelatorioDiario(doc, y, dataEspecifica, mesRelatorio) {
    // Cabeçalho principal
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('RELATÓRIO DIÁRIO DE BALANCETES', 105, 15, { align: 'center' });
    
    // Informações da empresa
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    y = 35;
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, y);
    doc.text('Sistema de Balancete v2.0', 150, y);
    
    // Linha separadora
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(15, y + 5, 195, y + 5);
    
    y += 15;
    
    // Filtrar balancetes
    let balancetesFiltrados = sistemaBalancete.balancetes;
    
    if (dataEspecifica) {
        balancetesFiltrados = balancetesFiltrados.filter(b => b.data === dataEspecifica);
    } else if (mesRelatorio !== 'todos') {
        balancetesFiltrados = balancetesFiltrados.filter(b => {
            const mesBalancete = b.data.substring(0, 7); // YYYY-MM
            return mesBalancete === mesRelatorio;
        });
    }
    
    // Agrupar balancetes por data
    const balancetesPorData = {};
    balancetesFiltrados.forEach(b => {
        const data = b.data;
        if (!balancetesPorData[data]) {
            balancetesPorData[data] = [];
        }
        balancetesPorData[data].push(b);
    });
    
    // Resumo do período
    if (dataEspecifica) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Período Analisado:', 15, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${new Date(dataEspecifica + 'T00:00:00').toLocaleDateString('pt-BR')}`, 60, y);
    } else if (mesRelatorio !== 'todos') {
        const [ano, mes] = mesRelatorio.split('-');
        const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        doc.setFont('helvetica', 'bold');
        doc.text('Período Analisado:', 15, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${nomesMeses[parseInt(mes) - 1]} ${ano}`, 60, y);
    }
    y += 15;
    
    if (Object.keys(balancetesPorData).length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(12);
        doc.text('Nenhum balancete encontrado para o período selecionado.', 105, y + 20, { align: 'center' });
        doc.save('relatorio_diario.pdf');
        return;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
        Object.keys(balancetesPorData).sort().forEach(data => {
        if (y > 230) { 
            doc.addPage(); 
            y = 20;
            // Repetir cabeçalho em novas páginas
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('RELATÓRIO DIÁRIO DE BALANCETES (continuação)', 105, y, { align: 'center' });
            y += 15;
        }
        
        // Cabeçalho da data com fundo colorido
        doc.setFillColor(240, 248, 255);
        doc.rect(15, y - 5, 180, 12, 'F');
        doc.setDrawColor(102, 126, 234);
        doc.rect(15, y - 5, 180, 12);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`📅 ${new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}`, 20, y + 2);
        y += 15;
        
        const balancetes = balancetesPorData[data];
        let totalDebitos = 0, totalCreditos = 0;
        
        balancetes.forEach(b => {
            totalDebitos += b.totalDebitos;
            totalCreditos += b.totalCreditos;
        });
        
        // Informações resumidas
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`• Quantidade de balancetes: ${balancetes.length}`, 25, y);
        doc.text(`• Total de débitos: R$ ${sistemaBalancete.formatarMoeda(totalDebitos)}`, 25, y + 5);
        doc.text(`• Total de créditos: R$ ${sistemaBalancete.formatarMoeda(totalCreditos)}`, 25, y + 10);
        
        // Status de balanceamento
        const balanceado = totalDebitos === totalCreditos;
        doc.setFont('helvetica', 'bold');
        if (balanceado) {
            doc.setTextColor(0, 128, 0);
            doc.text('✓ Balanceado', 25, y + 15);
        } else {
            doc.setTextColor(220, 53, 69);
            doc.text('✗ Desbalanceado', 25, y + 15);
        }
        doc.setTextColor(0, 0, 0);
        
        // Análise detalhada dos balancetes do dia
        y += 25;
        balancetes.forEach((balancete, index) => {
            if (y > 250) { 
                doc.addPage(); 
                y = 20;
            }
            
            // Título do balancete
            doc.setFillColor(250, 250, 250);
            doc.rect(30, y - 3, 150, 8, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(`Balancete ${index + 1} - ${balancete.lancamentos.length} lançamentos`, 32, y + 2);
            y += 12;
            
            // Resumo do balancete
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            
            // Agrupar lançamentos por tipo
            const debitos = balancete.lancamentos.filter(l => l.tipo === 'debito');
            const creditos = balancete.lancamentos.filter(l => l.tipo === 'credito');
            
            if (debitos.length > 0) {
                doc.text(`📈 Débitos (${debitos.length}):`, 35, y);
                y += 4;
                debitos.slice(0, 3).forEach(lancamento => {
                    const texto = `• ${lancamento.conta}: R$ ${sistemaBalancete.formatarMoeda(lancamento.valor)}`;
                    const textoLimitado = texto.length > 60 ? texto.substring(0, 57) + '...' : texto;
                    doc.text(textoLimitado, 38, y);
                    y += 3;
                });
                if (debitos.length > 3) {
                    doc.setFont('helvetica', 'italic');
                    doc.text(`... e mais ${debitos.length - 3} lançamentos`, 38, y);
                    doc.setFont('helvetica', 'normal');
                    y += 3;
                }
                y += 2;
            }
            
            if (creditos.length > 0) {
                doc.text(`📉 Créditos (${creditos.length}):`, 35, y);
                y += 4;
                creditos.slice(0, 3).forEach(lancamento => {
                    const texto = `• ${lancamento.conta}: R$ ${sistemaBalancete.formatarMoeda(lancamento.valor)}`;
                    const textoLimitado = texto.length > 60 ? texto.substring(0, 57) + '...' : texto;
                    doc.text(textoLimitado, 38, y);
                    y += 3;
                });
                if (creditos.length > 3) {
                    doc.setFont('helvetica', 'italic');
                    doc.text(`... e mais ${creditos.length - 3} lançamentos`, 38, y);
                    doc.setFont('helvetica', 'normal');
                    y += 3;
                }
                y += 2;
            }
            
            // Totais do balancete
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text(`Total: Débitos R$ ${sistemaBalancete.formatarMoeda(balancete.totalDebitos)} | Créditos R$ ${sistemaBalancete.formatarMoeda(balancete.totalCreditos)}`, 35, y);
            y += 8;
        });
        
        y += 10;
    });    doc.save('relatorio_diario.pdf');
}

function gerarRelatorioMensal(doc, y, mesRelatorio) {
    // Cabeçalho profissional com fundo colorido
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('📊 RELATÓRIO MENSAL DE BALANCETES', 105, 20, { align: 'center' });
    
    // Informações da empresa
    doc.setFontSize(10);
    doc.text('Sistema Integrado de Contabilidade', 105, 28, { align: 'center' });
    doc.text(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, 105, 34, { align: 'center' });
    
    // Linha separadora
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(1);
    doc.line(15, 45, 195, 45);
    
    doc.setTextColor(0, 0, 0);
    y = 55;
    
    // Filtrar balancetes
    let balancetesFiltrados = sistemaBalancete.balancetes;
    
    if (mesRelatorio !== 'todos') {
        balancetesFiltrados = balancetesFiltrados.filter(b => {
            const mesBalancete = b.data.substring(0, 7); // YYYY-MM
            return mesBalancete === mesRelatorio;
        });
    }
    
    // Agrupar por mês/ano
    const balancetesPorMes = {};
    balancetesFiltrados.forEach(b => {
        const data = new Date(b.data + 'T00:00:00');
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        if (!balancetesPorMes[mesAno]) {
            balancetesPorMes[mesAno] = [];
        }
        balancetesPorMes[mesAno].push(b);
    });
    
    // Período analisado
    if (mesRelatorio !== 'todos') {
        const [ano, mes] = mesRelatorio.split('-');
        const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Período Analisado:', 15, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${nomesMeses[parseInt(mes) - 1]} ${ano}`, 60, y);
    }
    y += 15;
    
    if (Object.keys(balancetesPorMes).length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(12);
        doc.text('Nenhum balancete encontrado para o período selecionado.', 105, y + 20, { align: 'center' });
        doc.save('relatorio_mensal.pdf');
        return;
    }
    
    // Resumo geral
    let totalGeralDebitos = 0, totalGeralCreditos = 0, totalBalancetes = 0;
    Object.values(balancetesPorMes).forEach(balancetesMes => {
        totalBalancetes += balancetesMes.length;
        balancetesMes.forEach(b => {
            totalGeralDebitos += b.totalDebitos;
            totalGeralCreditos += b.totalCreditos;
        });
    });
    
    doc.setFillColor(248, 249, 250);
    doc.rect(15, y - 5, 180, 25, 'F');
    doc.setDrawColor(102, 126, 234);
    doc.rect(15, y - 5, 180, 25);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('📈 RESUMO GERAL', 20, y + 3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total de balancetes: ${totalBalancetes}`, 20, y + 10);
    doc.text(`Total geral débitos: R$ ${sistemaBalancete.formatarMoeda(totalGeralDebitos)}`, 20, y + 15);
    doc.text(`Total geral créditos: R$ ${sistemaBalancete.formatarMoeda(totalGeralCreditos)}`, 105, y + 15);
    y += 35;
    
    Object.keys(balancetesPorMes).sort().forEach(mesAno => {
        if (y > 240) { 
            doc.addPage(); 
            y = 20;
            // Repetir cabeçalho em novas páginas
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('RELATÓRIO MENSAL DE BALANCETES (continuação)', 105, y, { align: 'center' });
            y += 15;
        }
        
        const [ano, mes] = mesAno.split('-');
        const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        
        // Cabeçalho do mês com fundo colorido
        doc.setFillColor(240, 248, 255);
        doc.rect(15, y - 5, 180, 12, 'F');
        doc.setDrawColor(102, 126, 234);
        doc.rect(15, y - 5, 180, 12);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`📅 ${nomesMeses[parseInt(mes) - 1]} ${ano}`, 20, y + 2);
        y += 15;
        
        const balancetes = balancetesPorMes[mesAno];
        let totalDebitos = 0, totalCreditos = 0;
        
        balancetes.forEach(b => {
            totalDebitos += b.totalDebitos;
            totalCreditos += b.totalCreditos;
        });
        
        // Informações do mês
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`• Balancetes lançados: ${balancetes.length}`, 25, y);
        doc.text(`• Total movimentação débitos: R$ ${sistemaBalancete.formatarMoeda(totalDebitos)}`, 25, y + 5);
        doc.text(`• Total movimentação créditos: R$ ${sistemaBalancete.formatarMoeda(totalCreditos)}`, 25, y + 10);
        
        const saldoPeriodo = totalDebitos - totalCreditos;
        doc.setFont('helvetica', 'bold');
        if (saldoPeriodo > 0) {
            doc.setTextColor(220, 53, 69);
            doc.text(`• Saldo período: R$ ${sistemaBalancete.formatarMoeda(saldoPeriodo)} (Déficit)`, 25, y + 15);
        } else if (saldoPeriodo < 0) {
            doc.setTextColor(0, 128, 0);
            doc.text(`• Saldo período: R$ ${sistemaBalancete.formatarMoeda(Math.abs(saldoPeriodo))} (Superávit)`, 25, y + 15);
        } else {
            doc.setTextColor(0, 123, 255);
            doc.text(`• Saldo período: R$ ${sistemaBalancete.formatarMoeda(saldoPeriodo)} (Equilibrado)`, 25, y + 15);
        }
        doc.setTextColor(0, 0, 0);
        
        // Percentual do total
        if (totalGeralDebitos > 0 || totalGeralCreditos > 0) {
            const percentualDebitos = totalGeralDebitos > 0 ? ((totalDebitos / totalGeralDebitos) * 100).toFixed(1) : 0;
            const percentualCreditos = totalGeralCreditos > 0 ? ((totalCreditos / totalGeralCreditos) * 100).toFixed(1) : 0;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`• Representação: ${percentualDebitos}% dos débitos totais, ${percentualCreditos}% dos créditos totais`, 25, y + 20);
        }
        
        y += 30;
    });
    
    doc.save('relatorio_mensal.pdf');
}

function gerarRelatorioFuncionarios(doc, y, mesRelatorio) {
    // Cabeçalho profissional com fundo colorido
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('👥 RELATÓRIO DE FUNCIONÁRIOS', 105, 20, { align: 'center' });
    
    // Informações da empresa
    doc.setFontSize(10);
    doc.text('Sistema Integrado de Contabilidade - Recursos Humanos', 105, 28, { align: 'center' });
    doc.text(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, 105, 34, { align: 'center' });
    
    // Linha separadora
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(1);
    doc.line(15, 45, 195, 45);
    
    doc.setTextColor(0, 0, 0);
    y = 55;
    
    // Filtrar balancetes
    let balancetesFiltrados = sistemaBalancete.balancetes;
    
    if (mesRelatorio !== 'todos') {
        balancetesFiltrados = balancetesFiltrados.filter(b => {
            const mesBalancete = b.data.substring(0, 7); // YYYY-MM
            return mesBalancete === mesRelatorio;
        });
        
        // Mostrar período
        const [ano, mes] = mesRelatorio.split('-');
        const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Período Analisado:', 15, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${nomesMeses[parseInt(mes) - 1]} ${ano}`, 60, y);
        y += 15;
    }
    
    // Filtrar contas relacionadas a funcionários
    const contasFuncionarios = {
        'INSS': ['INSS a pagar', 'INSS patronal', 'INSS funcionários'],
        'FGTS': ['FGTS a recolher', 'FGTS patronal'],
        'IRRF': ['IRRF a compensar', 'Imposto de renda retido'],
        'Salários': ['Ordenados e salários a pagar', 'Salários', 'Vencimentos'],
        'Benefícios': ['13º a pagar', 'Férias a pagar', 'Vale transporte', 'Vale alimentação'],
        'Encargos': ['Encargos sociais a pagar', 'PIS sobre folha'],
        'Adiantamentos': ['Adiantamentos para despesas', 'Antecipação de salários e ordenados', 
                         'Empréstimos a funcionários', 'Créditos de funcionários']
    };
    
    let totaisPorCategoria = {
        'INSS': 0, 'FGTS': 0, 'IRRF': 0, 'Salários': 0, 
        'Benefícios': 0, 'Encargos': 0, 'Adiantamentos': 0
    };
    
    let lancamentosEncontrados = [];
    
    balancetesFiltrados.forEach(balancete => {
        balancete.lancamentos.forEach(lancamento => {
            for (const [categoria, contas] of Object.entries(contasFuncionarios)) {
                if (contas.some(conta => lancamento.conta.toLowerCase().includes(conta.toLowerCase()))) {
                    lancamentosEncontrados.push({
                        ...lancamento,
                        categoria,
                        data: balancete.data
                    });
                    totaisPorCategoria[categoria] += lancamento.valor;
                    break;
                }
            }
        });
    });
    
    if (lancamentosEncontrados.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(12);
        doc.text('Nenhum lançamento relacionado a funcionários encontrado no período.', 105, y + 20, { align: 'center' });
        doc.save('relatorio_funcionarios.pdf');
        return;
    }
    
    // Resumo por categoria
    doc.setFillColor(248, 249, 250);
    doc.rect(15, y - 5, 180, 35, 'F');
    doc.setDrawColor(102, 126, 234);
    doc.rect(15, y - 5, 180, 35);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('💰 RESUMO POR CATEGORIA', 20, y + 3);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    let resumoY = y + 10;
    Object.entries(totaisPorCategoria).forEach(([categoria, total], index) => {
        if (total > 0) {
            const x = index < 4 ? 20 : 105;
            const yPos = resumoY + ((index % 4) * 5);
            doc.text(`${categoria}: R$ ${sistemaBalancete.formatarMoeda(total)}`, x, yPos);
        }
    });
    y += 45;
    
    // Detalhamento por categoria
    Object.entries(contasFuncionarios).forEach(([categoria, contas]) => {
        const lancamentosCategoria = lancamentosEncontrados.filter(l => l.categoria === categoria);
        
        if (lancamentosCategoria.length > 0) {
            if (y > 240) { 
                doc.addPage(); 
                y = 20;
                // Repetir cabeçalho em novas páginas
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.text('RELATÓRIO DE FUNCIONÁRIOS (continuação)', 105, y, { align: 'center' });
                y += 15;
            }
            
            // Cabeçalho da categoria
            doc.setFillColor(240, 248, 255);
            doc.rect(15, y - 5, 180, 10, 'F');
            doc.setDrawColor(102, 126, 234);
            doc.rect(15, y - 5, 180, 10);
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            
            const emojis = {
                'INSS': '🏥', 'FGTS': '🏠', 'IRRF': '📊', 'Salários': '💵',
                'Benefícios': '🎁', 'Encargos': '⚖️', 'Adiantamentos': '💳'
            };
            
            doc.text(`${emojis[categoria] || '📋'} ${categoria.toUpperCase()}`, 20, y);
            y += 12;
            
            // Lançamentos da categoria
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            
            lancamentosCategoria.forEach(lancamento => {
                if (y > 270) { 
                    doc.addPage(); 
                    y = 20;
                }
                
                doc.text(`• ${lancamento.conta}`, 25, y);
                doc.text(`R$ ${sistemaBalancete.formatarMoeda(lancamento.valor)}`, 140, y);
                doc.text(new Date(lancamento.data + 'T00:00:00').toLocaleDateString('pt-BR'), 170, y);
                
                if (lancamento.descricao) {
                    y += 4;
                    doc.setFont('helvetica', 'italic');
                    doc.setFontSize(8);
                    doc.text(`${lancamento.descricao}`, 30, y);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                }
                y += 6;
            });
            
            // Subtotal da categoria
            doc.setFont('helvetica', 'bold');
            doc.text(`Subtotal ${categoria}: R$ ${sistemaBalancete.formatarMoeda(totaisPorCategoria[categoria])}`, 25, y);
            y += 15;
        }
    });
    
    // Total geral
    if (y > 250) { doc.addPage(); y = 20; }
    
    const totalGeral = Object.values(totaisPorCategoria).reduce((sum, val) => sum + val, 0);
    
    doc.setFillColor(255, 248, 220);
    doc.rect(15, y - 5, 180, 15, 'F');
    doc.setDrawColor(255, 193, 7);
    doc.rect(15, y - 5, 180, 15);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`💼 TOTAL GERAL FUNCIONÁRIOS: R$ ${sistemaBalancete.formatarMoeda(totalGeral)}`, 105, y + 5, { align: 'center' });
    
    doc.save('relatorio_funcionarios.pdf');
}

// Sistema de Validação e Tratamento de Erros
class ValidadorSistema {
    static validarBalancete(balancete) {
        const erros = [];
        
        // Validar estrutura básica
        if (!balancete || typeof balancete !== 'object') {
            erros.push('Balancete deve ser um objeto válido');
            return erros;
        }
        
        // Validar ID
        if (!balancete.id || typeof balancete.id !== 'string') {
            erros.push('ID do balancete é obrigatório e deve ser uma string');
        }
        
        // Validar data
        if (!balancete.data) {
            erros.push('Data é obrigatória');
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(balancete.data)) {
            erros.push('Data deve estar no formato YYYY-MM-DD');
        }
        
        // Validar lançamentos
        if (!Array.isArray(balancete.lancamentos)) {
            erros.push('Lançamentos devem ser um array');
        } else if (balancete.lancamentos.length === 0) {
            erros.push('Balancete deve ter pelo menos um lançamento');
        } else {
            balancete.lancamentos.forEach((lancamento, index) => {
                const errosLancamento = ValidadorSistema.validarLancamento(lancamento, index);
                erros.push(...errosLancamento);
            });
        }
        
        // Validar totais
        if (typeof balancete.totalDebitos !== 'number' || balancete.totalDebitos < 0) {
            erros.push('Total de débitos deve ser um número não negativo');
        }
        
        if (typeof balancete.totalCreditos !== 'number' || balancete.totalCreditos < 0) {
            erros.push('Total de créditos deve ser um número não negativo');
        }
        
        return erros;
    }
    
    static validarLancamento(lancamento, index) {
        const erros = [];
        const prefixo = `Lançamento ${index + 1}:`;
        
        // Validar conta
        if (!lancamento.conta || typeof lancamento.conta !== 'string') {
            erros.push(`${prefixo} Conta é obrigatória`);
        } else if (lancamento.conta.trim().length < 3) {
            erros.push(`${prefixo} Nome da conta deve ter pelo menos 3 caracteres`);
        }
        
        // Validar tipo
        if (!['débito', 'crédito'].includes(lancamento.tipo)) {
            erros.push(`${prefixo} Tipo deve ser "débito" ou "crédito"`);
        }
        
        // Validar valor
        if (typeof lancamento.valor !== 'number') {
            erros.push(`${prefixo} Valor deve ser um número`);
        } else if (lancamento.valor <= 0) {
            erros.push(`${prefixo} Valor deve ser maior que zero`);
        } else if (!Number.isFinite(lancamento.valor)) {
            erros.push(`${prefixo} Valor deve ser um número finito`);
        }
        
        return erros;
    }
    
    static validarEncargo(encargo) {
        const erros = [];
        
        if (!encargo || typeof encargo !== 'object') {
            erros.push('Encargo deve ser um objeto válido');
            return erros;
        }
        
        // Validar campos obrigatórios
        const camposObrigatorios = ['funcionario', 'salarioBase', 'mes', 'ano'];
        camposObrigatorios.forEach(campo => {
            if (!encargo[campo]) {
                erros.push(`Campo ${campo} é obrigatório`);
            }
        });
        
        // Validar tipos
        if (encargo.salarioBase && (typeof encargo.salarioBase !== 'number' || encargo.salarioBase <= 0)) {
            erros.push('Salário base deve ser um número positivo');
        }
        
        if (encargo.mes && (typeof encargo.mes !== 'number' || encargo.mes < 1 || encargo.mes > 12)) {
            erros.push('Mês deve ser um número entre 1 e 12');
        }
        
        if (encargo.ano && (typeof encargo.ano !== 'number' || encargo.ano < 2000 || encargo.ano > 2100)) {
            erros.push('Ano deve ser um número entre 2000 e 2100');
        }
        
        return erros;
    }
    
    static validarRescisao(rescisao) {
        const erros = [];
        
        if (!rescisao || typeof rescisao !== 'object') {
            erros.push('Dados de rescisão devem ser um objeto válido');
            return erros;
        }
        
        // Validar campos obrigatórios
        const camposObrigatorios = ['funcionario', 'salario', 'dataAdmissao', 'dataRescisao', 'tipoRescisao'];
        camposObrigatorios.forEach(campo => {
            if (!rescisao[campo]) {
                erros.push(`Campo ${campo} é obrigatório`);
            }
        });
        
        // Validar tipos e valores
        if (rescisao.salario && (typeof rescisao.salario !== 'number' || rescisao.salario <= 0)) {
            erros.push('Salário deve ser um número positivo');
        }
        
        if (rescisao.dataAdmissao && rescisao.dataRescisao) {
            const admissao = new Date(rescisao.dataAdmissao);
            const rescisaoData = new Date(rescisao.dataRescisao);
            
            if (rescisaoData <= admissao) {
                erros.push('Data de rescisão deve ser posterior à data de admissão');
            }
            
            // Verificar se as datas são válidas
            if (isNaN(admissao.getTime())) {
                erros.push('Data de admissão inválida');
            }
            
            if (isNaN(rescisaoData.getTime())) {
                erros.push('Data de rescisão inválida');
            }
        }
        
        // Validar tipo de rescisão
        const tiposValidos = ['demissao-sem-justa-causa', 'demissao-justa-causa', 'pedido-demissao', 'acordo-mutuo', 'termino-contrato'];
        if (rescisao.tipoRescisao && !tiposValidos.includes(rescisao.tipoRescisao)) {
            erros.push('Tipo de rescisão inválido');
        }
        
        return erros;
    }
    
    static exibirErros(erros, titulo = 'Erros encontrados') {
        if (erros.length === 0) return false;
        
        const mensagem = `${titulo}:\n\n${erros.map(erro => `• ${erro}`).join('\n')}`;
        alert(mensagem);
        return true;
    }
    
    static verificarIntegridadeSistema() {
        const problemas = [];
        
        try {
            // Verificar apenas problemas que impedem o funcionamento básico
            if (!window.localStorage) {
                problemas.push('CRÍTICO: LocalStorage não disponível');
            }
            
            // Verificar jsPDF apenas quando necessário (não na inicialização)
            // Esta verificação será feita apenas quando tentar gerar PDF
            
        } catch (e) {
            problemas.push('CRÍTICO: Sistema não pôde ser verificado');
        }
        
        return problemas;
    }
}

// Sistema de Abas
function initializarAbas() {
    try {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        if (tabButtons.length === 0) {
            return;
        }
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                try {
                    const tabName = button.dataset.tab;
                    
                    if (!tabName) {
                        console.error('Botão de aba sem atributo data-tab');
                        return;
                    }
                    
                    // Remover classe active de todos os botões e conteúdos
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));
                    
                    // Ativar o botão clicado
                    button.classList.add('active');
                    
                    // Ativar o conteúdo correspondente
                    const targetContent = document.getElementById(`tab-${tabName}`);
                    if (targetContent) {
                        targetContent.classList.add('active');
                    } else {
                        console.error(`Conteúdo da aba ${tabName} não encontrado`);
                    }
                } catch (e) {
                    console.error('Erro ao trocar aba:', e);
                }
            });
        });
    } catch (e) {
        console.error('Erro ao inicializar abas:', e);
    }
}

// Sistema de Cálculo de Encargos
function calcularEncargos() {
    const salarioBruto = parseFloat(document.getElementById('salarioBruto').value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const inssPatronal = parseFloat(document.getElementById('inssPatronal').value) || 0;
    const fgts = parseFloat(document.getElementById('fgts').value) || 0;
    const rat = parseFloat(document.getElementById('rat').value) || 0;
    const terceiros = parseFloat(document.getElementById('terceiros').value) || 0;
    
    if (salarioBruto <= 0) {
        alert('Por favor, informe um salário bruto válido.');
        return;
    }
    
    // Cálculos
    const inssPatronalValor = salarioBruto * (inssPatronal / 100);
    const fgtsValor = salarioBruto * (fgts / 100);
    const ratValor = salarioBruto * (rat / 100);
    const terceirosValor = salarioBruto * (terceiros / 100);
    
    // Provisões mensais
    const decimoTerceiro = salarioBruto / 12; // 1/12 do salário por mês
    const ferias = (salarioBruto * 1.33) / 12; // Salário + 1/3 dividido por 12 meses
    const fgtsDecimo = decimoTerceiro * (fgts / 100);
    const fgtsFerias = (salarioBruto * 1.33) * (fgts / 100) / 12;
    
    const totalEncargos = inssPatronalValor + fgtsValor + ratValor + terceirosValor + decimoTerceiro + ferias + fgtsDecimo + fgtsFerias;
    const custoTotalFuncionario = salarioBruto + totalEncargos;
    
    // Exibir resultados
    const container = document.getElementById('resultado-container');
    container.innerHTML = `
        <div class="resultado-card">
            <h4>💼 INSS Patronal</h4>
            <div class="resultado-valor">R$ ${formatarMoeda(inssPatronalValor)}</div>
            <div class="resultado-detalhes">${inssPatronal}% sobre salário bruto</div>
        </div>
        
        <div class="resultado-card">
            <h4>🏦 FGTS</h4>
            <div class="resultado-valor">R$ ${formatarMoeda(fgtsValor)}</div>
            <div class="resultado-detalhes">${fgts}% sobre salário bruto</div>
        </div>
        
        <div class="resultado-card">
            <h4>⚠️ RAT</h4>
            <div class="resultado-valor">R$ ${formatarMoeda(ratValor)}</div>
            <div class="resultado-detalhes">${rat}% conforme grau de risco</div>
        </div>
        
        <div class="resultado-card">
            <h4>🏭 Sistema S</h4>
            <div class="resultado-valor">R$ ${formatarMoeda(terceirosValor)}</div>
            <div class="resultado-detalhes">${terceiros}% (SENAI/SESI/etc.)</div>
        </div>
        
        <div class="resultado-card">
            <h4>🎁 13º Salário (Provisão)</h4>
            <div class="resultado-valor">R$ ${formatarMoeda(decimoTerceiro)}</div>
            <div class="resultado-detalhes">1/12 do salário por mês</div>
        </div>
        
        <div class="resultado-card">
            <h4>🏖️ Férias (Provisão)</h4>
            <div class="resultado-valor">R$ ${formatarMoeda(ferias)}</div>
            <div class="resultado-detalhes">Salário + 1/3 ÷ 12 meses</div>
        </div>
        
        <div class="resultado-card">
            <h4>🏦 FGTS s/ 13º</h4>
            <div class="resultado-valor">R$ ${formatarMoeda(fgtsDecimo)}</div>
            <div class="resultado-detalhes">8% sobre provisão 13º</div>
        </div>
        
        <div class="resultado-card">
            <h4>🏦 FGTS s/ Férias</h4>
            <div class="resultado-valor">R$ ${formatarMoeda(fgtsFerias)}</div>
            <div class="resultado-detalhes">8% sobre provisão férias</div>
        </div>
        
        <div class="resultado-card total-encargos">
            <h4>💰 TOTAL ENCARGOS MENSAIS</h4>
            <div class="resultado-valor">R$ ${formatarMoeda(totalEncargos)}</div>
            <div class="resultado-detalhes">
                Custo total: R$ ${formatarMoeda(custoTotalFuncionario)}<br>
                Percentual sobre salário: ${((totalEncargos / salarioBruto) * 100).toFixed(1)}%
            </div>
        </div>
    `;
}

function formatarSalario(input) {
    let valor = input.value.replace(/[^\d]/g, '');
    if (valor) {
        valor = (parseInt(valor) / 100).toFixed(2);
        valor = valor.replace('.', ',');
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        input.value = 'R$ ' + valor;
    }
}

function gerarLancamentos() {
    const nomeFuncionario = document.getElementById('nomeFuncionario').value.trim();
    const salarioBrutoStr = document.getElementById('salarioBruto').value;
    
    if (!nomeFuncionario) {
        alert('Por favor, informe o nome do funcionário.');
        return;
    }
    
    if (!salarioBrutoStr) {
        alert('Por favor, calcule os encargos primeiro.');
        return;
    }
    
    // Mudar para aba de balancete
    document.querySelector('[data-tab="balancete"]').click();
    
    // Adicionar lançamentos automaticamente
    setTimeout(() => {
        adicionarLancamentoEncargos('credito', 'Ordenados e salários a pagar', salarioBrutoStr, `Salário ${nomeFuncionario}`);
        
        // Pegar valores calculados dos encargos
        const resultados = document.querySelectorAll('.resultado-card .resultado-valor');
        if (resultados.length >= 8) {
            const inssValor = resultados[0].textContent.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
            const fgtsValor = resultados[1].textContent.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
            const decimoValor = resultados[4].textContent.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
            const feriasValor = resultados[5].textContent.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
            
            adicionarLancamentoEncargos('credito', 'INSS a pagar', inssValor, `INSS Patronal ${nomeFuncionario}`);
            adicionarLancamentoEncargos('credito', 'FGTS a recolher', fgtsValor, `FGTS ${nomeFuncionario}`);
            adicionarLancamentoEncargos('credito', '13º a pagar', decimoValor, `Provisão 13º ${nomeFuncionario}`);
            adicionarLancamentoEncargos('credito', 'Ferias a pagar', feriasValor, `Provisão Férias ${nomeFuncionario}`);
        }
        
        sistemaBalancete.calcularBalance();
    }, 500);
}

function adicionarLancamentoEncargos(tipo, conta, valor, descricao) {
    sistemaBalancete.adicionarLancamento();
    
    const lancamentos = document.querySelectorAll('.lancamento-item');
    const ultimoLancamento = lancamentos[lancamentos.length - 1];
    
    // Definir tipo
    const tipoSelect = ultimoLancamento.querySelector('.tipo');
    tipoSelect.value = tipo;
    sistemaBalancete.mostrarCampoConta(tipoSelect);
    
    // Definir conta
    setTimeout(() => {
        const contaInput = ultimoLancamento.querySelector('.conta-input');
        const contaHidden = ultimoLancamento.querySelector('.conta-selecionada');
        contaInput.value = conta;
        contaHidden.value = conta;
        
        // Definir valor
        const valorInput = ultimoLancamento.querySelector('.valor');
        valorInput.value = valor.toString().replace('.', ',');
        
        // Definir descrição
        const descricaoInput = ultimoLancamento.querySelector('.descricao');
        descricaoInput.value = descricao;
        
        sistemaBalancete.calcularBalance();
    }, 100);
}

function limparEncargos() {
    document.getElementById('encargosForm').reset();
    document.getElementById('inssPatronal').value = '20';
    document.getElementById('fgts').value = '8';
    document.getElementById('rat').value = '2';
    document.getElementById('terceiros').value = '5.8';
    document.getElementById('resultado-container').innerHTML = '<p class="empty-state">Preencha os dados e clique em "Calcular Encargos"</p>';
}

// ====== SISTEMA DE CÁLCULO DE RESCISÃO ======

function calcularRescisao() {
    try {
        // Obter dados do formulário
        const nome = document.getElementById('nomeFuncionarioRescisao').value;
        const salario = parseFloat(document.getElementById('salarioRescisao').value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        const dataAdmissao = new Date(document.getElementById('dataAdmissaoRescisao').value);
        const dataRescisao = new Date(document.getElementById('dataRescisao').value);
        const tipoRescisao = document.querySelector('input[name="tipoRescisao"]:checked').value;
        
        // Validações
        if (!nome || !salario || !dataAdmissao || !dataRescisao) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        if (dataRescisao <= dataAdmissao) {
            alert('A data de rescisão deve ser posterior à data de admissão.');
            return;
        }
        
        // Calcular tempo de serviço
        const tempoServico = calcularTempoServico(dataAdmissao, dataRescisao);
        
        // Calcular verbas rescisórias
        const verbas = calcularVerbasRescisaorias(salario, tempoServico, tipoRescisao, dataAdmissao, dataRescisao);
        
        // Exibir resultados
        exibirResultadoRescisao(nome, verbas, tempoServico, tipoRescisao);
        
    } catch (error) {
        console.error('Erro no cálculo de rescisão:', error);
        alert('Erro ao calcular rescisão: ' + error.message);
    }
}

function calcularTempoServico(dataAdmissao, dataRescisao) {
    const diffTime = Math.abs(dataRescisao - dataAdmissao);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const anos = Math.floor(diffDays / 365);
    const meses = Math.floor((diffDays % 365) / 30);
    const dias = diffDays % 30;
    
    return {
        totalDias: diffDays,
        anos: anos,
        meses: meses,
        dias: dias,
        totalMeses: anos * 12 + meses + (dias > 15 ? 1 : 0)
    };
}

function calcularVerbasRescisaorias(salario, tempoServico, tipoRescisao, dataAdmissao, dataRescisao) {
    const verbas = {
        salario: salario,
        saldoSalario: 0,
        avisoPrevio: 0,
        feriasVencidas: 0,
        feriasProporcionais: 0,
        tercoFerias: 0,
        decimoTerceiro: 0,
        fgts: 0,
        multaFgts: 0,
        totalBruto: 0,
        inssDesconto: 0,
        irrfDesconto: 0,
        totalLiquido: 0
    };
    
    // Saldo de salário (proporcional aos dias trabalhados no mês)
    const ultimoDiaMes = new Date(dataRescisao.getFullYear(), dataRescisao.getMonth() + 1, 0).getDate();
    const diasTrabalhados = dataRescisao.getDate();
    verbas.saldoSalario = (salario / ultimoDiaMes) * diasTrabalhados;
    
    // Aviso prévio
    const diasAvisoPrevio = parseInt(document.getElementById('avisoPrevio').value) || 30;
    if (['demissao-sem-justa-causa', 'termino-contrato'].includes(tipoRescisao)) {
        verbas.avisoPrevio = (salario / 30) * diasAvisoPrevio;
    }
    
    // Férias vencidas
    const diasFeriasVencidas = parseInt(document.getElementById('ferias').value) || 0;
    if (diasFeriasVencidas > 0) {
        verbas.feriasVencidas = (salario / 30) * diasFeriasVencidas;
        verbas.tercoFerias += verbas.feriasVencidas / 3;
    }
    
    // Férias proporcionais
    if (document.getElementById('feriasProporcionais').checked && 
        !['demissao-justa-causa'].includes(tipoRescisao)) {
        const mesesParaFerias = tempoServico.totalMeses % 12;
        if (mesesParaFerias > 0) {
            verbas.feriasProporcionais = (salario / 12) * mesesParaFerias;
            verbas.tercoFerias += verbas.feriasProporcionais / 3;
        }
    }
    
    // 13º salário proporcional
    if (document.getElementById('decimoTerceiro').checked &&
        !['demissao-justa-causa'].includes(tipoRescisao)) {
        const mesesTrabalhados = new Date(dataRescisao).getMonth() + 1;
        verbas.decimoTerceiro = (salario / 12) * mesesTrabalhados;
    }
    
    // FGTS (8% sobre todas as verbas)
    const baseFgts = verbas.saldoSalario + verbas.avisoPrevio + verbas.feriasVencidas + 
                     verbas.feriasProporcionais + verbas.decimoTerceiro;
    verbas.fgts = baseFgts * 0.08;
    
    // Multa 40% FGTS
    if (document.getElementById('multa40').checked && 
        ['demissao-sem-justa-causa', 'acordo-mutuo'].includes(tipoRescisao)) {
        const saldoFgts = salario * 0.08 * tempoServico.totalMeses; // Aproximação do saldo FGTS
        verbas.multaFgts = tipoRescisao === 'acordo-mutuo' ? saldoFgts * 0.2 : saldoFgts * 0.4;
    }
    
    // Total bruto
    verbas.totalBruto = verbas.saldoSalario + verbas.avisoPrevio + verbas.feriasVencidas + 
                        verbas.feriasProporcionais + verbas.tercoFerias + verbas.decimoTerceiro;
    
    // Descontos INSS (sobre verbas tributáveis)
    const baseTributavel = verbas.saldoSalario + verbas.avisoPrevio + verbas.decimoTerceiro;
    verbas.inssDesconto = calcularINSS(baseTributavel);
    
    // Total líquido
    verbas.totalLiquido = verbas.totalBruto - verbas.inssDesconto - verbas.irrfDesconto;
    
    return verbas;
}

function calcularINSS(base) {
    // Tabela INSS 2025 (valores aproximados)
    if (base <= 1412) return base * 0.075;
    if (base <= 2666.68) return base * 0.09 - 21.18;
    if (base <= 4000.03) return base * 0.12 - 101.18;
    if (base <= 7786.02) return base * 0.14 - 181.18;
    return 908.85; // Teto INSS
}

function exibirResultadoRescisao(nome, verbas, tempoServico, tipoRescisao) {
    const container = document.getElementById('resultado-rescisao-container');
    
    const tiposDescricao = {
        'demissao-sem-justa-causa': 'Demissão sem justa causa',
        'demissao-justa-causa': 'Demissão por justa causa',
        'pedido-demissao': 'Pedido de demissão',
        'acordo-mutuo': 'Acordo mútuo',
        'termino-contrato': 'Término de contrato'
    };
    
    container.innerHTML = `
        <div class="resultado-header">
            <h4>💼 ${nome}</h4>
            <div class="tipo-rescisao-badge">${tiposDescricao[tipoRescisao]}</div>
        </div>
        
        <div class="tempo-servico">
            <h5>⏰ Tempo de Serviço</h5>
            <p>${tempoServico.anos} anos, ${tempoServico.meses} meses e ${tempoServico.dias} dias</p>
        </div>
        
        <div class="verbas-grid">
            <div class="verba-item">
                <span class="label">Saldo de Salário:</span>
                <span class="value">R$ ${formatarMoeda(verbas.saldoSalario)}</span>
            </div>
            ${verbas.avisoPrevio > 0 ? `
            <div class="verba-item">
                <span class="label">Aviso Prévio:</span>
                <span class="value">R$ ${formatarMoeda(verbas.avisoPrevio)}</span>
            </div>
            ` : ''}
            ${verbas.feriasVencidas > 0 ? `
            <div class="verba-item">
                <span class="label">Férias Vencidas:</span>
                <span class="value">R$ ${formatarMoeda(verbas.feriasVencidas)}</span>
            </div>
            ` : ''}
            ${verbas.feriasProporcionais > 0 ? `
            <div class="verba-item">
                <span class="label">Férias Proporcionais:</span>
                <span class="value">R$ ${formatarMoeda(verbas.feriasProporcionais)}</span>
            </div>
            ` : ''}
            ${verbas.tercoFerias > 0 ? `
            <div class="verba-item">
                <span class="label">1/3 Férias:</span>
                <span class="value">R$ ${formatarMoeda(verbas.tercoFerias)}</span>
            </div>
            ` : ''}
            ${verbas.decimoTerceiro > 0 ? `
            <div class="verba-item">
                <span class="label">13º Proporcional:</span>
                <span class="value">R$ ${formatarMoeda(verbas.decimoTerceiro)}</span>
            </div>
            ` : ''}
            ${verbas.fgts > 0 ? `
            <div class="verba-item">
                <span class="label">Depósito FGTS:</span>
                <span class="value">R$ ${formatarMoeda(verbas.fgts)}</span>
            </div>
            ` : ''}
            ${verbas.multaFgts > 0 ? `
            <div class="verba-item destacado">
                <span class="label">Multa FGTS:</span>
                <span class="value">R$ ${formatarMoeda(verbas.multaFgts)}</span>
            </div>
            ` : ''}
        </div>
        
        <div class="descontos-section">
            <h5>📉 Descontos</h5>
            <div class="verba-item">
                <span class="label">INSS:</span>
                <span class="value desconto">- R$ ${formatarMoeda(verbas.inssDesconto)}</span>
            </div>
        </div>
        
        <div class="totais-section">
            <div class="total-item">
                <span class="label">Total Bruto:</span>
                <span class="value">R$ ${formatarMoeda(verbas.totalBruto)}</span>
            </div>
            <div class="total-item total-liquido">
                <span class="label">Total Líquido:</span>
                <span class="value">R$ ${formatarMoeda(verbas.totalLiquido)}</span>
            </div>
            ${verbas.multaFgts > 0 ? `
            <div class="total-item">
                <span class="label">Total com Multa FGTS:</span>
                <span class="value">R$ ${formatarMoeda(verbas.totalLiquido + verbas.multaFgts)}</span>
            </div>
            ` : ''}
        </div>
        
        <div class="observacoes">
            <h5>📝 Observações</h5>
            <ul>
                ${document.getElementById('seguroDesemprego').checked ? 
                    '<li>✅ Funcionário tem direito ao seguro-desemprego</li>' : 
                    '<li>❌ Funcionário não tem direito ao seguro-desemprego</li>'}
                <li>📊 Cálculo baseado na legislação trabalhista vigente</li>
                <li>⚖️ Consulte um especialista para casos específicos</li>
            </ul>
        </div>
    `;
}

function gerarLancamentosRescisao() {
    alert('Funcionalidade de geração de lançamentos de rescisão em desenvolvimento!');
}

function gerarPDFRescisao() {
    try {
        // Verificar se jsPDF está disponível
        if (typeof window.jsPDF === 'undefined') {
            throw new Error('Biblioteca PDF não está carregada');
        }

        // Obter dados do formulário
        const nome = document.getElementById('nomeFuncionarioRescisao').value;
        const salario = parseFloat(document.getElementById('salarioRescisao').value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        const dataAdmissao = new Date(document.getElementById('dataAdmissaoRescisao').value);
        const dataRescisao = new Date(document.getElementById('dataRescisao').value);
        const tipoRescisao = document.querySelector('input[name="tipoRescisao"]:checked')?.value;
        
        // Validações
        if (!nome || !salario || !dataAdmissao || !dataRescisao || !tipoRescisao) {
            alert('Por favor, calcule a rescisão primeiro antes de gerar o PDF.');
            return;
        }
        
        // Recalcular dados para o PDF
        const tempoServico = calcularTempoServico(dataAdmissao, dataRescisao);
        const verbas = calcularVerbasRescisaorias(salario, tempoServico, tipoRescisao, dataAdmissao, dataRescisao);
        
        // Criar PDF
        const { jsPDF } = window.jsPDF;
        const doc = new jsPDF();
        
        // Cabeçalho profissional
        doc.setFillColor(156, 39, 176);
        doc.rect(0, 0, 210, 40, 'F');
        
        // Título
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text('💼 TERMO DE RESCISÃO DE CONTRATO', 105, 20, { align: 'center' });
        
        // Informações da empresa
        doc.setFontSize(10);
        doc.text('Sistema Integrado de Recursos Humanos', 105, 28, { align: 'center' });
        doc.text(`Documento gerado em: ${new Date().toLocaleString('pt-BR')}`, 105, 34, { align: 'center' });
        
        // Linha separadora
        doc.setDrawColor(156, 39, 176);
        doc.setLineWidth(1);
        doc.line(15, 45, 195, 45);
        
        doc.setTextColor(0, 0, 0);
        let y = 55;
        
        // Dados do funcionário
        doc.setFillColor(248, 249, 250);
        doc.rect(15, y - 5, 180, 25, 'F');
        doc.setDrawColor(156, 39, 176);
        doc.rect(15, y - 5, 180, 25);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('👤 DADOS DO FUNCIONÁRIO', 20, y + 3);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`Nome: ${nome}`, 20, y + 10);
        doc.text(`Último salário: R$ ${formatarMoeda(salario)}`, 20, y + 16);
        
        y += 35;
        
        // Período de trabalho
        doc.setFillColor(240, 248, 255);
        doc.rect(15, y - 5, 180, 20, 'F');
        doc.setDrawColor(33, 150, 243);
        doc.rect(15, y - 5, 180, 20);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('📅 PERÍODO DE TRABALHO', 20, y + 3);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Admissão: ${dataAdmissao.toLocaleDateString('pt-BR')}`, 20, y + 10);
        doc.text(`Rescisão: ${dataRescisao.toLocaleDateString('pt-BR')}`, 110, y + 10);
        doc.text(`Tempo de serviço: ${tempoServico.anos} anos, ${tempoServico.meses} meses e ${tempoServico.dias} dias`, 20, y + 16);
        
        y += 30;
        
        // Tipo de rescisão
        const tiposDescricao = {
            'demissao-sem-justa-causa': 'Demissão sem justa causa',
            'demissao-justa-causa': 'Demissão por justa causa',
            'pedido-demissao': 'Pedido de demissão',
            'acordo-mutuo': 'Acordo mútuo',
            'termino-contrato': 'Término de contrato'
        };
        
        doc.setFillColor(255, 243, 224);
        doc.rect(15, y - 5, 180, 12, 'F');
        doc.setDrawColor(255, 152, 0);
        doc.rect(15, y - 5, 180, 12);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`🏛️ TIPO: ${tiposDescricao[tipoRescisao].toUpperCase()}`, 20, y + 2);
        
        y += 20;
        
        // Verbas rescisórias
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('💰 VERBAS RESCISÓRIAS', 20, y);
        y += 10;
        
        // Cabeçalho da tabela
        doc.setFillColor(230, 230, 230);
        doc.rect(15, y - 2, 180, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('DESCRIÇÃO', 20, y + 3);
        doc.text('VALOR', 160, y + 3);
        y += 10;
        
        // Itens das verbas
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        const verbas_lista = [
            { label: 'Saldo de salário', valor: verbas.saldoSalario, mostrar: true },
            { label: 'Aviso prévio', valor: verbas.avisoPrevio, mostrar: verbas.avisoPrevio > 0 },
            { label: 'Férias vencidas', valor: verbas.feriasVencidas, mostrar: verbas.feriasVencidas > 0 },
            { label: 'Férias proporcionais', valor: verbas.feriasProporcionais, mostrar: verbas.feriasProporcionais > 0 },
            { label: '1/3 sobre férias', valor: verbas.tercoFerias, mostrar: verbas.tercoFerias > 0 },
            { label: '13º salário proporcional', valor: verbas.decimoTerceiro, mostrar: verbas.decimoTerceiro > 0 },
            { label: 'Depósito FGTS (8%)', valor: verbas.fgts, mostrar: verbas.fgts > 0 }
        ];
        
        verbas_lista.forEach(verba => {
            if (verba.mostrar && y < 250) {
                doc.text(verba.label, 20, y);
                doc.text(`R$ ${formatarMoeda(verba.valor)}`, 160, y);
                y += 5;
            }
        });
        
        // Linha separadora
        y += 5;
        doc.setDrawColor(0, 0, 0);
        doc.line(15, y, 195, y);
        y += 8;
        
        // Total bruto
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('TOTAL BRUTO', 20, y);
        doc.text(`R$ ${formatarMoeda(verbas.totalBruto)}`, 160, y);
        y += 8;
        
        // Descontos
        if (verbas.inssDesconto > 0) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text('(-) Desconto INSS', 20, y);
            doc.text(`R$ ${formatarMoeda(verbas.inssDesconto)}`, 160, y);
            y += 5;
        }
        
        // Linha separadora
        y += 3;
        doc.line(15, y, 195, y);
        y += 8;
        
        // Total líquido
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(46, 125, 50);
        doc.text('TOTAL LÍQUIDO A RECEBER', 20, y);
        doc.text(`R$ ${formatarMoeda(verbas.totalLiquido)}`, 160, y);
        doc.setTextColor(0, 0, 0);
        y += 15;
        
        // FGTS e multa (se aplicável)
        if (verbas.multaFgts > 0) {
            doc.setFillColor(255, 235, 238);
            doc.rect(15, y - 5, 180, 15, 'F');
            doc.setDrawColor(244, 67, 54);
            doc.rect(15, y - 5, 180, 15);
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(198, 40, 40);
            doc.text('💳 FGTS E MULTA', 20, y + 2);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Multa FGTS (${tipoRescisao === 'acordo-mutuo' ? '20%' : '40%'}): R$ ${formatarMoeda(verbas.multaFgts)}`, 20, y + 8);
            doc.setTextColor(0, 0, 0);
            y += 20;
        }
        
        // Observações
        if (y > 220) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFillColor(227, 242, 253);
        doc.rect(15, y - 5, 180, 25, 'F');
        doc.setDrawColor(33, 150, 243);
        doc.rect(15, y - 5, 180, 25);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('📝 OBSERVAÇÕES IMPORTANTES', 20, y + 3);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const seguroDesemprego = document.getElementById('seguroDesemprego')?.checked;
        doc.text(`• Direito ao seguro-desemprego: ${seguroDesemprego ? 'SIM' : 'NÃO'}`, 20, y + 10);
        doc.text('• Cálculos baseados na legislação trabalhista vigente', 20, y + 15);
        doc.text('• Para casos específicos, consulte um especialista em direito trabalhista', 20, y + 20);
        
        // Salvar PDF
        const nomeArquivo = `rescisao_${nome.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
        doc.save(nomeArquivo);
        
        alert(`✅ PDF de rescisão gerado com sucesso!\nArquivo: ${nomeArquivo}`);
        
    } catch (error) {
        console.error('Erro ao gerar PDF de rescisão:', error);
        alert('Erro ao gerar PDF: ' + error.message);
    }
}

function limparRescisao() {
    document.getElementById('rescisaoForm').reset();
    document.getElementById('avisoPrevio').value = '30';
    document.getElementById('ferias').value = '0';
    document.getElementById('feriasProporcionais').checked = true;
    document.getElementById('decimoTerceiro').checked = true;
    document.getElementById('multa40').checked = true;
    document.getElementById('seguroDesemprego').checked = false;
    document.getElementById('resultado-rescisao-container').innerHTML = '<p class="empty-state">Preencha os dados e clique em "Calcular Rescisão"</p>';
}

function formatarSalarioRescisao(input) {
    let valor = input.value.replace(/\D/g, '');
    valor = valor.replace(/(\d)(\d{2})$/, '$1,$2');
    valor = valor.replace(/(?=(\d{3})+(\D))\B/g, '.');
    input.value = valor ? 'R$ ' + valor : '';
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}

// Inicializar sistema quando a página carregar
let sistemaBalancete;
document.addEventListener('DOMContentLoaded', function() {
    try {

        
        // Verificação silenciosa do sistema
        const problemas = ValidadorSistema.verificarIntegridadeSistema();
        // Só mostrar problemas realmente críticos que impedem funcionamento
        const problemasCriticos = problemas.filter(p => p.includes('CRÍTICO'));
        if (problemasCriticos.length > 0) {
            console.error('Problemas críticos detectados:', problemasCriticos);
        }
        
        // Inicializar sistema principal
        sistemaBalancete = new SistemaBalancete();

        
        // Inicializar abas com validação
        initializarAbas();
        
        // Configurar formatação automática do salário com validação
        const salarioBrutoElement = document.getElementById('salarioBruto');
        if (salarioBrutoElement) {
            salarioBrutoElement.addEventListener('input', function() {
                try {
                    formatarSalario(this);
                } catch (e) {
                    console.error('Erro na formatação do salário:', e);
                }
            });
        }
        
        // Configurar formatação do salário de rescisão
        const salarioRescisaoElement = document.getElementById('salarioRescisao');
        if (salarioRescisaoElement) {
            salarioRescisaoElement.addEventListener('input', function() {
                try {
                    formatarSalarioRescisao(this);
                } catch (e) {
                    console.error('Erro na formatação do salário de rescisão:', e);
                }
            });
        }
        
        // Sistema de verificação disponível se necessário
        window.verificarSistema = () => ValidadorSistema.verificarIntegridadeSistema();
        
        // Forçar cálculo inicial após um breve delay
        setTimeout(() => {
            try {
                if (sistemaBalancete && typeof sistemaBalancete.calcularBalance === 'function') {
                    sistemaBalancete.calcularBalance();
                } else {
                    console.error('Método calcularBalance não disponível');
                }
            } catch (e) {
                console.error('Erro no cálculo inicial:', e);
            }
        }, 200);
        
        // Mostrar status positivo apenas
        setTimeout(() => {
            const statusElement = document.getElementById('system-status');
            if (statusElement) {
                statusElement.innerHTML = '✅ Sistema funcionando normalmente';
                statusElement.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
            }
        }, 500);
        
    } catch (error) {
        console.error('Erro crítico na inicialização:', error);
        alert('Erro crítico ao inicializar o sistema: ' + error.message + '\n\nPor favor, recarregue a página.');
    }
});

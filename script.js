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
                console.log('Valor alterado:', e.target.value);
                this.calcularBalance();
            }
            if (e.target.classList.contains('conta-input')) {
                this.buscarContasInteligente(e.target);
            }
        });

        // Evento para mudança de tipo (débito/crédito)
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('tipo')) {
                console.log('Tipo alterado:', e.target.value);
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
        
        const tipo = tipoSelect.value;
        
        if (tipo) {
            contaSelector.style.display = 'block';
            contaInput.focus();
            contaInput.value = '';
            contaInput.setAttribute('data-tipo', tipo);
            this.limparContaSelecionada(lancamentoItem);
        } else {
            contaSelector.style.display = 'none';
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
            <input type="number" placeholder="Valor" class="valor" step="0.01" min="0" required>
            <button type="button" class="remove-lancamento" onclick="sistemaBalancete.removerLancamento(this)">❌</button>
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

        console.log('Calculando balanço para:', lancamentos);

        lancamentos.forEach(lancamento => {
            const valor = parseFloat(lancamento.valor) || 0;
            if (lancamento.tipo === 'debito') {
                totalDebitos += valor;
            } else if (lancamento.tipo === 'credito') {
                totalCreditos += valor;
            }
        });

        console.log('Totais calculados - Débitos:', totalDebitos, 'Créditos:', totalCreditos);

        this.atualizarDisplay(totalDebitos, totalCreditos);
        return { totalDebitos, totalCreditos, balanceado: totalDebitos === totalCreditos && totalDebitos > 0 };
    }

    atualizarDisplay(totalDebitos, totalCreditos) {
        const totalDebitosElement = document.getElementById('totalDebitos');
        const totalCreditosElement = document.getElementById('totalCreditos');
        const statusElement = document.getElementById('balanceStatus');
        const submitBtn = document.getElementById('submitBtn');

        console.log('Atualizando display - Débitos:', totalDebitos, 'Créditos:', totalCreditos);
        
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

        console.log('Display atualizado - Status:', diferenca === 0 && totalDebitos > 0 ? 'Balanceado' : 'Desbalanceado');
    }

    obterLancamentos() {
        const lancamentoItems = document.querySelectorAll('.lancamento-item');
        const lancamentos = [];

        console.log('Verificando', lancamentoItems.length, 'lançamentos');

        lancamentoItems.forEach((item, index) => {
            const tipoElement = item.querySelector('.tipo');
            const contaElement = item.querySelector('.conta-selecionada');
            const valorElement = item.querySelector('.valor');

            const tipo = tipoElement ? tipoElement.value : '';
            const conta = contaElement ? contaElement.value : '';
            const valor = valorElement ? valorElement.value : '';

            console.log(`Lançamento ${index + 1}:`, { tipo, conta, valor });

            if (tipo && valor && parseFloat(valor) > 0) {
                lancamentos.push({ 
                    tipo, 
                    conta: conta || 'Conta não selecionada', 
                    valor: parseFloat(valor) 
                });
            }
        });

        console.log('Lançamentos válidos encontrados:', lancamentos);
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

        container.innerHTML = this.balancetes.map(balancete => 
            this.criarCardBalancete(balancete)
        ).join('');
    }

    criarCardBalancete(balancete) {
        const dataFormatada = new Date(balancete.data + 'T00:00:00').toLocaleDateString('pt-BR');
        
        const lancamentosHtml = balancete.lancamentos.map(lancamento => `
            <div class="lancamento-display ${lancamento.tipo}">
                <div class="lancamento-info">
                    <div class="lancamento-descricao">${lancamento.conta}</div>
                    <div class="lancamento-tipo">${lancamento.tipo}</div>
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
                <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
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
                <input type="number" placeholder="Valor" class="valor" step="0.01" min="0" required>
                <button type="button" class="remove-lancamento" onclick="sistemaBalancete.removerLancamento(this)">❌</button>
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
    sistemaBalancete.adicionarLancamento();
}

function removerLancamento(botao) {
    sistemaBalancete.removerLancamento(botao);
}

function calcularBalance() {
    if (sistemaBalancete) {
        console.log('Forçando recálculo do balanço...');
        sistemaBalancete.calcularBalance();
    } else {
        console.error('Sistema não inicializado');
    }
}

function limparFormulario() {
    sistemaBalancete.limparFormulario();
}

function limparCache() {
    sistemaBalancete.limparCache();
}

// Inicializar sistema quando a página carregar
let sistemaBalancete;
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando Sistema de Balancete...');
    sistemaBalancete = new SistemaBalancete();
    console.log('✅ Sistema de Balancete inicializado com sucesso!');
    
    // Forçar cálculo inicial após um breve delay
    setTimeout(() => {
        console.log('Executando cálculo inicial...');
        sistemaBalancete.calcularBalance();
    }, 200);
});

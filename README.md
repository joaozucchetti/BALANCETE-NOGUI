# 📊 Sistema de Balancete

Um sistema web completo para lançamento e validação de balancetes contábeis, desenvolvido com HTML, CSS e JavaScript puro.

## 🎯 Funcionalidades Principais

### ✅ Validação de Equilíbrio
- **Regra fundamental**: Débitos devem ser iguais aos Créditos
- **Exemplo prático**: 
  - ❌ Lançamento R$ 500 + Deduções R$ 550 = **NÃO BALANCEADO** (diferença de R$ 50)
  - ✅ Lançamento R$ 500 + Deduções R$ 500 = **BALANCEADO** (pode ser lançado)

### 💾 Armazenamento em Cache
- Todos os balancetes ficam armazenados no **localStorage** do navegador
- Histórico completo com informações detalhadas
- Persistência entre sessões do navegador

### 🖥️ Interface Intuitiva
- Design moderno e responsivo
- Cálculo automático em tempo real
- Feedback visual imediato sobre o status do balancete
- Mensagens de confirmação e erro

## 🚀 Como Usar

### 1. Criar Novo Balancete
1. Selecione a **data** do balancete
2. Adicione **lançamentos** com:
   - Descrição do lançamento
   - Tipo (Débito ou Crédito)
   - Valor monetário
3. O sistema calcula automaticamente os totais
4. **Só é possível lançar quando estiver balanceado** ⚖️

### 2. Gerenciar Lançamentos
- ➕ **Adicionar**: Clique em "Adicionar Lançamento"
- ❌ **Remover**: Use o botão vermelho ao lado do lançamento
- 🧮 **Calcular**: Automático a cada mudança

### 3. Visualizar Histórico
- Todos os balancetes lançados aparecem no histórico
- Informações detalhadas de cada lançamento
- Data e hora de criação
- Botão para limpar todo o cache

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Design responsivo com gradientes e animações
- **JavaScript ES6+**: Lógica de negócio com classes e arrow functions
- **LocalStorage API**: Persistência de dados no navegador

## 📁 Estrutura de Arquivos

```
BALANCETE-NOGUI/
├── index.html      # Página principal
├── styles.css      # Estilos e layout
├── script.js       # Lógica do sistema
└── README.md       # Documentação
```

## 💡 Conceitos Contábeis Implementados

### Balancete de Verificação
- **Débitos** = **Créditos** (princípio fundamental)
- Validação obrigatória antes do lançamento
- Histórico para auditoria e controle

### Exemplos Práticos

#### ❌ Balancete Desbalanceado (NÃO pode ser lançado)
```
Lançamento: R$ 500,00 (Débito)
Dedução 1:  R$ 300,00 (Crédito)  
Dedução 2:  R$ 250,00 (Crédito)
---
Total Débitos:  R$ 500,00
Total Créditos: R$ 550,00
Diferença: R$ 50,00 ❌
```

#### ✅ Balancete Balanceado (PODE ser lançado)
```
Receita:     R$ 1.000,00 (Crédito)
Despesa 1:   R$   600,00 (Débito)
Despesa 2:   R$   400,00 (Débito)
---
Total Débitos:  R$ 1.000,00
Total Créditos: R$ 1.000,00
Diferença: R$ 0,00 ✅
```

## 🔧 Instalação e Execução

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web (XAMPP, WAMP, ou similar)

### Passos
1. Clone ou baixe o projeto
2. Coloque na pasta do servidor web (ex: `htdocs` do XAMPP)
3. Acesse pelo navegador: `http://localhost/BALANCETE-NOGUI/`

## 🎨 Características do Design

- **Responsivo**: Funciona em desktop, tablet e mobile
- **Cores**: Paleta profissional azul/cinza
- **Animações**: Transições suaves e feedback visual
- **Tipografia**: Fonte Segoe UI para melhor legibilidade
- **Estados visuais**: Verde para balanceado, vermelho para desbalanceado

## 📊 Funcionalidades Técnicas

### Cache Inteligente
- Salva automaticamente no localStorage
- Carrega dados na inicialização
- Opção de limpar cache com confirmação

### Validação em Tempo Real
- Cálculos automáticos a cada mudança
- Habilitação/desabilitação dinâmica do botão de envio
- Feedback visual imediato

### Tratamento de Erros
- Validação de campos obrigatórios
- Tratamento de erros de localStorage
- Mensagens de erro amigáveis

## 🏆 Casos de Uso

1. **Estudantes de Contabilidade**: Aprender conceitos de balancete
2. **Pequenas Empresas**: Controle básico de lançamentos
3. **Exercícios Acadêmicos**: Validar conhecimentos contábeis
4. **Demonstrações**: Mostrar princípios contábeis na prática

---

**Desenvolvido para fins educacionais e demonstração de conceitos contábeis** 📚

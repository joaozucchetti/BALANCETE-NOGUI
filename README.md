
# 📊 Sistema de Balancete Contábil

Este é um sistema de balancete contábil desenvolvido como uma aplicação web front-end. Ele permite a criação e validação de balancetes e inclui módulos para cálculos trabalhistas complexos, como encargos mensais e rescisões de contrato, com a capacidade de gerar relatórios e exportar dados em PDF.

## ✨ Funcionalidades

O sistema é organizado em três abas principais, cada uma com funcionalidades específicas para otimizar o trabalho contábil.

### 🧾 Aba Balancete

- **Criação de Balancetes:** Adicione um número ilimitado de lançamentos de débito e crédito.
- **Cálculo em Tempo Real:** O sistema calcula e exibe automaticamente os totais de débitos, créditos e a diferença, indicando se o balancete está equilibrado.
- **Busca de Contas:** Campo de busca com sugestões para selecionar as contas contábeis de forma rápida.
- **Histórico Persistente:** Os balancetes lançados são salvos no navegador (localStorage), permitindo que você feche e abra a aplicação sem perder os dados.
- **Exportação para PDF:** Exporte um único balancete ou todos os balancetes do histórico para arquivos PDF.
- **Relatórios:** Gere relatórios consolidados por período (diário ou mensal) para análise.

### 👥 Aba Cálculo de Encargos

- **Cálculo Detalhado:** Insira o salário bruto e a data de admissão para calcular os principais encargos (INSS Patronal, FGTS, RAT, Sistema S).
- **Parâmetros Editáveis:** Ajuste as alíquotas conforme a necessidade da empresa.
- **Geração de Lançamentos:** Com um clique, o sistema gera automaticamente os lançamentos de débito e crédito correspondentes aos encargos calculados, prontos para serem usados na aba "Balancete".

### 💼 Aba Cálculo de Rescisão

- **Múltiplos Tipos de Rescisão:** Suporta diferentes cenários, como demissão sem justa causa, pedido de demissão, acordo mútuo, etc.
- **Cálculo Abrangente:** Considera verbas como saldo de salário, aviso prévio, férias vencidas e proporcionais, 13º proporcional e a multa de 40% do FGTS.
- **Exportação em PDF:** Gere um documento PDF com o resumo detalhado do cálculo da rescisão.
- **Integração com Balancete:** Crie automaticamente os lançamentos contábeis referentes à rescisão para fechar o balanço.

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estruturação da página.
- **CSS3:** Estilização e layout.
- **JavaScript (Vanilla):** Toda a lógica de programação, cálculos e manipulação do DOM.
- **jsPDF:** Biblioteca para geração de documentos PDF no cliente.
- **LocalStorage:** Armazenamento dos dados no navegador do usuário.

## 🚀 Como Executar o Projeto

1. **Baixe os arquivos:** Faça o download ou clone o repositório para o seu computador.
2. **Organize os arquivos:** Certifique-se de que os arquivos `index.html`, `styles.css` e `script.js` estejam na mesma pasta.
3. **Abra no navegador:** Abra o arquivo `index.html` em qualquer navegador de internet moderno (Google Chrome, Firefox, etc.).

O sistema estará pronto para uso!

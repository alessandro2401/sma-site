// Funções de Impressão e Geração de PDF para Calculadora SMA

// Template HTML (será carregado do arquivo print-template.html)
let printTemplate = '';

// Carregar template na inicialização
fetch('print-template.html')
    .then(response => response.text())
    .then(html => {
        printTemplate = html;
    })
    .catch(error => {
        console.error('Erro ao carregar template de impressão:', error);
    });

// Função auxiliar para formatar moeda
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Função auxiliar para formatar data
function formatarData(dataString) {
    if (!dataString) return 'Não informado';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Função para gerar HTML de lista de itens
function gerarListaHTML(itens) {
    return itens.map(item => `<li>${item}</li>`).join('');
}

// Função principal para gerar conteúdo de impressão
function gerarConteudoImpressao() {
    // Coletar dados do formulário
    const nomeBeneficiario = document.getElementById('nome_beneficiario').value || 'Não informado';
    const placa = document.getElementById('placa').value || 'Não informado';
    const veiculo = document.getElementById('veiculo').value || 'Não informado';
    const dataSinistro = document.getElementById('data_sinistro').value;
    const valorRegulagem = parseFloat(document.getElementById('valor_regulagem').value) || 0;
    const valorParticipacao = parseFloat(document.getElementById('valor_participacao').value) || 0;
    const orcamentoOficina = parseFloat(document.getElementById('orcamento_oficina').value) || 0;
    const diasReparacao = document.getElementById('dias_reparacao').value || 'Não informado';
    const diasCarroReserva = parseInt(document.getElementById('dias_carro_reserva').value) || 0;
    
    // Calcular valor base
    const valorBase = valorRegulagem - valorParticipacao;
    
    // Coletar dados calculados (assumindo que já foram calculados)
    // Opção 1
    const opcao1Prazo = document.querySelector('#resultado .opcao-1 .prazo')?.textContent || '15 dias úteis';
    const opcao1Custo = valorBase;
    const opcao1CarroReserva = diasCarroReserva * 75;
    const opcao1Total = opcao1Custo + opcao1CarroReserva;
    
    const opcao1Vantagens = [
        'Veículo reparado',
        'Sem desembolso imediato'
    ];
    const opcao1Desvantagens = [
        'Aguardar reparo',
        'Sem dinheiro em mãos'
    ];
    
    // Opção 2
    const opcao2Valor = valorBase * 0.65; // Exemplo: 65% do valor base
    const opcao2Prazo = '7 a 10 dias após acordo assinado';
    
    const opcao2Vantagens = [
        'Dinheiro imediato',
        'Liberdade de escolha'
    ];
    const opcao2Desvantagens = [
        'Valor pode ser menor',
        'Responsabilidade pelo reparo'
    ];
    
    // Opção 3
    const opcao3Valor = orcamentoOficina > 0 ? orcamentoOficina * 0.59 : valorBase * 0.59;
    const opcao3CarroReserva = diasCarroReserva * 75;
    const opcao3Total = opcao3Valor + opcao3CarroReserva;
    const opcao3Prazo = 'Até 10 dias após finalização do serviço';
    
    // Determinar opção recomendada
    const opcoes = [
        { nome: 'Opção 1 (Aguardar Reparo)', valor: opcao1Total, id: 1 },
        { nome: 'Opção 2 (Acordo em Dinheiro)', valor: opcao2Valor, id: 2 },
        { nome: 'Opção 3 (Oficina Antecipada)', valor: opcao3Total, id: 3 }
    ];
    
    const menorOpcao = opcoes.reduce((min, opcao) => opcao.valor < min.valor ? opcao : min);
    const recomendacao = `${menorOpcao.nome} é mais vantajosa (menor valor: ${formatarMoeda(menorOpcao.valor)})`;
    
    // Preencher template
    let conteudo = printTemplate;
    
    // Substituir placeholders
    conteudo = conteudo.replace(/{{NOME_BENEFICIARIO}}/g, nomeBeneficiario);
    conteudo = conteudo.replace(/{{PLACA}}/g, placa);
    conteudo = conteudo.replace(/{{VEICULO}}/g, veiculo);
    conteudo = conteudo.replace(/{{DATA_SINISTRO}}/g, formatarData(dataSinistro));
    conteudo = conteudo.replace(/{{VALOR_REGULAGEM}}/g, formatarMoeda(valorRegulagem));
    conteudo = conteudo.replace(/{{VALOR_PARTICIPACAO}}/g, formatarMoeda(valorParticipacao));
    conteudo = conteudo.replace(/{{ORCAMENTO_OFICINA}}/g, orcamentoOficina > 0 ? formatarMoeda(orcamentoOficina) : 'Não informado');
    conteudo = conteudo.replace(/{{DIAS_REPARACAO}}/g, diasReparacao);
    conteudo = conteudo.replace(/{{DIAS_CARRO_RESERVA}}/g, diasCarroReserva);
    conteudo = conteudo.replace(/{{VALOR_BASE}}/g, formatarMoeda(valorBase));
    
    // Opção 1
    conteudo = conteudo.replace(/{{OPCAO1_PRAZO}}/g, opcao1Prazo);
    conteudo = conteudo.replace(/{{OPCAO1_CUSTO}}/g, formatarMoeda(opcao1Custo));
    conteudo = conteudo.replace(/{{OPCAO1_CARRO_RESERVA}}/g, formatarMoeda(opcao1CarroReserva));
    conteudo = conteudo.replace(/{{OPCAO1_TOTAL}}/g, formatarMoeda(opcao1Total));
    conteudo = conteudo.replace(/{{OPCAO1_VANTAGENS}}/g, gerarListaHTML(opcao1Vantagens));
    conteudo = conteudo.replace(/{{OPCAO1_DESVANTAGENS}}/g, gerarListaHTML(opcao1Desvantagens));
    conteudo = conteudo.replace(/{{OPCAO1_RECOMENDADA}}/g, menorOpcao.id === 1 ? 'recomendada' : '');
    conteudo = conteudo.replace(/{{OPCAO1_BADGE}}/g, menorOpcao.id === 1 ? '<span class="badge-recomendada">✓ RECOMENDADA</span>' : '');
    
    // Opção 2
    conteudo = conteudo.replace(/{{OPCAO2_VALOR}}/g, formatarMoeda(opcao2Valor));
    conteudo = conteudo.replace(/{{OPCAO2_PRAZO}}/g, opcao2Prazo);
    conteudo = conteudo.replace(/{{OPCAO2_VANTAGENS}}/g, gerarListaHTML(opcao2Vantagens));
    conteudo = conteudo.replace(/{{OPCAO2_DESVANTAGENS}}/g, gerarListaHTML(opcao2Desvantagens));
    conteudo = conteudo.replace(/{{OPCAO2_RECOMENDADA}}/g, menorOpcao.id === 2 ? 'recomendada' : '');
    conteudo = conteudo.replace(/{{OPCAO2_BADGE}}/g, menorOpcao.id === 2 ? '<span class="badge-recomendada">✓ RECOMENDADA</span>' : '');
    
    // Opção 3
    conteudo = conteudo.replace(/{{OPCAO3_VALOR}}/g, formatarMoeda(opcao3Valor));
    conteudo = conteudo.replace(/{{OPCAO3_PRAZO}}/g, opcao3Prazo);
    conteudo = conteudo.replace(/{{OPCAO3_CARRO_RESERVA}}/g, formatarMoeda(opcao3CarroReserva));
    conteudo = conteudo.replace(/{{OPCAO3_TOTAL}}/g, formatarMoeda(opcao3Total));
    conteudo = conteudo.replace(/{{OPCAO3_RECOMENDADA}}/g, menorOpcao.id === 3 ? 'recomendada' : '');
    conteudo = conteudo.replace(/{{OPCAO3_BADGE}}/g, menorOpcao.id === 3 ? '<span class="badge-recomendada">✓ RECOMENDADA</span>' : '');
    
    // Recomendação
    conteudo = conteudo.replace(/{{RECOMENDACAO}}/g, recomendacao);
    
    // Financiamento (se houver)
    conteudo = conteudo.replace(/{{FINANCIAMENTO_SECTION}}/g, ''); // Por enquanto vazio
    
    // Data de geração
    const dataGeracao = new Date().toLocaleString('pt-BR');
    conteudo = conteudo.replace(/{{DATA_GERACAO}}/g, dataGeracao);
    
    return conteudo;
}

// Função para imprimir
function imprimirResultado() {
    const conteudo = gerarConteudoImpressao();
    
    // Criar janela de impressão
    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(conteudo);
    janelaImpressao.document.close();
    
    // Aguardar carregamento e imprimir
    janelaImpressao.onload = function() {
        janelaImpressao.focus();
        janelaImpressao.print();
    };
}

// Função para gerar PDF
function gerarPDF() {
    const conteudo = gerarConteudoImpressao();
    const nomeBeneficiario = document.getElementById('nome_beneficiario').value || 'Associado';
    const nomeArquivo = `Relatorio_SMA_${nomeBeneficiario.replace(/\s+/g, '_')}.html`;
    
    // Criar blob e download
    const blob = new Blob([conteudo], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Arquivo HTML gerado!\n\nPara converter em PDF:\n1. Abra o arquivo baixado\n2. Pressione Ctrl+P (ou Cmd+P no Mac)\n3. Selecione "Salvar como PDF"\n4. Clique em "Salvar"');
}


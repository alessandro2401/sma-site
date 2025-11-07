/**
 * Integração com API Vercel para Calculadora SMA
 * 
 * Este arquivo contém as funções necessárias para enviar os dados
 * do formulário da Calculadora SMA para a planilha Google Sheets via API
 */

// URL da API Vercel
const API_URL = 'https://api-calculadoras-sheets.vercel.app/api/registrar-calculo-sma';

/**
 * Envia os dados do cálculo para o Google Sheets via API Vercel
 * @param {Object} dadosFormulario - Dados do formulário
 * @param {Object} resultado - Resultado do cálculo
 * @param {number} contraproposta - Valor da contraproposta (se houver)
 */
async function enviarParaGoogleSheets(dadosFormulario, resultado, contraproposta = 0) {
    try {
        // Prepara os dados para envio (seguindo o formato esperado pela API)
        const dados = {
            // Dados do Beneficiário (COLUNAS B, C, D, E)
            nomeBeneficiario: dadosFormulario.nome_beneficiario || '',
            placaVeiculo: dadosFormulario.placa_veiculo || '',
            modeloVeiculo: dadosFormulario.veiculo || '',
            dataAberturaSinistro: dadosFormulario.data_sinistro || '',
            
            // Valores do Sinistro (COLUNAS F, G, H)
            valorRegulagem: parseFloat(dadosFormulario.valor_regulagem) || 0,
            valorParticipacao: parseFloat(dadosFormulario.valor_participacao) || 0,
            orcamentoOficina: parseFloat(dadosFormulario.orcamento_oficina) || parseFloat(dadosFormulario.valor_regulagem) || 0,
            
            // Contraproposta e Limites (COLUNAS I, J, K) ⭐
            valorContraproposta: contraproposta || 0,
            valorMinimoContraproposta: resultado.validacao_contraproposta?.limiteMin || 0,
            valorMaximoContraproposta: resultado.validacao_contraproposta?.limiteMax || 0,
            
            // Prazos (COLUNAS L, M)
            diasReparacao: parseInt(dadosFormulario.dias_reparo) || 0,
            diasCarroReserva: parseInt(dadosFormulario.dias_carro_reserva) || 0,
            
            // Valores Calculados (COLUNAS N, O)
            valorCarroReserva: resultado.opcoes?.opcao_1_aguardar_reparo?.custo_carro_reserva || 0,
            valorBase: resultado.calculos?.valor_liquido || 0,
            
            // Opções de Pagamento (COLUNAS P, Q, R, S)
            opcao1Valor: resultado.opcoes?.opcao_1_aguardar_reparo?.custo_total || 0,
            opcao2Valor: resultado.opcoes?.opcao_2_acordo_dinheiro?.valor_receber || 0,
            opcao3Valor: resultado.opcoes?.opcao_3_oficina_antecipada?.valor_total || 0,
            opcaoRecomendada: resultado.recomendacao || '',
            
            // Financiamento (COLUNAS T, U, V, W, X, Y)
            valorOperacao: resultado.acordo_associado?.financiamento?.valor_operacao || 0,
            taxaJuros: resultado.acordo_associado?.financiamento?.taxa_mensal_pct || 0,
            totalPagar: resultado.acordo_associado?.financiamento?.total_geral || 0,
            custoFinanceiro: resultado.acordo_associado?.financiamento?.custo_financeiro || 0,
            percentualCusto: resultado.acordo_associado?.financiamento?.percentual_custo || 0,
            numeroParcelas: resultado.acordo_associado?.financiamento?.parcelas?.length || 0,
            
            // Parcelas (COLUNAS Z, AA, AB, AC, AD, AE, AF, AG)
            parcela1Data: resultado.acordo_associado?.financiamento?.parcelas?.[0]?.vencimento || '',
            parcela1Valor: resultado.acordo_associado?.financiamento?.parcelas?.[0]?.valor || 0,
            parcela2Data: resultado.acordo_associado?.financiamento?.parcelas?.[1]?.vencimento || '',
            parcela2Valor: resultado.acordo_associado?.financiamento?.parcelas?.[1]?.valor || 0,
            parcela3Data: resultado.acordo_associado?.financiamento?.parcelas?.[2]?.vencimento || '',
            parcela3Valor: resultado.acordo_associado?.financiamento?.parcelas?.[2]?.valor || 0,
            parcela4Data: resultado.acordo_associado?.financiamento?.parcelas?.[3]?.vencimento || '',
            parcela4Valor: resultado.acordo_associado?.financiamento?.parcelas?.[3]?.valor || 0
        };
        
        console.log('📤 Enviando dados para API Vercel:', dados);
        
        // Envia os dados para a API Vercel
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        });
        
        const resultado_api = await response.json();
        
        if (response.ok && resultado_api.success) {
            console.log('✅ Dados enviados para Google Sheets com sucesso!');
            console.log('Resposta da API:', resultado_api);
            return { success: true, dados, response: resultado_api };
        } else {
            console.error('❌ Erro na resposta da API:', resultado_api);
            return { success: false, error: resultado_api.error || 'Erro desconhecido' };
        }
        
    } catch (erro) {
        console.error('❌ Erro ao enviar dados para API:', erro);
        return { success: false, error: erro.toString() };
    }
}

/**
 * Atualiza a contraproposta na planilha quando o usuário insere um novo valor
 * Esta função deve ser chamada quando o botão "Calcular com Contraproposta" é clicado
 */
async function atualizarContraproposta(contraproposta) {
    // Busca os dados do último cálculo armazenados localmente
    const ultimoCalculo = window.ultimoResultado;
    const ultimosDados = window.ultimosDados;
    
    if (!ultimoCalculo || !ultimosDados) {
        console.warn('⚠️ Nenhum cálculo anterior encontrado. Faça um cálculo primeiro.');
        return { success: false, message: 'Faça um cálculo primeiro' };
    }
    
    // Envia os dados atualizados com a contraproposta
    return await enviarParaGoogleSheets(ultimosDados, ultimoCalculo, contraproposta);
}

// Exporta as funções para uso global
window.enviarParaGoogleSheets = enviarParaGoogleSheets;
window.atualizarContraproposta = atualizarContraproposta;

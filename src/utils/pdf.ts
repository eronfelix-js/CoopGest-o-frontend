import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatData, formatMoeda, formatCPF, formatTelefone } from '@/utils/format';
import type { Anuidade, Cooperado, Lancamento, Licitacao, SaldoEstoque } from '@/types';

export function downloadComprovanteAnuidade(params: {
  numeroComprovante: string;
  cooperadoNome: string;
  cooperadoCpf: string;
  anoReferencia: number;
  valor: number;
  dataVencimento: string;
  dataPagamento: string;
  dataEmissao?: string;
}) {
  const doc = new jsPDF();
  const emissao = params.dataEmissao ?? new Date().toISOString().slice(0, 10);
  doc.setFontSize(10);
  doc.text('[LOGO — placeholder]', 105, 16, { align: 'center' });
  doc.setFontSize(12);
  doc.text('COOPERATIVA DE AGRICULTURA FAMILIAR', 105, 26, { align: 'center' });
  doc.setFontSize(11);
  doc.text('COMPROVANTE DE PAGAMENTO DE ANUIDADE', 105, 34, { align: 'center' });
  doc.text('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 20, 42);
  let y = 52;
  doc.setFontSize(10);
  doc.text(`Nº do Comprovante: ${params.numeroComprovante}`, 20, y);
  y += 8;
  doc.text(`Data de Emissão: ${formatData(emissao)}`, 20, y);
  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO COOPERADO', 20, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  doc.text(`Nome: ${params.cooperadoNome}`, 20, y);
  y += 7;
  doc.text(`CPF: ${formatCPF(params.cooperadoCpf)}`, 20, y);
  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO PAGAMENTO', 20, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  doc.text(`Ano de Referência: ${params.anoReferencia}`, 20, y);
  y += 7;
  doc.text(`Valor Pago: ${formatMoeda(params.valor)}`, 20, y);
  y += 7;
  doc.text(`Data de Vencimento: ${formatData(params.dataVencimento)}`, 20, y);
  y += 7;
  doc.text(`Data de Pagamento: ${formatData(params.dataPagamento)}`, 20, y);
  y += 12;
  doc.text('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 20, y);
  y += 10;
  doc.setFontSize(8);
  doc.text('Documento gerado eletronicamente pelo sistema CoopGestão', 105, y, { align: 'center' });
  doc.save(`comprovante-${params.numeroComprovante}.pdf`);
}

export function downloadRelatorioCooperados(rows: Cooperado[]) {
  const doc = new jsPDF();
  doc.text('Relatório de Cooperados', 14, 16);
  const body = rows.map((c) => [
    c.nome,
    formatCPF(c.cpf),
    c.telefone ? formatTelefone(c.telefone) : '—',
    formatData(c.dataEntrada),
    c.status,
  ]);
  autoTable(doc, {
    startY: 22,
    head: [['Nome', 'CPF', 'Telefone', 'Data entrada', 'Status']],
    body,
    styles: { fontSize: 8 },
  });
  const d = new Date().toISOString().slice(0, 10);
  doc.save(`relatorio-cooperados-${d}.pdf`);
}

export function downloadRelatorioAnuidades(
  rows: Anuidade[],
  ano: number,
  totais: { pago: number; pendente: number; atrasado: number }
) {
  const doc = new jsPDF();
  doc.text(`Relatório de Anuidades — ${ano}`, 14, 16);
  const body = rows.map((a) => [
    a.cooperadoNome,
    String(a.anoReferencia),
    formatMoeda(a.valor),
    formatData(a.dataVencimento),
    a.status,
    a.dataPagamento ? formatData(a.dataPagamento) : '—',
  ]);
  autoTable(doc, {
    startY: 22,
    head: [['Cooperado', 'Ano', 'Valor', 'Vencimento', 'Status', 'Pagamento']],
    body,
    styles: { fontSize: 8 },
  });
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.text(`Total pago: ${formatMoeda(totais.pago)}`, 14, finalY);
  doc.text(`Total pendente: ${formatMoeda(totais.pendente)}`, 14, finalY + 6);
  doc.text(`Total atrasado: ${formatMoeda(totais.atrasado)}`, 14, finalY + 12);
  const d = new Date().toISOString().slice(0, 10);
  doc.save(`relatorio-anuidades-${ano}-${d}.pdf`);
}

export function downloadRelatorioEstoque(rows: SaldoEstoque[]) {
  const doc = new jsPDF();
  doc.text('Relatório de Estoque — Saldos', 14, 16);
  const body = rows.map((r) => [r.produtoNome, r.unidadeMedida, String(r.saldo)]);
  autoTable(doc, {
    startY: 22,
    head: [['Produto', 'Unidade', 'Saldo']],
    body,
    styles: { fontSize: 9 },
  });
  const d = new Date().toISOString().slice(0, 10);
  doc.save(`relatorio-estoque-${d}.pdf`);
}

export function downloadRelatorioCaixa(
  rows: Lancamento[],
  inicio: string,
  fim: string,
  totais: { entradas: number; saidas: number; saldo: number }
) {
  const doc = new jsPDF();
  doc.text(`Relatório de Caixa — ${formatData(inicio)} a ${formatData(fim)}`, 14, 16);
  const body = rows.map((l) => [
    formatData(l.data),
    l.tipo,
    l.categoria,
    l.descricao,
    formatMoeda(l.valor),
  ]);
  autoTable(doc, {
    startY: 22,
    head: [['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor']],
    body,
    styles: { fontSize: 7 },
  });
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.text(`Total entradas: ${formatMoeda(totais.entradas)}`, 14, finalY);
  doc.text(`Total saídas: ${formatMoeda(totais.saidas)}`, 14, finalY + 6);
  doc.text(`Saldo do período: ${formatMoeda(totais.saldo)}`, 14, finalY + 12);
  doc.save(`relatorio-caixa-${inicio}-${fim}.pdf`);
}

const statusLicitacaoLabel: Record<string, string> = {
  ABERTA: 'Aberta',
  RESERVADA: 'Reservada',
  EM_TRANSITO: 'Em Trânsito',
  ENTREGUE: 'Entregue',
  CANCELADA: 'Cancelada',
};

export function downloadRelatorioLicitacoes(
  rows: Licitacao[],
  filtroStatus: string,
  totais: { total: number; valorTotal: number; entregues: number; canceladas: number }
) {
  const doc = new jsPDF({ orientation: 'landscape' });

  const statusLabel = filtroStatus === 'all' ? 'Todos os status' : (statusLicitacaoLabel[filtroStatus] ?? filtroStatus);
  const geradoEm = formatData(new Date().toISOString().slice(0, 10));

  doc.setFontSize(13);
  doc.text('Relatório de Licitações', 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Filtro: ${statusLabel}   •   Gerado em: ${geradoEm}`, 14, 24);
  doc.setTextColor(0);

  // Tabela principal
  const body = rows.map((l) => [
    l.numeroEdital,
    l.orgaoLicitante.length > 30 ? l.orgaoLicitante.slice(0, 30) + '…' : l.orgaoLicitante,
    formatMoeda(l.valorTotal),
    formatData(l.dataAbertura),
    formatData(l.prazoEntrega),
    l.dataSaida ? formatData(l.dataSaida) : '—',
    l.dataEntrega ? formatData(l.dataEntrega) : '—',
    statusLicitacaoLabel[l.status] ?? l.status,
    String(l.itens.length),
  ]);

  autoTable(doc, {
    startY: 30,
    head: [['Edital', 'Órgão', 'Valor Total', 'Abertura', 'Prazo entrega', 'Data saída', 'Data entrega', 'Status', 'Itens']],
    body,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [22, 101, 52], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 55 },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 24, halign: 'center' },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 22, halign: 'center' },
      7: { cellWidth: 22, halign: 'center' },
      8: { cellWidth: 12, halign: 'center' },
    },
    alternateRowStyles: { fillColor: [245, 255, 248] },
  });

  // Totalizadores
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo', 14, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de licitações: ${totais.total}`, 14, finalY + 7);
  doc.text(`Valor total (ativas): ${formatMoeda(totais.valorTotal)}`, 14, finalY + 14);
  doc.text(`Entregues: ${totais.entregues}`, 90, finalY + 7);
  doc.text(`Canceladas: ${totais.canceladas}`, 90, finalY + 14);

  const d = new Date().toISOString().slice(0, 10);
  doc.save(`relatorio-licitacoes-${d}.pdf`);
}
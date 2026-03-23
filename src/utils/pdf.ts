import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatData, formatMoeda, formatCPF, formatTelefone } from '@/utils/format';
import type { Anuidade, Cooperado, Lancamento, SaldoEstoque } from '@/types';

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

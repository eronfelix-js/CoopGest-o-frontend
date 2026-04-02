import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatData, formatMoeda, formatCPF } from '@/utils/format';
import type { ComprovanteDTO } from '@/types/cotaParte';

export function downloadComprovanteCotaParte(c: ComprovanteDTO) {
  console.log('ComprovanteDTO recebido:', c); // ← adicione isso
  console.log('cpfCooperado:', c.cpfCooperado);
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text('[LOGO — placeholder]', 105, 14, { align: 'center' });

  doc.setTextColor(0);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('COOPERATIVA DE AGRICULTURA FAMILIAR', 105, 24, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('COMPROVANTE DE PAGAMENTO — COTA-PARTE', 105, 32, { align: 'center' });

  doc.setDrawColor(180);
  doc.line(20, 38, 190, 38);

  // Identificação
  let y = 48;
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Nº do Comprovante: ${c.numeroComprovante}`, 20, y);
  doc.text(`Data de Emissão: ${formatData(c.dataPagamento)}`, 190, y, { align: 'right' });

  // Dados do cooperado
  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30);
  doc.text('DADOS DO COOPERADO', 20, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0);
  y += 8;
  doc.text(`Nome: ${c.nomeCooperado}`, 20, y);
  y += 6;
  doc.text(`CPF: ${formatCPF(c.cpfCooperado)}`, 20, y);

  // Dados do pagamento
  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30);
  doc.text('DADOS DO PAGAMENTO', 20, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0);

  // Tabela resumo
  y += 6;
  autoTable(doc, {
    startY: y,
    head: [['Valor total da cota', 'Valor pago (este pgto.)', 'Saldo devedor', 'Parcelas restantes', 'Status']],
    body: [[
      formatMoeda(c.valorTotal),
      formatMoeda(c.valorPago),
      formatMoeda(c.saldoDevedor),
      String(c.parcelasRestantes),
      c.status === 'QUITADA' ? 'Quitada' : c.status === 'VENCIDA' ? 'Vencida' : 'Ativa',
    ]],
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [22, 101, 52], textColor: 255 },
    columnStyles: {
      0: { halign: 'right' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'center' },
    },
    margin: { left: 20, right: 20 },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // Observações finais
  doc.setDrawColor(180);
  doc.line(20, finalY + 10, 190, finalY + 10);

  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    'Documento gerado eletronicamente pelo sistema CoopGestão. Não requer assinatura.',
    105,
    finalY + 18,
    { align: 'center' }
  );

  doc.save(`comprovante-cota-parte-${c.numeroComprovante}.pdf`);
}

export function downloadRelatorioCotas(
  cotas: Array<{
    cooperadoNome: string;
    valorTotal: number;
    valorPago: number;
    saldoDevedor: number;
    status: string;
    quantidadeParcelas: number;
  }>
) {
  const doc = new jsPDF();
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Cotas-Parte', 14, 16);

  const totalArrecadado = cotas.reduce((acc, c) => acc + c.valorPago, 0);
  const totalDevedor = cotas.reduce((acc, c) => acc + c.saldoDevedor, 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`Gerado em: ${formatData(new Date().toISOString().slice(0, 10))}`, 14, 24);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 30,
    head: [['Cooperado', 'Parcelas', 'Total', 'Pago', 'Saldo devedor', 'Status']],
    body: cotas.map((c) => [
      c.cooperadoNome,
      String(c.quantidadeParcelas),
      formatMoeda(c.valorTotal),
      formatMoeda(c.valorPago),
      formatMoeda(c.saldoDevedor),
      c.status === 'QUITADA' ? 'Quitada' : c.status === 'VENCIDA' ? 'Vencida' : 'Ativa',
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 101, 52], textColor: 255 },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'center' },
    },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.text(`Total arrecadado: ${formatMoeda(totalArrecadado)}`, 14, finalY);
  doc.text(`Total em aberto: ${formatMoeda(totalDevedor)}`, 14, finalY + 7);

  const d = new Date().toISOString().slice(0, 10);
  doc.save(`relatorio-cotas-parte-${d}.pdf`);
}
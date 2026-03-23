const onlyDigits = (s: string) => s.replace(/\D/g, '');

export function formatCPF(cpf: string): string {
  const d = onlyDigits(cpf).slice(0, 11);
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function formatTelefone(tel: string): string {
  const d = onlyDigits(tel).slice(0, 11);
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return tel;
}

export function formatMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export function formatData(data: string): string {
  if (!data) return '';
  const [y, m, d] = data.split('T')[0].split('-');
  if (!y || !m || !d) return data;
  return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
}

export function stripCPF(cpf: string): string {
  return onlyDigits(cpf).slice(0, 11);
}

export function stripTelefone(tel: string): string {
  return onlyDigits(tel);
}

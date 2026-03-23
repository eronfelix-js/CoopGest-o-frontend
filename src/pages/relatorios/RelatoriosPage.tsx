import { useMemo, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as cooperadosService from '@/services/cooperadosService';
import * as anuidadesService from '@/services/anuidadesService';
import * as produtosService from '@/services/produtosService';
import * as estoqueService from '@/services/estoqueService';
import * as lancamentosService from '@/services/lancamentosService';
import {
  downloadRelatorioAnuidades,
  downloadRelatorioCaixa,
  downloadRelatorioCooperados,
  downloadRelatorioEstoque,
} from '@/utils/pdf';
import type { StatusPagamento } from '@/types';

export function RelatoriosPage() {
  const [ano, setAno] = useState(() => String(new Date().getFullYear()));
  const [statusAnu, setStatusAnu] = useState<'all' | StatusPagamento>('all');
  const [ini, setIni] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [fim, setFim] = useState(() => new Date().toISOString().slice(0, 10));

  const { data: cooperados = [] } = useQuery({
    queryKey: ['cooperados'],
    queryFn: cooperadosService.listar,
  });

  const { data: anuidades = [] } = useQuery({
    queryKey: ['anuidades'],
    queryFn: anuidadesService.listar,
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: produtosService.listar,
  });

  const saldoQueries = useQueries({
    queries: produtos.map((p) => ({
      queryKey: ['estoque', 'saldo', p.id],
      queryFn: () => estoqueService.saldoPorProduto(p.id),
      enabled: produtos.length > 0,
    })),
  });

  const saldos = useMemo(() => {
    return produtos.map((_, i) => saldoQueries[i]?.data).filter(Boolean);
  }, [produtos, saldoQueries]);

  const { data: lancamentos = [] } = useQuery({
    queryKey: ['lancamentos', 'periodo', ini, fim],
    queryFn: () => lancamentosService.listarPorPeriodo(ini, fim),
  });

  const anuidadesFiltradas = useMemo(() => {
    const y = Number(ano);
    return anuidades.filter((a) => {
      if (a.anoReferencia !== y) return false;
      if (statusAnu !== 'all' && a.status !== statusAnu) return false;
      return true;
    });
  }, [anuidades, ano, statusAnu]);

  const totaisAnu = useMemo(() => {
    let pago = 0,
      pendente = 0,
      atrasado = 0;
    anuidadesFiltradas.forEach((a) => {
      if (a.status === 'PAGO') pago += a.valor;
      else if (a.status === 'PENDENTE') pendente += a.valor;
      else atrasado += a.valor;
    });
    return { pago, pendente, atrasado };
  }, [anuidadesFiltradas]);

  const totaisCaixa = useMemo(() => {
    let entradas = 0,
      saidas = 0;
    lancamentos.forEach((l) => {
      if (l.tipo === 'ENTRADA') entradas += l.valor;
      else saidas += l.valor;
    });
    return { entradas, saidas, saldo: entradas - saidas };
  }, [lancamentos]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cooperados</CardTitle>
          <CardDescription>Lista completa com CPF, telefone e status</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => downloadRelatorioCooperados(cooperados)}
          >
            <FileDown className="h-4 w-4" />
            Gerar PDF
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Anuidades</CardTitle>
          <CardDescription>Filtre por ano e status antes de gerar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input type="number" className="w-28" value={ano} onChange={(e) => setAno(e.target.value)} />
            <Select value={statusAnu} onValueChange={(v) => setStatusAnu(v as typeof statusAnu)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PAGO">Pago</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="ATRASADO">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => downloadRelatorioAnuidades(anuidadesFiltradas, Number(ano), totaisAnu)}
          >
            <FileDown className="h-4 w-4" />
            Gerar PDF
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estoque</CardTitle>
          <CardDescription>Saldos atuais por produto</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => downloadRelatorioEstoque(saldos as NonNullable<(typeof saldos)[0]>[])}
            disabled={!saldos.length}
          >
            <FileDown className="h-4 w-4" />
            Gerar PDF
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Caixa</CardTitle>
          <CardDescription>Extrato e totais do período</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input type="date" value={ini} onChange={(e) => setIni(e.target.value)} />
            <Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => downloadRelatorioCaixa(lancamentos, ini, fim, totaisCaixa)}
          >
            <FileDown className="h-4 w-4" />
            Gerar PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

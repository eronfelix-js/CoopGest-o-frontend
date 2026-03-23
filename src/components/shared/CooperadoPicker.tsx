import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import * as cooperadosService from '@/services/cooperadosService';
import { formatCPF } from '@/utils/format';

interface Props {
  value: number | null;
  onChange: (id: number | null) => void;
  disabled?: boolean;
}

export function CooperadoPicker({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const { data: cooperados = [], isLoading } = useQuery({
    queryKey: ['cooperados', 'ativos'],
    queryFn: cooperadosService.listarAtivos,
  });

  const selected = cooperados.find((c) => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled || isLoading}
        >
          {selected ? `${selected.nome} — ${formatCPF(selected.cpf)}` : 'Selecione o cooperado…'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar cooperado…" />
          <CommandList>
            <CommandEmpty>Nenhum cooperado encontrado.</CommandEmpty>
            <CommandGroup>
              {cooperados.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.nome} ${c.cpf}`}
                  onSelect={() => {
                    onChange(c.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === c.id ? 'opacity-100' : 'opacity-0')} />
                  {c.nome} — {formatCPF(c.cpf)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

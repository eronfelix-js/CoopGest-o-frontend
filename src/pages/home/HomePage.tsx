import { Link } from 'react-router-dom';
import {
  Sprout,
  Users,
  Wallet,
  Package,
  CalendarClock,
  FileBarChart,
  Shield,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Users,
    title: 'Gestão de Cooperados',
    description: 'Cadastre, edite e acompanhe todos os cooperados em um só lugar. Controle de status e histórico completo.',
  },
  {
    icon: Wallet,
    title: 'Controle de Caixa',
    description: 'Registre entradas e saídas. Acompanhe o saldo em tempo real com relatórios detalhados.',
  },
  {
    icon: Package,
    title: 'Gestão de Estoque',
    description: 'Controle de produtos, movimentações e alertas de estoque baixo para sua cooperativa.',
  },
  {
    icon: CalendarClock,
    title: 'Anuidades',
    description: 'Gerencie cobranças de anuidades, acompanhe pagamentos e identifique inadimplências.',
  },
  {
    icon: FileBarChart,
    title: 'Relatórios',
    description: 'Relatórios completos em PDF para análise financeira e gestão de cooperados.',
  },
  {
    icon: Shield,
    title: 'Segurança',
    description: 'Controle de acesso por perfis. Gestores e colaboradores com permissões diferenciadas.',
  },
];

const benefits = [
  'Simplifique a gestão da sua cooperativa',
  'Acesso de qualquer lugar via web',
  'Relatórios prontos para impressão',
  'Controle financeiro completo',
  'Gestão de cooperados centralizada',
  'Múltiplos usuários com permissões',
];

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sprout className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-primary">CoopGestão</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <a href="#recursos">Recursos</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#sobre">Sobre</a>
            </Button>
            <Button asChild>
              <Link to="/login">
                Entrar
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:py-32">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sprout className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Gestão completa para sua{' '}
            <span className="text-primary">cooperativa</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Sistema web para gerenciamento de cooperados, finanças, estoque e anuidades. 
            Tudo em um só lugar, acessível de qualquer dispositivo.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/login">
                Acessar o sistema
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#recursos">Conhecer recursos</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="border-t bg-muted/30 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
              Tudo que você precisa
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Funcionalidades completas para gerenciar sua cooperativa de forma eficiente e organizada.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 bg-card shadow-sm transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="sobre" className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                Por que escolher o CoopGestão?
              </h2>
              <p className="mb-8 text-muted-foreground">
                Desenvolvido especialmente para cooperativas, nosso sistema oferece 
                todas as ferramentas necessárias para uma gestão moderna e eficiente.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl" />
              <Card className="border-0 shadow-lg">
                <CardHeader className="space-y-1 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de cooperados</p>
                      <p className="text-2xl font-bold">248</p>
                    </div>
                    <Users className="h-8 w-8 text-primary/50" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo do caixa</p>
                      <p className="text-2xl font-bold text-primary">R$ 45.230,00</p>
                    </div>
                    <Wallet className="h-8 w-8 text-primary/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
                      <p className="text-xs text-muted-foreground">Entradas</p>
                      <p className="font-semibold text-emerald-600">R$ 12.450</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
                      <p className="text-xs text-muted-foreground">Saídas</p>
                      <p className="font-semibold text-red-600">R$ 8.320</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary/5 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
            Pronto para modernizar sua gestão?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Acesse agora mesmo e comece a gerenciar sua cooperativa de forma mais eficiente.
          </p>
          <Button size="lg" asChild>
            <Link to="/login">
              Acessar o sistema
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">CoopGestão</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sistema de gestão para cooperativas
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

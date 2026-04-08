import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Wallet,
  Package,
  CalendarClock,
  FileBarChart,
  Shield,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.jpeg';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 sm:h-10 sm:w-10">
              <img
                src={logo}
                alt="Logo da cooperativa"
                className="h-full w-full rounded-[inherit] object-cover"
              />
            </div>
            <span className="text-lg font-bold text-primary sm:text-xl">CoopGestão</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 sm:flex sm:gap-2">
            <Button variant="ghost" size="sm" asChild className="sm:size-default">
              <a href="#recursos">Recursos</a>
            </Button>
            <Button variant="ghost" size="sm" asChild className="sm:size-default">
              <a href="#sobre">Sobre</a>
            </Button>
            <Button size="sm" asChild className="sm:size-default">
              <Link to="/login">
                Entrar
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            'overflow-hidden border-t transition-all duration-300 ease-in-out sm:hidden',
            mobileMenuOpen ? 'max-h-60' : 'max-h-0 border-t-0'
          )}
        >
          <nav className="flex flex-col gap-2 p-4">
            <Button variant="ghost" asChild className="justify-start" onClick={() => setMobileMenuOpen(false)}>
              <a href="#recursos">Recursos</a>
            </Button>
            <Button variant="ghost" asChild className="justify-start" onClick={() => setMobileMenuOpen(false)}>
              <a href="#sobre">Sobre</a>
            </Button>
            <Button asChild onClick={() => setMobileMenuOpen(false)}>
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
          <div className="absolute left-1/2 top-0 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl sm:h-[500px] sm:w-[500px]" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:py-16 md:py-24 lg:py-32">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 sm:mb-6 sm:h-24 sm:w-24 sm:rounded-2xl">
            <img
              src={logo}
              alt="Logo da cooperativa"
              className="h-full w-full rounded-[inherit] object-cover"
            />
          </div>
          <h1 className="mb-3 text-balance text-3xl font-bold tracking-tight sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
            Gestão completa para sua{' '}
            <span className="text-primary">cooperativa</span>
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-pretty text-base text-muted-foreground sm:mb-8 sm:text-lg md:text-xl">
            Sistema web para gerenciamento de cooperados, finanças, estoque e anuidades. 
            Tudo em um só lugar, acessível de qualquer dispositivo.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link to="/login">
                Acessar o sistema
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <a href="#recursos">Conhecer recursos</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="border-t bg-muted/30 py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="mb-2 text-2xl font-bold tracking-tight sm:mb-3 sm:text-3xl md:text-4xl">
              Tudo que você precisa
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
              Funcionalidades completas para gerenciar sua cooperativa de forma eficiente e organizada.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 bg-card shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="pb-2 sm:pb-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
                    <feature.icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs leading-relaxed sm:text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="sobre" className="py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <h2 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl">
                Por que escolher o CoopGestão?
              </h2>
              <p className="mb-6 text-sm text-muted-foreground sm:mb-8 sm:text-base">
                Desenvolvido especialmente para cooperativas, nosso sistema oferece 
                todas as ferramentas necessárias para uma gestão moderna e eficiente.
              </p>
              <ul className="grid gap-2 sm:gap-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl" />
              <Card className="border-0 shadow-lg">
                <CardHeader className="space-y-1 pb-3 sm:pb-4">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400 sm:h-3 sm:w-3" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400 sm:h-3 sm:w-3" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400 sm:h-3 sm:w-3" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 sm:p-4">
                    <div>
                      <p className="text-xs text-muted-foreground sm:text-sm">Total de cooperados</p>
                      <p className="text-xl font-bold sm:text-2xl">248</p>
                    </div>
                    <Users className="h-6 w-6 text-primary/50 sm:h-8 sm:w-8" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 sm:p-4">
                    <div>
                      <p className="text-xs text-muted-foreground sm:text-sm">Saldo do caixa</p>
                      <p className="text-xl font-bold text-primary sm:text-2xl">R$ 45.230,00</p>
                    </div>
                    <Wallet className="h-6 w-6 text-primary/50 sm:h-8 sm:w-8" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="rounded-lg bg-emerald-50 p-2.5 sm:p-3 dark:bg-emerald-950/30">
                      <p className="text-xs text-muted-foreground">Entradas</p>
                      <p className="text-sm font-semibold text-emerald-600 sm:text-base">R$ 12.450</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-2.5 sm:p-3 dark:bg-red-950/30">
                      <p className="text-xs text-muted-foreground">Saídas</p>
                      <p className="text-sm font-semibold text-red-600 sm:text-base">R$ 8.320</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary/5 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-3 text-xl font-bold tracking-tight sm:mb-4 sm:text-2xl md:text-3xl">
            Pronto para modernizar sua gestão?
          </h2>
          <p className="mb-6 text-sm text-muted-foreground sm:mb-8 sm:text-base">
            Acesse agora mesmo e comece a gerenciar sua cooperativa de forma mais eficiente.
          </p>
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link to="/login">
              Acessar o sistema
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="Logo da cooperativa"
                className="h-4 w-4 object-contain sm:h-5 sm:w-4"
              />
            
              <span className="text-sm font-semibold text-primary sm:text-base">CoopGestão</span>
            </div>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Sistema de gestão para cooperativas
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

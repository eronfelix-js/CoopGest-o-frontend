import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
          <p className="text-lg font-medium">Algo deu errado nesta tela.</p>
          {this.state.message && <p className="text-sm text-muted-foreground">{this.state.message}</p>}
          <Button type="button" onClick={() => this.setState({ hasError: false, message: undefined })}>
            Tentar novamente
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

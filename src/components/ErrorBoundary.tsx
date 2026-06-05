import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-6 rounded-2xl bg-bg-card border border-red-500/30 text-text-p my-6">
          <h3 className="text-lg font-bold text-red-500 mb-2">Something went wrong showing the layout</h3>
          <p className="text-sm text-text-s mb-4">
            {this.state.error?.message || 'A rendering error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent text-sm rounded-lg font-medium transition"
          >
            Try reloading component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

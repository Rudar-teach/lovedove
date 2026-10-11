'use client';

import { Suspense, Component, ReactNode } from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, State> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf2f8' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💕</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#831843', marginBottom: '0.5rem' }}>Something went wrong</h2>
            <p style={{ color: '#9d174d', marginBottom: '1rem', fontSize: '0.9rem' }}>{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ padding: '0.75rem 1.5rem', background: '#ec4899', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function LoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf2f8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💕</div>
        <p style={{ color: '#9d174d', fontWeight: 500 }}>Loading Love Dove...</p>
      </div>
    </div>
  );
}

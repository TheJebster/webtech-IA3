import { Component } from 'react';
import { Container } from 'react-bootstrap';

// Last line of defence: show a friendly message instead of a blank page if rendering crashes
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('UI crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Container className="py-5 text-center">
        <h1 className="h3 fw-bold">Something went wrong</h1>
        <p className="text-muted">An unexpected error occurred. Please reload the page.</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
      </Container>
    );
  }
}

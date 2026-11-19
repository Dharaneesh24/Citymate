import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background gap-4 px-6 text-center">
          <p className="text-lg font-semibold text-foreground">Something went wrong.</p>
          <p className="text-sm text-muted-foreground">The app encountered an error after resuming. Please reload.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-sm"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

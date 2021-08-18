import * as React from "react";

export class ErrorBoundary extends React.Component {
  state = { hasError: false };
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(props: any) {
    super(props);
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <h1 style={{ padding: "1em", textAlign: "center" }}>
          Something went wrong.
        </h1>
      );
    }
    return this.props.children;
  }
}

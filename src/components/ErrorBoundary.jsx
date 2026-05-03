import { Component } from "react";
import PropTypes from "prop-types";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("MAI Error Boundary caught:", error, info);
  }

  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          padding: "2rem",
          background: "#0A0A0F",
          color: "#F5F0E8",
          fontFamily: "'Inter', system-ui, sans-serif",
          textAlign: "center",
          gap: "1rem",
        }}>
          <div style={{ fontSize: "3rem" }}>⚠️</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "#9999A8", maxWidth: "400px" }}>
            MAI hit an unexpected error. Your progress is saved — try refreshing or go back home.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.625rem 1.25rem",
                background: "#F97316",
                color: "#0A0A0F",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
            <button
              onClick={() => { window.location.href = "/"; }}
              style={{
                padding: "0.625rem 1.25rem",
                background: "transparent",
                color: "#F5F0E8",
                border: "1px solid #2A2A38",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Go home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

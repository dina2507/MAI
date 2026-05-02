/**
 * Tests for the NotFound (404) component.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../../components/NotFound';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => {
      const { initial, animate, transition, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
}));

function renderNotFound() {
  return render(
    <BrowserRouter>
      <NotFound />
    </BrowserRouter>
  );
}

describe('NotFound Component', () => {
  it('renders the 404 page', () => {
    renderNotFound();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('displays "Page not found" title', () => {
    renderNotFound();
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });

  it('has a link back to home', () => {
    renderNotFound();
    const homeLink = screen.getByRole('link');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.getAttribute('href')).toBe('/');
  });

  it('shows a Go back button', () => {
    renderNotFound();
    expect(screen.getByText('Go back')).toBeInTheDocument();
  });

  it('shows a Go home link', () => {
    renderNotFound();
    expect(screen.getByText('Go home')).toBeInTheDocument();
  });
});

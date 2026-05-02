import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Renders a component wrapped with BrowserRouter for tests 
 * that use Link, useNavigate, etc.
 */
export function renderWithRouter(ui, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
}

/**
 * Creates a mock journey definition for testing.
 */
export function createMockJourney(overrides = {}) {
  return {
    id: 'test-journey',
    title: 'Test Journey',
    subtitle: 'A test journey for unit testing',
    icon: 'TestIcon',
    accent: '#FF6B35',
    estimatedTime: '5 min',
    startStepId: 'step1',
    steps: {
      step1: {
        id: 'step1',
        type: 'info',
        eyebrow: 'Step 1',
        title: 'Welcome',
        body: 'This is step 1',
        nextStepId: 'step2',
      },
      step2: {
        id: 'step2',
        type: 'choice',
        eyebrow: 'Step 2',
        title: 'Choose path',
        body: 'Pick one',
        choices: [
          { label: 'Option A', sublabel: 'Go to A', nextStepId: 'step3a' },
          { label: 'Option B', sublabel: 'Go to B', nextStepId: 'step3b' },
        ],
      },
      step3a: {
        id: 'step3a',
        type: 'checklist',
        eyebrow: 'Step 3A',
        title: 'Checklist A',
        items: [
          { id: 'item1', label: 'Item 1', required: true },
          { id: 'item2', label: 'Item 2', required: false },
        ],
        continueStepId: 'complete',
      },
      step3b: {
        id: 'step3b',
        type: 'action',
        eyebrow: 'Step 3B',
        title: 'Action B',
        body: 'Do something external',
        action: { type: 'link', label: 'Open site', url: 'https://example.com' },
        continueStepId: 'complete',
      },
      complete: {
        id: 'complete',
        type: 'completion',
        title: 'All done!',
        summary: 'You completed the journey.',
        nextActions: [
          { label: 'Back to home', type: 'close' },
        ],
      },
    },
    ...overrides,
  };
}

/**
 * Creates a mock chat message.
 */
export function createMockMessage(overrides = {}) {
  return {
    role: 'user',
    text: 'What is NOTA?',
    ...overrides,
  };
}

/**
 * Delay helper for async tests.
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

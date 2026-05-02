/**
 * Integration tests for chat history with persistence.
 * Tests end-to-end flows across multiple sessions.
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useChatHistory } from '../../hooks/useChatHistory';

describe('Chat History Integration', () => {
  it('supports a full multi-session workflow', () => {
    const { result } = renderHook(() => useChatHistory());

    // Session 1: Ask a question
    const session1Id = result.current.activeSessionId;
    act(() => {
      result.current.persistMessages([
        { role: 'user', text: 'How do I register to vote?' },
        { role: 'assistant', text: 'You can register by filling Form 6...' },
      ]);
    });

    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions[0].id).toBe(session1Id);

    // Session 2: New conversation
    act(() => { result.current.startNewSession(); });
    const session2Id = result.current.activeSessionId;
    expect(session2Id).not.toBe(session1Id);

    act(() => {
      result.current.persistMessages([
        { role: 'user', text: 'What is NOTA?' },
        { role: 'assistant', text: 'NOTA stands for None of the Above...' },
      ]);
    });

    expect(result.current.sessions).toHaveLength(2);

    // Switch back to session 1
    let loaded;
    act(() => { loaded = result.current.loadSession(session1Id); });
    expect(loaded).toHaveLength(2);
    expect(loaded[0].text).toContain('register');
    expect(result.current.activeSessionId).toBe(session1Id);

    // Switch to session 2
    act(() => { loaded = result.current.loadSession(session2Id); });
    expect(loaded[0].text).toContain('NOTA');
  });

  it('titles update as conversation grows', () => {
    const { result } = renderHook(() => useChatHistory());

    act(() => {
      result.current.persistMessages([
        { role: 'user', text: 'Where is my polling booth?' },
      ]);
    });

    expect(result.current.sessions[0].title).toBe('Where is my polling booth?');

    // Add more messages
    act(() => {
      result.current.persistMessages([
        { role: 'user', text: 'Where is my polling booth?' },
        { role: 'assistant', text: 'You can find it on electoralsearch.eci.gov.in' },
        { role: 'user', text: 'Thanks! What documents do I need?' },
      ]);
    });

    // Title is still based on first user message
    expect(result.current.sessions[0].title).toBe('Where is my polling booth?');
  });
});

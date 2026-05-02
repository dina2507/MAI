/**
 * Unit tests for useChatHistory hook — localStorage-backed session management
 * Tests session lifecycle: create, persist, load, list.
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useChatHistory } from '../../hooks/useChatHistory';
import { createMockMessage } from '../helpers';

describe('useChatHistory Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('initializes with empty sessions when localStorage is empty', () => {
      const { result } = renderHook(() => useChatHistory());
      expect(result.current.sessions).toEqual([]);
    });

    it('generates an activeSessionId on init', () => {
      const { result } = renderHook(() => useChatHistory());
      expect(result.current.activeSessionId).toBeDefined();
      expect(typeof result.current.activeSessionId).toBe('string');
    });

    it('activeMessages is empty when no sessions exist', () => {
      const { result } = renderHook(() => useChatHistory());
      expect(result.current.activeMessages).toEqual([]);
    });
  });

  describe('persistMessages', () => {
    it('persists messages for the active session', () => {
      const { result } = renderHook(() => useChatHistory());
      const messages = [
        createMockMessage({ role: 'user', text: 'What is NOTA?' }),
        createMockMessage({ role: 'assistant', text: 'NOTA stands for None of the Above.' }),
      ];

      act(() => {
        result.current.persistMessages(messages);
      });

      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.sessions[0].messages).toEqual(messages);
    });

    it('generates title from first user message', () => {
      const { result } = renderHook(() => useChatHistory());
      const messages = [
        createMockMessage({ role: 'user', text: 'How do I register to vote?' }),
      ];

      act(() => {
        result.current.persistMessages(messages);
      });

      expect(result.current.sessions[0].title).toBe('How do I register to vote?');
    });

    it('truncates long titles to 48 characters', () => {
      const { result } = renderHook(() => useChatHistory());
      const longText = 'A'.repeat(60);
      const messages = [createMockMessage({ role: 'user', text: longText })];

      act(() => {
        result.current.persistMessages(messages);
      });

      expect(result.current.sessions[0].title.length).toBeLessThanOrEqual(49); // 48 + ellipsis
    });

    it('does not persist empty message arrays', () => {
      const { result } = renderHook(() => useChatHistory());
      act(() => {
        result.current.persistMessages([]);
      });
      expect(result.current.sessions).toEqual([]);
    });

    it('updates existing session on re-persist', () => {
      const { result } = renderHook(() => useChatHistory());
      const msg1 = [createMockMessage({ text: 'Hello' })];
      const msg2 = [...msg1, createMockMessage({ role: 'assistant', text: 'Hi!' })];

      act(() => { result.current.persistMessages(msg1); });
      act(() => { result.current.persistMessages(msg2); });

      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.sessions[0].messages).toEqual(msg2);
    });
  });

  describe('startNewSession', () => {
    it('creates a new session with a new ID', () => {
      const { result } = renderHook(() => useChatHistory());
      const oldId = result.current.activeSessionId;

      act(() => {
        result.current.startNewSession();
      });

      expect(result.current.activeSessionId).not.toBe(oldId);
    });
  });

  describe('loadSession', () => {
    it('loads messages for a specific session', () => {
      const { result } = renderHook(() => useChatHistory());
      const messages = [createMockMessage({ text: 'Test question' })];

      // Save to first session
      const firstSessionId = result.current.activeSessionId;
      act(() => { result.current.persistMessages(messages); });

      // Start new session
      act(() => { result.current.startNewSession(); });

      // Load the first session
      let loadedMessages;
      act(() => {
        loadedMessages = result.current.loadSession(firstSessionId);
      });

      expect(loadedMessages).toEqual(messages);
      expect(result.current.activeSessionId).toBe(firstSessionId);
    });

    it('returns empty array for nonexistent session', () => {
      const { result } = renderHook(() => useChatHistory());
      let loadedMessages;
      act(() => {
        loadedMessages = result.current.loadSession('nonexistent-id');
      });
      expect(loadedMessages).toEqual([]);
    });
  });

  describe('Session limit (MAX_SESSIONS = 20)', () => {
    it('does not exceed 20 sessions', () => {
      const { result } = renderHook(() => useChatHistory());

      // Create 25 sessions
      for (let i = 0; i < 25; i++) {
        act(() => { result.current.startNewSession(); });
        act(() => {
          result.current.persistMessages([
            createMockMessage({ text: `Question ${i}` }),
          ]);
        });
      }

      expect(result.current.sessions.length).toBeLessThanOrEqual(20);
    });
  });

  describe('localStorage sync', () => {
    it('writes sessions to localStorage on change', () => {
      const { result } = renderHook(() => useChatHistory());
      act(() => {
        result.current.persistMessages([createMockMessage({ text: 'Save me' })]);
      });
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'civic_chat_sessions',
        expect.any(String)
      );
    });
  });
});

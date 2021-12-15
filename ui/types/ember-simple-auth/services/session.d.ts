import type RouterService from '@ember/routing/router-service';
type Transition = ReturnType<RouterService['transitionTo']>;

declare module 'ember-simple-auth/services/session' {
  export default interface SessionService {
    authenticate(authenticator: string, params: unknown): Promise<void>;
    isAuthenticated: boolean;
    invalidate(): Promise<void>;
    attemptedTransition: Transition;
    data: SessionData;

    set(key: string, value: unknown): void;
  }

  interface SessionData {
    authenticated?: Record<string, unknown>;
    workspace?: string;
  }
}

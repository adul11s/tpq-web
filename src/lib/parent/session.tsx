"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { ApiError } from "../api/client";
import { parentApi } from "../api/parent";

export type ParentSessionStatus = "loading" | "authed" | "guest";

export interface ParentSessionUser {
  email: string;
  full_name: string;
}

export interface ParentSessionSetInput {
  email: string;
  full_name: string;
  must_change_password: boolean;
}

export interface ParentSessionValue {
  status: ParentSessionStatus;
  user: ParentSessionUser | null;
  mustChangePassword: boolean;
  refresh: () => Promise<void>;
  setSession: (session: ParentSessionSetInput | null) => void;
}

const ParentSessionContext = createContext<ParentSessionValue | null>(null);

export function ParentSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ParentSessionStatus>("loading");
  const [user, setUser] = useState<ParentSessionUser | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const generationRef = useRef(0);

  const refresh = useCallback(() => {
    const generation = ++generationRef.current;
    return parentApi
      .me()
      .then((me) => {
        if (generationRef.current !== generation) return;
        setUser({ email: me.email, full_name: me.full_name });
        setMustChangePassword(me.must_change_password);
        setStatus("authed");
      })
      .catch((error: unknown) => {
        if (generationRef.current !== generation) return;
        if (error instanceof ApiError && error.status === 403) {
          setUser(null);
          setMustChangePassword(true);
          setStatus("authed");
          return;
        }
        setUser(null);
        setMustChangePassword(false);
        setStatus("guest");
      });
  }, []);

  const setSession = useCallback((session: ParentSessionSetInput | null) => {
    generationRef.current += 1;
    if (session) {
      setUser({ email: session.email, full_name: session.full_name });
      setMustChangePassword(session.must_change_password);
      setStatus("authed");
    } else {
      setUser(null);
      setMustChangePassword(false);
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <ParentSessionContext.Provider
      value={{ status, user, mustChangePassword, refresh, setSession }}
    >
      {children}
    </ParentSessionContext.Provider>
  );
}

export function useParentSession(): ParentSessionValue {
  const value = useContext(ParentSessionContext);
  if (!value) {
    throw new Error(
      "useParentSession must be used within ParentSessionProvider",
    );
  }
  return value;
}
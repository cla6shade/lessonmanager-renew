"use client";

import {
  createContext,
  useActionState,
  useEffect,
  ReactNode,
  use,
} from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/(auth)/login/loginAction";
import { ActionState } from "@/app/types";
import { LoginSchema } from "@/app/(auth)/login/schema";

const initialState: ActionState<typeof LoginSchema> = {
  success: false,
};

interface LoginContextValue {
  loginState: ActionState<typeof LoginSchema>;
  formAction: (payload: FormData) => void;
  pending: boolean;
}

const LoginContext = createContext<LoginContextValue | undefined>(undefined);

interface LoginProviderProps {
  children: ReactNode;
}

export function LoginProvider({ children }: LoginProviderProps) {
  const [loginState, formAction, pending] = useActionState(
    loginAction,
    initialState
  );
  const router = useRouter();

  useEffect(() => {
    if (loginState.success) {
      router.push("/");
    }
  }, [loginState, router]);

  const value: LoginContextValue = {
    loginState,
    formAction,
    pending,
  };

  return (
    <LoginContext.Provider value={value}>{children}</LoginContext.Provider>
  );
}

export function useLogin() {
  const context = use(LoginContext);
  if (context === undefined) {
    throw new Error("useLogin must be used within a LoginProvider");
  }
  return context;
}

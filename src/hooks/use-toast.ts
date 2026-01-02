import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_REMOVE_DELAY = 5000; // 5s default
const TOAST_LIMIT = 5; // Limite padrão, pode ser ajustado

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function genId() {
  return Math.random().toString(36).substring(2, 10);
}

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

function scheduleRemove(toastId: string, delay = TOAST_REMOVE_DELAY) {
  clearTimeout(toastTimeouts.get(toastId));
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, delay);
  toastTimeouts.set(toastId, timeout);
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST": {
      const newToasts = [action.toast, ...state.toasts].slice(0, TOAST_LIMIT);
      scheduleRemove(action.toast.id);
      return { ...state, toasts: newToasts };
    }

    case "UPDATE_TOAST": {
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };
    }

    case "DISMISS_TOAST": {
      const ids = action.toastId ? [action.toastId] : state.toasts.map((t) => t.id);
      ids.forEach((id) => scheduleRemove(id));
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          ids.includes(t.id)
            ? { ...t, open: false }
            : t
        ),
      };
    }

    case "REMOVE_TOAST": {
      if (action.toastId) {
        clearTimeout(toastTimeouts.get(action.toastId));
        toastTimeouts.delete(action.toastId);
        return { ...state, toasts: state.toasts.filter((t) => t.id !== action.toastId) };
      }
      toastTimeouts.forEach(clearTimeout);
      toastTimeouts.clear();
      return { ...state, toasts: [] };
    }

    default:
      return state;
  }
};

export function toast(props: Omit<ToasterToast, "id">) {
  const id = genId();
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  const update = (updateProps: Partial<ToasterToast>) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...updateProps, id } });

  dispatch({
    type: "ADD_TOAST",
    toast: { ...props, id, open: true, onOpenChange: (open) => !open && dismiss() },
  });

  return { id, dismiss, update };
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    removeAll: () => dispatch({ type: "REMOVE_TOAST" }),
  };
}

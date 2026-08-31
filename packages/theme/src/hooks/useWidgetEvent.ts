import { useEffect, useCallback, useRef } from "react";
import { widgetEventBus, type WidgetEventType } from "../utils/widgetEventBus";

export function useWidgetEvent<T = any>(
  eventType: WidgetEventType,
  handler?: (payload: T) => void,
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!handlerRef.current) return;
    const callback = (payload: T) => {
      if (handlerRef.current) {
        handlerRef.current(payload);
      }
    };

    const unsubscribe = widgetEventBus.subscribe<T>(eventType, callback);
    return () => {
      unsubscribe();
    };
  }, [eventType]);

  const publish = useCallback(
    (payload?: T) => {
      widgetEventBus.publish<T>(eventType, payload as T);
    },
    [eventType],
  );

  return { publish };
}

export default useWidgetEvent;

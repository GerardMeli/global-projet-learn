import { useEffect, useRef } from 'react';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level?: LogLevel;
  component?: string;
}

export const useLogger = (componentName: string) => {
  const isDev = import.meta.env.DEV;

  const log = (message: string, data?: any, options: LogOptions = {}) => {
    if (!isDev) return;

    const level = options.level || 'info';
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${componentName}]`;

    const logMessage = `${prefix} ${message}`;

    switch (level) {
      case 'debug':
        console.debug(logMessage, data || '');
        break;
      case 'info':
        console.log(logMessage, data || '');
        break;
      case 'warn':
        console.warn(logMessage, data || '');
        break;
      case 'error':
        console.error(logMessage, data || '');
        break;
    }
  };

  const logLifecycle = (hook: string, props?: any) => {
    if (!isDev) return;
    console.log(`[${componentName}] ${hook}`, props || '');
  };

  return { log, logLifecycle };
};

// Exemple d'utilisation dans un composant
export const withLogger = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return (props: P) => {
    const { logLifecycle } = useLogger(componentName);
    const mounted = useRef(false);

    useEffect(() => {
      if (!mounted.current) {
        logLifecycle('mounted', props);
        mounted.current = true;
      }
      return () => {
        logLifecycle('unmounted');
      };
    }, []);

    useEffect(() => {
      logLifecycle('updated', props);
    });

    return <WrappedComponent {...props} />;
  };
};
export class PerformanceLogger {
  private marks: Map<string, number> = new Map();

  start(markName: string) {
    this.marks.set(markName, performance.now());
    if (import.meta.env.DEV) {
      console.log(`[Performance] Started: ${markName}`);
    }
  }

  end(markName: string) {
    const startTime = this.marks.get(markName);
    if (startTime) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.marks.delete(markName);
      
      if (import.meta.env.DEV) {
        console.log(`[Performance] ${markName}: ${duration.toFixed(2)}ms`);
      }
      return duration;
    }
    return null;
  }

  measureAsync = async <T>(
    markName: string,
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    this.start(markName);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      this.end(markName);
    }
  };
}

export const perfLogger = new PerformanceLogger();
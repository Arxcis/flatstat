export function useMarkPerformance(name) {
  performance.mark(`${name}-start`);
}

export function useMeasurePerformance(name) {
  performance.mark(`${name}-end`);
  performance.measure(`${name}`, `${name}-start`, `${name}-end`)
  const measure = performance.getEntriesByType("measure").find(it => it.name === name);
  console.debug(`measure: ${measure.name} ${measure.duration}ms`)
}

export function unusedFn(): string {
  return "unused";
}

export class UnusedClass {
  value = 42;
}

export const unusedVar = "unused-var";

export function usedFn(): string {
  return "used";
}

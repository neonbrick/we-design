export function greet(name: string): string {
  const cleaned = name.trim();
  return cleaned.length === 0 ? "Hello, world!" : `Hello, ${cleaned}!`;
}

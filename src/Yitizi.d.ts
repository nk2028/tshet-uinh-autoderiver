declare module "yitizi" {
  export const yitiziData: Record<string, string>;
  export function get(c: string): string[];
}

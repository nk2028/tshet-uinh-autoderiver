declare module "yitizi" {
  export const yitiziData: { [c: string]: string };
  export function get(c: string): string[];
}

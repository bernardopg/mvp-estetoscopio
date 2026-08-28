// Declarações de módulo para imports MDX via path alias `@docs/*` (tsconfig).
// O wildcard `*.mdx` do @types/mdx não é aplicado pelo compilador nativo
// (TypeScript 7 / tsgo) a imports resolvidos por `paths`, então declaramos
// explicitamente o padrão usado nas páginas de /docs.

declare module "@docs/*.mdx" {
  import type { ComponentType } from "react";

  const MDXContent: ComponentType<Record<string, unknown>>;
  export default MDXContent;
  export const frontmatter: Record<string, unknown>;
}

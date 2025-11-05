import type { MDXComponents } from "mdx/types";
import {
  Callout,
  Card,
  CodeBlock,
  FeatureGrid,
  Step,
} from "./docs/components/DocComponents";
import { useMDXComponents as getDocsMDXComponents } from "./docs/components/mdx-components";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...getDocsMDXComponents(components),
    Callout,
    Card,
    CodeBlock,
    Step,
    FeatureGrid,
  };
}

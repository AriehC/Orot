"use client";

import { useRouter } from "next/navigation";
import { ConceptGraphNode } from "@/lib/types";
import { conceptHref, normalizeConcept } from "@/lib/wikilinks";
import styles from "./Concepts.module.css";

interface ConceptGraphProps {
  centerLabel: string;
  nodes: ConceptGraphNode[];
  title?: string;
  onNavigate?: () => void;
}

const SIZE = 300;
const C = SIZE / 2;
const MAX_NODES = 14;

const KIND_LABEL: Record<ConceptGraphNode["kind"], string> = {
  center: "",
  related: "קשור",
  link: "מקושר מכאן",
  backlink: "מקשר לכאן",
  cooccur: "מופיע יחד",
};

function shortLabel(label: string, max = 12) {
  return label.length > max ? label.slice(0, max - 1) + "…" : label;
}

/** Small radial "local graph" — the current page in the middle, its neighbours around it. */
export default function ConceptGraph({ centerLabel, nodes, title = "מפת קשרים", onNavigate }: ConceptGraphProps) {
  const router = useRouter();
  const shown = [...nodes].sort((a, b) => b.weight - a.weight).slice(0, MAX_NODES);
  const kinds = [...new Set(shown.map((n) => n.kind))];

  function go(node: ConceptGraphNode) {
    onNavigate?.();
    router.push(conceptHref(node.label));
  }

  return (
    <section className={styles.graphBox} aria-label={title}>
      <h2 className={styles.sideTitle}>{title}</h2>
      {shown.length === 0 ? (
        <p className={styles.previewMuted}>עוד אין קשרים. הוסיפו מושגים קשורים או קישורי [[ ]].</p>
      ) : (
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.graph} role="img" aria-label={`${centerLabel} ו־${shown.length} מושגים קשורים`}>
          {shown.map((node, i) => {
            const angle = (i / shown.length) * Math.PI * 2 - Math.PI / 2;
            const r = node.weight >= 3 ? 88 : node.weight === 2 ? 104 : 118;
            const x = C + Math.cos(angle) * r;
            const y = C + Math.sin(angle) * r;
            return (
              <g key={node.id}>
                <line x1={C} y1={C} x2={x} y2={y} className={`${styles.edge} ${styles[`edge_${node.kind}`]}`} strokeWidth={node.weight} />
              </g>
            );
          })}
          <circle cx={C} cy={C} r={32} className={styles.centerNode} />
          <text
            x={C}
            y={C}
            className={styles.centerLabel}
            dominantBaseline="central"
            textAnchor="middle"
            fontSize={centerLabel.length > 7 ? 9 : 11}
          >
            {shortLabel(centerLabel, 11)}
          </text>
          {shown.map((node, i) => {
            const angle = (i / shown.length) * Math.PI * 2 - Math.PI / 2;
            const r = node.weight >= 3 ? 88 : node.weight === 2 ? 104 : 118;
            const x = C + Math.cos(angle) * r;
            const y = C + Math.sin(angle) * r;
            const below = y >= C;
            return (
              <g
                key={node.id}
                className={styles.node}
                role="link"
                tabIndex={0}
                aria-label={`${node.label} (${KIND_LABEL[node.kind]})`}
                onClick={() => go(node)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    go(node);
                  }
                }}
              >
                <title>{node.label}</title>
                <circle cx={x} cy={y} r={5 + node.weight * 2} className={`${styles.nodeDot} ${styles[`dot_${node.kind}`]}`} />
                <text x={x} y={below ? y + 20 : y - 14} textAnchor="middle" className={styles.nodeLabel}>
                  {shortLabel(node.label)}
                </text>
              </g>
            );
          })}
        </svg>
      )}
      {kinds.length > 0 && (
        <ul className={styles.legend}>
          {kinds.map((k) => (
            <li key={k}>
              <span className={`${styles.legendDot} ${styles[`dot_${k}`]}`} />
              {KIND_LABEL[k]}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Merge neighbour candidates into unique graph nodes, keeping the strongest connection per concept. */
export function buildGraphNodes(
  centerKey: string,
  groups: { kind: ConceptGraphNode["kind"]; weight: number; labels: string[] }[]
): ConceptGraphNode[] {
  const byKey = new Map<string, ConceptGraphNode>();
  for (const group of groups) {
    for (const label of group.labels) {
      const id = normalizeConcept(label);
      if (!id || id === centerKey) continue;
      const existing = byKey.get(id);
      if (!existing || existing.weight < group.weight) {
        byKey.set(id, { id, label: existing?.label ?? label, weight: group.weight, kind: group.kind });
      }
    }
  }
  return [...byKey.values()];
}

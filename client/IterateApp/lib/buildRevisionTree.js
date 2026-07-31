// lib/buildRevisionTree.js

export function buildRevisionTree(materials, progress) {
  if (!materials?.length) return { nodes: [], edges: [], levelCounts: [1], levelY: [32], currentNodeId: null };

  const sorted = [...materials].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  sorted.forEach((t, i) => {
  console.log("FOR EACHHHH", i, t);
});
  
  console.log("materials.lengthssss", materials.length);
  console.log("sorted.lengthssssssssssss", sorted.length);
  console.log(sorted);
  const currentStep = progress?.currentOrderStep ?? 1;
  console.log("currentStepsssssssssss:", currentStep);
console.table(
  sorted.map(t => ({
    topic: t.topic,
    order: t.order,
  }))
);
  const nodes = sorted.map((t, i) => {
    const seq = i + 1; // dense position — used ONLY for layout (level/pos), never for done comparison
    const level = Math.floor(Math.log2(seq));
    const pos = seq - Math.pow(2, level);
    return {
      id: t.id ?? t._id,         // real Mongo _id — for API calls (some APIs return `_id` not `id`)
      seq,                       // dense position — for tree layout only
      order: t.order,            // raw order value — for done comparison against currentOrderStep
      label: (t.topic || `T${seq}`).slice(0, 6),
      topic: t.topic || `Topic ${seq}`,
      level,
      pos,
      done: t.order < currentStep,
    };
    console.log(
  `orderrrrrrrrrrrrrrrrrr=${t.order}, currentSteppppppppppppppp=${currentStep}, doneeeeeeeeeeeee=${node.done}`)
  });

  // Keyed by seq (not id) on purpose — seq is derived purely from array position
  // and is always defined/unique, whereas id comes from upstream data (e.g. Mongo)
  // and may be missing or misnamed. Tree wiring should never depend on that.
  const edges = nodes
    .filter((n) => n.seq > 1)
    .map((n) => [Math.floor(n.seq / 2), n.seq]);

  const maxLevel = Math.max(...nodes.map((n) => n.level));
  // IMPORTANT: this must be each level's full binary-tree capacity (2^level slots),
  // NOT the count of nodes actually present at that level. The tree fills left-to-right,
  // so every level except possibly the last is full — but if the last level is partial
  // (e.g. 10 topics → level 3 only has 3 of 8 slots), spacing by *actual* count instead
  // of *capacity* stretches those leftover nodes across the whole width and misaligns
  // them from their real parent, which is what breaks the layout.
  const levelCounts = Array.from({ length: maxLevel + 1 }, (_, l) => Math.pow(2, l));

  const HAND_TUNED_Y = [32, 108, 196, 294];
  const levelY =
    maxLevel < 4
      ? HAND_TUNED_Y.slice(0, maxLevel + 1)
      : Array.from({ length: maxLevel + 1 }, (_, l) => 32 + l * ((320 - 32) / maxLevel));

  const currentNode = nodes.find((n) => !n.done) ?? null;

  return { nodes, edges, levelCounts, levelY, currentNodeId: currentNode?.id ?? null };
}
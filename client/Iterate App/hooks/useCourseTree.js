// hooks/useCourseTree.js
import { useMemo } from 'react';
import { useMaterials } from './useMaterials';
import { useProgress } from './useProgress';

// Reconstructs level/pos from flat index (1 → 2 → 4 → 8 layout)
function layoutNodes(topics, currentOrderStep) {
  return topics.map((t, i) => {
    const level = i === 0 ? 0 : Math.floor(Math.log2(i + 1));
    const levelStart = Math.pow(2, level) - 1;
    return {
      id: t.id,
      label: t.shortLabel || t.topic.slice(0, 4),
      topic: t.topic,
      level,
      pos: i - levelStart,
      order: i + 1,                       // 1-indexed, matches currentOrderStep semantics
      done: (i + 1) <= currentOrderStep,
    };
  });
}

function buildEdges(nodes) {
  const edges = [];
  nodes.forEach((n, i) => {
    if (i === 0) return;
    const parentIndex = Math.floor((i - 1) / 2);
    edges.push([nodes[parentIndex].id, n.id]);
  });
  return edges;
}

export function useCourseTree(courseCode) {
  const { materials, loading: mLoading, error: mError } = useMaterials(courseCode);
  const { progress, loading: pLoading, error: pError } = useProgress(courseCode);

  const course = useMemo(() => {
    if (!materials.length || !progress) return null;
    const nodes = layoutNodes(materials, progress.currentOrderStep);
    return {
      label: courseCode,
      nodes,
      edges: buildEdges(nodes),
      currentNodeId: nodes.find(n => !n.done)?.id ?? null,
      completedDates: {}, // no per-topic dates in your progress payload yet
    };
  }, [materials, progress, courseCode]);

  return {
    course,
    loading: mLoading || pLoading,
    error: mError || pError,
  };
}
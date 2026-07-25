import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { TreeSVG, StatsBar, AcedLog, NodeDetail, CSS } from "../src/RevisionTree.jsx"; // ⚠️ adjust path
import { useProgress } from "../hooks/useProgress";
import { useMaterials } from "../hooks/useMaterials";
import { buildRevisionTree } from "../lib/buildRevisionTree.js";


export function LiveRevisionTree({ courseCode, celebrateLatest = true }) {
  const { progress, loading: progressLoading, error: progressError } = useProgress(courseCode);
  const { materials, loading: materialsLoading, error: materialsError } = useMaterials(courseCode);
const [selectedNode, setSelectedNode] = useState(null);
const [animateId, setAnimateId] = useState(null);
const [introFinished, setIntroFinished] = useState(false);
  const hasCelebrated = useRef(false);

const { nodes, edges, levelCounts, levelY } = useMemo(() => {
  const built = buildRevisionTree(materials, progress);

  // "currentOrderStep - 1" is an ORDER value, not a Mongo _id — must match
  // against n.order (per buildRevisionTree's own comment: order is for
  // done/step comparisons, id is only for API calls).
  const latestCompletedOrder = (progress?.currentOrderStep ?? 1) - 1;

  built.nodes = built.nodes.map((n) => {
    // Hide the newest completed node until the intro animation plays.
    if (!introFinished && n.order === latestCompletedOrder) {
      return { ...n, done: false };
    }

    return n;
  });

  return built;
}, [materials, progress, introFinished]);

  // Auto-fire the "aced it" animation for the topic that was completed
  // on the previous page — derived purely from currentOrderStep (which
  // the other page's button already incremented via its API call before
  // navigating here), so no routing state is needed.
useEffect(() => {
  if (
    !celebrateLatest ||
    hasCelebrated.current ||
    !progress ||
    !nodes.length
  ) {
    return;
  }

  const latestCompletedOrder = (progress.currentOrderStep ?? 1) - 1;
  const node = nodes.find((n) => n.order === latestCompletedOrder);

  if (!node) return;

  hasCelebrated.current = true;
  setSelectedNode(node);

  // Wait a moment after page load.
  const reveal = setTimeout(() => {
    setIntroFinished(true);
    // animateId is compared against node.id in TreeNode, so it must be the
    // node's actual id — not the order number used to find it.
    setAnimateId(node.id);
  }, 500);

  // Remove animation afterwards — long enough for the ripple + label to
  // finish (they run ~1.1s starting up to 0.4s after animateId is set).
  const cleanup = setTimeout(() => {
    setAnimateId(null);
  }, 2100);

  return () => {
    clearTimeout(reveal);
    clearTimeout(cleanup);
    // If this effect gets cleaned up before `reveal` fires (React 18 Strict
    // Mode double-invokes every effect in dev: mount → cleanup → mount),
    // hasCelebrated.current is already true from the first mount, and
    // setIntroFinished(true) never got called — permanently stuck hiding
    // the newest node. Reset the guard here so the retry on second mount
    // can actually run instead of short-circuiting on hasCelebrated.current.
    hasCelebrated.current = false;
  };
}, [nodes, progress, celebrateLatest]);
useEffect(() => {
  hasCelebrated.current = false;
  setIntroFinished(false);
  setAnimateId(null);
}, [courseCode]);

const handleSelectNode = useCallback(
  (node) => {
    setSelectedNode(nodes.find((n) => n.id === node.id) ?? node);
  },
  [nodes]
);

  // Same join AcedLog uses (completedTopics keyed by order, not id/seq) —
  // just scoped to the single selected node instead of the whole list.
  const selectedCompletedDate = selectedNode
    ? progress?.completedTopics?.find((c) => c.order === selectedNode.order)?.acedAt
    : null;

  if (progressLoading || materialsLoading) {
    return (
      <div className="rt-root">
        <style>{CSS}</style>
        <div className="rt-wrap">loading your tree…</div>
      </div>
    );
  }
  if (progressError || materialsError) {
    return (
      <div className="rt-root">
        <style>{CSS}</style>
        <div className="rt-wrap">couldn't load progress — try enrolling in a course first.</div>
      </div>
    );
  }

  return (
    <div className="rt-root" style={{ minWidth: "88%" }}>
      <style>{CSS}</style>
      <div className="rt-wrap">
        <div className="rt-header">
          <span className="rt-title">{courseCode} revision tree</span>
          <hr className="rt-rule" />
          {/* <span className="rt-date">{formatDate()}</span> */}
        </div>
        <StatsBar nodes={nodes} />
        <div className="rt-tree-wrap">
          <TreeSVG
            nodes={nodes}
            edges={edges}
            animateId={animateId}
            onSelectNode={handleSelectNode}
            levelCounts={levelCounts}
            levelY={levelY}
          />
        </div>
        <NodeDetail node={selectedNode} completedDate={selectedCompletedDate} />
        <AcedLog nodes={nodes} completedTopics={progress?.completedTopics} />
      </div>
    </div>
  );
}
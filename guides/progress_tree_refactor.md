# Progress Tree Mobile Refactor

This document explains in detail how the `LiveRevisionTree` component was refactored to properly fit and render on mobile screen sizes.

## The Problem
The progress tree was originally hardcoded with a fixed width constant: `const SVG_W = 1500;`. 
Because of this, the `TreeSVG` component always rendered exactly 1500 pixels wide. While CSS rules (`max-width: 100%; height: auto`) attempted to scale it down on mobile devices, compressing a 1500px wide diagram onto a ~400px phone screen meant a 4x size reduction. 
Consequently, the tree nodes (with a fixed radius of 21px) shrunk down to about 5px wide—making them unreadable and impossible to click.

## The Solution
Instead of relying purely on CSS to crush a massive image down, we updated the React component to **dynamically calculate its width** based on the user's screen size. By changing the coordinate math, the nodes pack closer together horizontally on small screens, preventing the extreme scale-down effect.

### Step 1: Make `xFor` Math Dynamic
Previously, the `xFor` function (which calculates the X position of a node) used the global `SVG_W` constant. We modified it to accept `svgW` as an argument.

```diff
- function xFor(level, pos, levelCounts) { 
-   return (SVG_W / (levelCounts[level] + 1)) * (pos + 1); 
- }
+ function xFor(level, pos, levelCounts, svgW) { 
+   return (svgW / (levelCounts[level] + 1)) * (pos + 1); 
+ }
```

### Step 2: Pass `svgW` through the TreeNode
The `TreeNode` component was updated to accept the new `svgW` prop and pass it into the `xFor` function so it correctly calculates its `cx` coordinate.

```diff
- function TreeNode({ node, nodes, edges, animateId, onSelect, levelCounts, levelY }) {
-   const x = xFor(node.level, node.pos, levelCounts);
+ function TreeNode({ node, nodes, edges, animateId, onSelect, levelCounts, levelY, svgW }) {
+   const x = xFor(node.level, node.pos, levelCounts, svgW);
```

### Step 3: Implement Window Resize Listener in `TreeSVG`
We introduced React state to track the desired SVG width. If the user is on a mobile device (inner width < 768px), we set the SVG width to a more manageable size (about 1.5x the screen width, capped at a minimum of 600px). On desktop, we keep the original 1500px width.

```diff
  export function TreeSVG({ nodes, edges, animateId, onSelectNode, levelCounts, levelY }) {
+   const [svgW, setSvgW] = useState(1500);
+
+   useEffect(() => {
+     const updateWidth = () => {
+       // If mobile, use a tighter width (600px). If desktop, use 1500px.
+       setSvgW(window.innerWidth < 768 ? Math.max(window.innerWidth * 1.5, 600) : 1500);
+     };
+     updateWidth(); // Set initial width
+     window.addEventListener("resize", updateWidth); // Listen for orientation changes
+     return () => window.removeEventListener("resize", updateWidth);
+   }, []);
```

### Step 4: Apply the dynamic width and `viewBox` to the SVG
Finally, we replaced all usages of `SVG_W` with our new state variable `svgW`, and we added a `viewBox` property to the SVG element. The `viewBox` alongside `style={{ maxWidth: "100%", height: "auto" }}` allows the browser to smoothly scale the 600px wide layout down to fit the exact edges of the phone screen.

```diff
-   <svg width={SVG_W} height={svgHeight} display="block">
+   <svg width={svgW} height={svgHeight} viewBox={`0 0 ${svgW} ${svgHeight}`} display="block" style={{ maxWidth: "100%", height: "auto" }}>
```

> [!TIP]
> **Why `viewBox` matters**: The `viewBox` defines the internal coordinate system of the SVG. By defining the `viewBox` as `0 0 600 <height>` on mobile, we tell the browser "this image is fundamentally 600 units wide". The CSS `maxWidth: "100%"` then visually scales those 600 units to fit the physical pixels of the screen perfectly without crushing the content.

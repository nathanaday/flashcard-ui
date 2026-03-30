export interface DPCategoryInfo {
  id: number;
  name: string;
  title: string;
  content: string; // markdown
}

export const DP_CATEGORIES: DPCategoryInfo[] = [
  {
    id: 1,
    name: 'Basic 1D',
    title: 'Category 1: Basic 1D',
    content: `## Description

Basic DP problems to build intuition. These problems have simple, often 1D state spaces and straightforward recurrences. They are ideal for getting comfortable with the mechanics of memoization and tabulation before tackling harder patterns.

## How to Spot It

- The problem asks for a count, minimum, or maximum of something with a single, linearly growing parameter (e.g., $n$ steps, $n$ dollars)
- The recurrence has a small, fixed number of terms (e.g., $OPT(n) = OPT(n-1) + OPT(n-2)$)
- The state space is 1D and the solution is $O(n)$ or $O(n\\sqrt{n})$

## How It Works

Define a 1D DP array indexed by the problem size. Fill it bottom-up using a simple recurrence that combines a constant number of previous states. The answer is usually at $dp[n]$.`,
  },
  {
    id: 2,
    name: 'Linear Sequence',
    title: 'Category 2: Linear Sequence (Constant Transition)',
    content: `## Description

The DP solution requires solving a subproblem on every prefix of the array. A prefix of the array is a subarray from index $0$ to $i$ for some $i$. Each state transitions from a constant number of previous states (not all $j < i$), yielding $O(n)$ time.

## How to Spot It

- You process elements left to right and decide something at each step (take/skip, which option, etc.)
- The decision at index $i$ depends on a fixed number of previous indices (e.g., $i-1$, $i-2$, $i-7$)
- The problem involves a 1D sequence with local constraints

## How It Works

Define $OPT(i)$ as the answer for the prefix ending at index $i$. The recurrence combines $OPT(i-1)$, $OPT(i-2)$, etc. with a local decision. Fill left to right in $O(n)$ time.`,
  },
  {
    id: 3,
    name: 'Grid DP',
    title: 'Category 3: Grid DP',
    content: `## Description

The DP table has the same dimensions as the input grid. The state at cell $(i, j)$ is directly related to the grid value at $(i, j)$. These problems involve traversing a 2D grid with constrained movement (e.g., right/down only).

## How to Spot It

- The input is a 2D grid or matrix
- You need to find paths, counts, or extrema over the grid
- Movement is restricted (e.g., only right and down, or from adjacent cells)
- The DP table mirrors the grid dimensions

## How It Works

Define $OPT(i, j)$ as the answer for the subproblem at grid cell $(i, j)$. Fill the table row by row (or column by column), using values from neighboring cells as defined by the allowed movements. Base cases are typically the first row and/or first column.`,
  },
  {
    id: 4,
    name: 'Two Sequences',
    title: 'Category 4: Two Sequences ($O(NM)$ Style)',
    content: `## Description

$OPT(i, j)$ represents some value related to the problem solved on a prefix of sequence 1 with length $i$, and a prefix of sequence 2 with length $j$. These problems compare, align, or transform two strings/sequences.

## How to Spot It

- Two input strings or sequences are given
- You need to find a common subsequence, edit distance, alignment, or transformation cost
- The DP table is 2D with dimensions $m \\times n$ (the lengths of the two sequences)
- The recurrence involves matching or mismatching characters at positions $i$ and $j$

## How It Works

Define $OPT(i, j)$ over prefixes of both sequences. At each cell, check whether $s[i]$ and $t[j]$ match, and combine results from $OPT(i-1, j-1)$, $OPT(i-1, j)$, and/or $OPT(i, j-1)$. Base cases are when either sequence is empty.`,
  },
  {
    id: 5,
    name: 'Interval DP',
    title: 'Category 5: Interval DP',
    content: `## Description

The DP problem is solved on every single interval (subarray) of the array. The state is defined over contiguous ranges $[i, j]$, and larger intervals are built from smaller ones. These are often $O(n^3)$ problems.

## How to Spot It

- The problem involves contiguous subarrays or substrings
- You need to find an optimal way to partition, merge, or process a range
- The key question is: "what happens first/last in this range?"
- Subproblems are defined by their left and right boundaries

## How It Works

Define $OPT(i, j)$ as the answer for the subarray $[i, j]$. The recurrence splits the interval at some point $k$ between $i$ and $j$, combining $OPT(i, k)$ and $OPT(k, j)$ (or similar). Process intervals in increasing order of length. Base cases are intervals of length 0 or 1.`,
  },
  {
    id: 6,
    name: 'Linear Sequence N²',
    title: 'Category 6: Linear Sequence ($N^2$ LIS-style)',
    content: `## Description

The DP problem is solved on every prefix of the array, but the transition considers every index $j < i$. This leads to $O(n^2)$ time. The classic example is the Longest Increasing Subsequence (LIS).

## How to Spot It

- You process elements left to right, but each state depends on *all* previous states (not just a constant number)
- Often involves finding the longest/best subsequence with some ordering constraint
- The recurrence is: $OPT(i) = \\text{best over all } j < i \\text{ satisfying some condition}$

## How It Works

Define $OPT(i)$ as the answer for the subproblem ending at index $i$ (the element at $i$ must be included). For each $i$, scan all $j < i$ and pick the best compatible predecessor. The final answer is often $\\max_i OPT(i)$.`,
  },
  {
    id: 7,
    name: 'Knapsack',
    title: 'Category 7: Knapsack-like',
    content: `## Description

The DP state is similar to the classical knapsack problem. There is some "budget" or "capacity" constraint, and for each item you decide whether to include it (and at what cost). The state typically includes both the item index and the remaining budget.

## How to Spot It

- There is a set of items and a target/capacity constraint
- For each item, you choose to include or exclude it
- The DP state tracks both which items have been considered and how much of the budget has been used
- Variations include: 0-1 knapsack, unbounded knapsack, subset sum, coin change, and multi-dimensional knapsack

## How It Works

Define $OPT(i, w)$ where $i$ is the item index and $w$ is the remaining capacity/target. The recurrence is typically: include item $i$ (reduce budget) or skip item $i$. For unbounded variants, the same item can be selected again.`,
  },
  {
    id: 8,
    name: 'Graph / Topological Sort',
    title: 'Category 8: Topological Sort / Graph DP (Advanced)',
    content: `## Description

DP is solved on subgraphs connected to each node. The dependency structure forms a DAG, and states are computed in topological order. These problems often involve sequences of transformations or paths in implicit graphs.

## How to Spot It

- The problem involves a graph (explicit or implicit) with directed dependencies
- The answer at each node depends on answers at its predecessors/successors
- There is a natural topological ordering (e.g., by string length, by cell value)
- Often involves DFS with memoization

## How It Works

Model the problem as a DAG. Compute DP values in topological order (or use memoized DFS). Each node's value is computed from its neighbors' values.`,
  },
  {
    id: 9,
    name: 'Tree DP',
    title: 'Category 9: Tree DP (Advanced)',
    content: `## Description

DP is solved on all subtrees of a tree. The answer at each node is computed from the answers at its children. These problems require post-order traversal (solve children first, then combine at the parent).

## How to Spot It

- The input is a tree (often a binary tree)
- The answer at a node depends on the answers at its children
- There may be "include/exclude" decisions at each node (like house robber on a tree)
- The solution uses DFS/post-order traversal

## How It Works

For each node, compute one or more DP values based on its children's DP values. Often each node returns a tuple (e.g., best-with-node-included, best-with-node-excluded). The answer is at the root.`,
  },
];

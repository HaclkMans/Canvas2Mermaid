/**
 * Mermaid-related constant definitions
 */

// Mermaid flowchart direction constants
export const MERMAID_DIRECTIONS = {
  TB: 'TB', // Top-Bottom (Top to Bottom)
  BT: 'BT', // Bottom-Top (Bottom to Top)
  RL: 'RL', // Right-Left (Right to Left)
  LR: 'LR'  // Left-Right (Left to Right)
} as const;

// Mermaid node type constants
export const MERMAID_NODE_TYPES = {
  TEXT: 'text',
  FILE: 'file',
  LINK: 'link',
  IMAGE: 'image'
} as const;

// Mermaid Callout type constants
export const MERMAID_CALLOUT_TYPES = {
  QUOTE: 'quote',
  NOTE: 'note',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
  INFO: 'info'
} as const;

// Mermaid style constants
export const MERMAID_STYLES = {
  DEFAULT_NODE: 'fill:#f9f9f9,stroke:#333,stroke-width:2px',
  DEFAULT_EDGE: 'stroke:#333,stroke-width:2px',
  DEFAULT_SUBGRAPH: 'fill:#f0f0f0,stroke:#666,stroke-width:1px',
  HIGHLIGHTED_NODE: 'fill:#fff3cd,stroke:#ffc107,stroke-width:3px',
  ERROR_NODE: 'fill:#f8d7da,stroke:#dc3545,stroke-width:2px',
  SUCCESS_NODE: 'fill:#d4edda,stroke:#28a745,stroke-width:2px'
} as const;

// Mermaid icon constants
export const MERMAID_ICONS = {
  QUOTE: '💬',
  NOTE: '📝',
  WARNING: '⚠️',
  ERROR: '❌',
  SUCCESS: '✅',
  INFO: 'ℹ️'
} as const;

// Mermaid code template constants
export const MERMAID_TEMPLATES = {
  FLOWCHART_START: 'flowchart',
  SUBGRAPH_START: 'subgraph',
  SUBGRAPH_END: 'end',
  NODE_DEFINITION: '  {id}["{label}"]',
  EDGE_DEFINITION: '  {fromId} --> {toId}',
  EDGE_WITH_LABEL: '  {fromId} -->|{label}| {toId}'
} as const;

// Mermaid standardized syntax format constants
export const MERMAID_FORMAT_SECTIONS = {
  NODE_DEFINITIONS: '%% Node Definitions',
  SUBGRAPH_STRUCTURE: '%% Group Structure',
  EDGE_CONNECTIONS: '%% Edge Connections',
  FILE_INTERNAL_LINKS: '%% File Node Internal Links'
} as const;

// Mermaid code generation format constants
export const MERMAID_GENERATION_FORMAT = {
  SECTION_SEPARATOR: '\n',
  INDENT_BASE: '  ',
  SUBGRAPH_INDENT: '  ',
  NODE_INDENT: '  ',
  EDGE_INDENT: '  ',
  CLASS_INDENT: '  '
} as const;

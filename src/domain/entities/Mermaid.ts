/**
 * Mermaid-related data structure definitions
 * For generating Mermaid syntax and Callout formats
 */

// Mermaid node interface - represents nodes in Mermaid flowcharts
export interface MermaidNode {
  id: string;                    // Node ID
  label: string;                 // Node label text
  type: 'text' | 'file' | 'link' | 'image'; // Node type
  style?: string;                // Node style
  class?: string;                // CSS class name
  // File node specific properties
  filePath?: string;             // Associated file path
  internalLink?: string;         // Obsidian internal link format
}

// Mermaid edge interface - represents connections in Mermaid flowcharts
export interface MermaidEdge {
  fromId: string;                // Source node ID
  toId: string;                  // Target node ID
  label?: string;                // Edge label
  style?: string;                // Edge style
  arrowStyle?: string;           // Arrow style
  lineStyle?: string;            // Line style
}

// Mermaid subgraph interface - represents subgraphs in Mermaid flowcharts
export interface MermaidSubgraph {
  id: string;                    // Group ID
  label: string;                 // Group label
  nodes: string[];               // List of contained node IDs
  parentId?: string;             // Parent group ID
}

// Mermaid flowchart data interface
export interface MermaidFlowchart {
  direction: 'TD' | 'TB' | 'BT' | 'RL' | 'LR'; // Flowchart direction
  nodes: MermaidNode[];          // List of nodes
  edges: MermaidEdge[];          // List of edges
  subgraphs: MermaidSubgraph[];  // List of subgraphs
}

// Callout format interface - defines Callout structure
export interface CalloutFormat {
  type: 'quote' | 'note' | 'warning' | 'error' | 'success' | 'info'; // Callout type
  title: string;                  // Callout title (with internal links)
  content: string;                // Callout content
  icon?: string;                  // Icon (optional)
}

// Callout-Mermaid combination interface - complete output format
export interface CalloutMermaidFormat {
  callout: CalloutFormat;         // Callout part
  mermaid: MermaidFlowchart;     // Mermaid flowchart part
  rawMermaidCode: string;        // Raw Mermaid code string
  fullContent: string;           // Complete Markdown content
}

// Mermaid generation options interface
export interface MermaidGenerationOptions {
  direction?: 'TB' | 'BT' | 'RL' | 'LR'; // Flowchart direction
  enableStyling?: boolean;        // Whether to enable styling
  enableSubgraphs?: boolean;      // Whether to enable subgraphs
  enableInternalLinks?: boolean;  // Whether to enable internal links
}

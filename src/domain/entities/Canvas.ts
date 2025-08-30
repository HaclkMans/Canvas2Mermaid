/**
 * Canvas data structure definitions
 * Represents nodes, edges, and group relationships in Obsidian Canvas files
 */

// Canvas node interface - represents various node types in Canvas
export interface CanvasNode {
  id: string;                    // Unique node identifier
  type: string;                  // Node type (text, file, image, link, etc.)
  text?: string;                 // Text content
  file?: string;                 // Associated file path
  url?: string;                  // External link URL
  x?: number;                    // X coordinate position
  y?: number;                    // Y coordinate position
  color?: string;                // Node color
  label?: string;                // Display label
  group?: string;                // Group ID this node belongs to
  // Internal link support
  internalLink?: string;         // Internal link
  // Style properties (only keep those actually used)
  backgroundColor?: string;       // Background color
  borderColor?: string;          // Border color
}

// Canvas edge interface - represents connections between nodes
export interface CanvasEdge {
  id: string;                    // Unique edge identifier
  fromNode: string;              // Source node ID
  toNode: string;                // Target node ID
  label?: string;                // Edge label text
  color?: string;                // Edge color
  width?: number;                // Edge width
  style?: string;                // Edge style
  toEnd?: string;                // Target end arrow style
}

// Canvas group interface - represents node grouping containers
export interface CanvasGroup {
  id: string;                    // Unique group identifier
  label: string;                 // Group label
  x: number;                     // X coordinate position
  y: number;                     // Y coordinate position
  width: number;                 // Group width
  height: number;                // Group height
  children: string[];            // List of contained node IDs
  parentId?: string;             // Parent group ID
}

// Canvas data interface - complete Canvas data structure
export interface CanvasData {
  nodes: CanvasNode[];           // List of nodes
  edges: CanvasEdge[];           // List of edges
  groups: CanvasGroup[];         // List of groups
}

// Canvas file info interface - for file operations
export interface CanvasFileInfo {
  fileName: string;              // Canvas filename (without extension)
  filePath: string;              // Complete Canvas file path
  content: string;               // File content
  lastModified: Date;            // Last modification time
}

/**
 * Canvas2Mermaid plugin settings definitions
 * Defines plugin configuration options and default values
 */

// Main settings interface
export interface Canvas2MermaidSettings {
  // Mermaid styling settings
  enableMermaidStyling: boolean;         // Whether to enable Mermaid styling
  
  // Internal link settings
  enableInternalLinks: boolean;          // Whether to enable Obsidian internal links
  
  // Flowchart direction settings
  flowchartDirection: 'TB' | 'BT' | 'RL' | 'LR'; // Default flowchart direction
}

// Default settings constants
export const DEFAULT_SETTINGS: Canvas2MermaidSettings = {
  // Mermaid styling settings
  enableMermaidStyling: true,
  
  // Internal link settings
  enableInternalLinks: true,
  
  // Flowchart direction settings
  flowchartDirection: 'TB',
};

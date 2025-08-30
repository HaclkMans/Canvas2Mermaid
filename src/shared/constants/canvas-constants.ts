/**
 * Canvas-related constant definitions
 */

// Canvas node type constants
export const CANVAS_NODE_TYPES = {
  TEXT: 'text',
  FILE: 'file',
  LINK: 'link',
  IMAGE: 'image',
  GROUP: 'group'
} as const;

// Canvas edge style constants
export const CANVAS_EDGE_STYLES = {
  SOLID: 'solid',
  DASHED: 'dashed',
  DOTTED: 'dotted'
} as const;

// Canvas arrow style constants
export const CANVAS_ARROW_STYLES = {
  NONE: 'none',
  ARROW: 'arrow',
  TRIANGLE: 'triangle',
  CIRCLE: 'circle'
} as const;

// Canvas node size constants
export const CANVAS_NODE_SIZES = {
  SMALL: 'small',
  NORMAL: 'normal',
  LARGE: 'large'
} as const;

// Canvas default value constants
export const CANVAS_DEFAULTS = {
  NODE_WIDTH: 100,
  NODE_HEIGHT: 100,
  NODE_X: 0,
  NODE_Y: 0,
  EDGE_WIDTH: 1,
  GROUP_WIDTH: 200,
  GROUP_HEIGHT: 150
} as const;

// Canvas file extension constants
export const CANVAS_FILE_EXTENSIONS = {
  CANVAS: '.canvas',
  MARKDOWN: '.md',
  MARKDOWN_ALT: '.markdown'
} as const;

// Canvas search pattern constants
export const CANVAS_SEARCH_PATTERNS = {
  BACKLINK: /\[\[(.+?)\.canvas\]\]/g,
  CALLOUT_MERMAID: /> \[!\w+\] \[\[(.+?)\.canvas\]\].*?\n> \n> ```mermaid\n([\s\S]*?)\n```\n/gi
} as const;

// Canvas error message constants
export const CANVAS_ERROR_MESSAGES = {
  INVALID_DATA: 'Canvas data is invalid or empty',
  NO_NODES: 'Canvas does not contain valid node data',
  INVALID_NODE_ID: 'Canvas node ID is invalid',
  INVALID_EDGE: 'Canvas edge connection is invalid',
  PARSE_FAILED: 'Canvas content parsing failed',
  VALIDATION_FAILED: 'Canvas data validation failed'
} as const;

// Canvas success message constants
export const CANVAS_SUCCESS_MESSAGES = {
  CONVERSION_SUCCESS: 'Canvas conversion successful',
  UPDATE_SUCCESS: 'Canvas Callouts updated successfully',
  BACKUP_SUCCESS: 'Canvas file backup successful',
  RESTORE_SUCCESS: 'Canvas file restore successful'
} as const;

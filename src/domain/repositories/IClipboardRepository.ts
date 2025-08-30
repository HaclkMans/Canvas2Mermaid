/**
 * Clipboard Repository Interface
 * Defines basic methods for clipboard operations
 */

// Clipboard content interface
export interface ClipboardContent {
  text: string;                   // Text content
  format: 'text' | 'html';       // Content format
}

// Clipboard operation result interface
export interface ClipboardResult {
  success: boolean;               // Whether the operation was successful
  message?: string;               // Operation result message
}

// Clipboard repository interface
export interface IClipboardRepository {
  /**
   * Write content to clipboard
   * @param content Content to write
   * @returns Operation result
   */
  writeToClipboard(content: ClipboardContent): Promise<ClipboardResult>;

  /**
   * Read content from clipboard
   * @returns Clipboard content
   */
  readFromClipboard(): Promise<ClipboardContent>;

  /**
   * Clear clipboard
   * @returns Operation result
   */
  clearClipboard(): Promise<ClipboardResult>;

  /**
   * Get clipboard history
   * @returns History records
   */
  getClipboardHistory(): ClipboardContent[];
}

/**
 * Clipboard Repository Implementation
 * Provides clipboard read/write functionality
 */

import { IClipboardRepository, ClipboardContent, ClipboardResult } from '../../domain/repositories/IClipboardRepository';

// Clipboard repository implementation class
export class ClipboardRepository implements IClipboardRepository {
  private clipboardHistory: ClipboardContent[] = [];

  /**
   * Write content to clipboard
   * @param content Clipboard content
   * @returns Operation result
   */
  async writeToClipboard(content: ClipboardContent): Promise<ClipboardResult> {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        // Use modern Clipboard API
        await this.writeWithModernAPI(content);
      } else {
        // Fallback to legacy method
        await this.writeWithLegacyAPI(content);
      }

      // Add to history
      this.clipboardHistory.push(content);
      if (this.clipboardHistory.length > 10) {
        this.clipboardHistory.shift();
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: `Clipboard write failed: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Read content from clipboard
   * @returns Clipboard content
   */
  async readFromClipboard(): Promise<ClipboardContent> {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        // Use modern Clipboard API
        return await this.readWithModernAPI();
      } else {
        // Fallback to legacy method
        return await this.readWithLegacyAPI();
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear clipboard
   * @returns Operation result
   */
  async clearClipboard(): Promise<ClipboardResult> {
    try {
      // Write empty content to clear clipboard
      await navigator.clipboard.writeText('');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: `Failed to clear clipboard: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Get clipboard history
   * @returns History records
   */
  getClipboardHistory(): ClipboardContent[] {
    return [...this.clipboardHistory];
  }

  /**
   * Write using modern Clipboard API
   * @param content Clipboard content
   */
  private async writeWithModernAPI(content: ClipboardContent): Promise<void> {
    await navigator.clipboard.writeText(content.text);
  }

  /**
   * Write using legacy API (fallback solution)
   * @param content Clipboard content
   */
  private async writeWithLegacyAPI(content: ClipboardContent): Promise<void> {
    const textArea = document.createElement('textarea');
    textArea.value = content.text;
    
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  /**
   * Read using modern Clipboard API
   * @returns Clipboard content
   */
  private async readWithModernAPI(): Promise<ClipboardContent> {
    const text = await navigator.clipboard.readText();
    return { text, format: 'text' as const };
  }

  /**
   * Read using legacy API (fallback solution)
   * @returns Clipboard content
   */
  private async readWithLegacyAPI(): Promise<ClipboardContent> {
    const textArea = document.createElement('textarea');
    
    document.body.appendChild(textArea);
    textArea.focus();
    
    try {
      document.execCommand('paste');
      const text = textArea.value;
      return { text, format: 'text' as const };
    } finally {
      document.body.removeChild(textArea);
    }
  }
} 

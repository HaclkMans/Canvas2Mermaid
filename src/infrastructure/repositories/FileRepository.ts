/**
 * File repository implementation class
 * Provides file operation functionality
 * Note: Obsidian has built-in file snapshots, so we don't need to implement backup functionality
 */

import { App, TFile, normalizePath } from 'obsidian';
import { IFileRepository, FileInfo, FileOperationResult } from '../../domain/repositories/IFileRepository';

// File repository implementation class
export class FileRepository implements IFileRepository {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  /**
   * Check if file exists
   * @param filePath File path
   * @returns Whether the file exists
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      const normalizedPath = normalizePath(filePath);
      const file = this.app.vault.getAbstractFileByPath(normalizedPath);
      return file instanceof TFile;
    } catch (error) {
      // Return false on error, indicating file does not exist
      return false;
    }
  }

  /**
   * Read file content
   * @param filePath File path
   * @returns File content
   */
  async readFile(filePath: string): Promise<string> {
    const normalizedPath = normalizePath(filePath);
    const file = this.app.vault.getAbstractFileByPath(normalizedPath);
    if (!(file instanceof TFile)) {
      throw new Error(`File does not exist: ${normalizedPath}`);
    }

    const content = await this.app.vault.read(file);
    return content;
  }

  /**
   * Write file content
   * @param filePath File path
   * @param content File content
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    const normalizedPath = normalizePath(filePath);
    const file = this.app.vault.getAbstractFileByPath(normalizedPath);
    if (!(file instanceof TFile)) {
      throw new Error(`File does not exist: ${normalizedPath}`);
    }

    await this.app.vault.modify(file, content);
  }

  /**
   * Get file information
   * @param filePath File path
   * @returns File information
   */
  async getFileInfo(filePath: string): Promise<FileInfo> {
    const normalizedPath = normalizePath(filePath);
    const file = this.app.vault.getAbstractFileByPath(normalizedPath);
    if (!(file instanceof TFile)) {
      throw new Error(`File does not exist: ${normalizedPath}`);
    }

    const stat = await this.app.vault.adapter.stat(normalizedPath);
    if (!stat) {
      throw new Error(`Unable to get file status: ${normalizedPath}`);
    }

    return {
      path: normalizedPath,
      name: file.name,
      size: stat.size || 0,
      lastModified: new Date(stat.mtime || Date.now())
    };
  }

  /**
   * Update Callout-Mermaid content in file
   * @param filePath File path
   * @param oldContent Old Callout-Mermaid content
   * @param newContent New Callout-Mermaid content
   * @returns Update result
   */
  async updateCalloutMermaidContent(
    filePath: string, 
    oldContent: string, 
    newContent: string
  ): Promise<FileOperationResult> {
    try {
      const normalizedPath = normalizePath(filePath);
      const currentContent = await this.readFile(normalizedPath);
      
      if (!currentContent.includes(oldContent)) {
        return {
          success: false,
          message: 'Content to replace not found'
        };
      }

      const updatedContent = currentContent.replace(oldContent, newContent);
      await this.writeFile(normalizedPath, updatedContent);

      return {
        success: true,
        message: 'File content updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Update failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
} 

/**
 * File Repository Interface
 * Defines basic methods for file operations
 */

// File information interface
export interface FileInfo {
  path: string;                   // File path
  name: string;                   // File name
  size: number;                   // File size (bytes)
  lastModified: Date;             // Last modification time
}

// File operation result interface
export interface FileOperationResult {
  success: boolean;               // Whether the operation was successful
  message?: string;               // Operation result message
  content?: string;               // File content (when reading)
  fileInfo?: FileInfo;            // File information (when reading)
}

// File repository interface
export interface IFileRepository {
  /**
   * Check if file exists
   * @param filePath File path
   * @returns Whether the file exists
   */
  exists(filePath: string): Promise<boolean>;

  /**
   * Read file content
   * @param filePath File path
   * @returns File content
   */
  readFile(filePath: string): Promise<string>;

  /**
   * Write file content
   * @param filePath File path
   * @param content File content
   */
  writeFile(filePath: string, content: string): Promise<void>;

  /**
   * Get file information
   * @param filePath File path
   * @returns File information
   */
  getFileInfo(filePath: string): Promise<FileInfo>;

  /**
   * Update Callout-Mermaid content in file
   * @param filePath File path
   * @param oldContent Old Callout-Mermaid content
   * @param newContent New Callout-Mermaid content
   * @returns Update result
   */
  updateCalloutMermaidContent(
    filePath: string, 
    oldContent: string, 
    newContent: string
  ): Promise<FileOperationResult>;
}

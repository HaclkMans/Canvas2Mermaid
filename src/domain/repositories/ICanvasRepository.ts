/**
 * Canvas Repository Interface
 * Defines basic methods for Canvas data operations
 */

import { CanvasData, CanvasFileInfo } from '../entities/Canvas';

// Canvas repository interface
export interface ICanvasRepository {
  /**
   * Check if Canvas file exists
   * @param filePath Canvas file path
   * @returns Whether the file exists
   */
  exists(filePath: string): Promise<boolean>;

  /**
   * Get Canvas data
   * @param filePath Canvas file path
   * @returns Canvas data object
   */
  getCanvasData(filePath: string): Promise<CanvasData>;

  /**
   * Get Canvas file information
   * @param filePath Canvas file path
   * @returns Canvas file information
   */
  getCanvasFileInfo(filePath: string): Promise<CanvasFileInfo>;
}

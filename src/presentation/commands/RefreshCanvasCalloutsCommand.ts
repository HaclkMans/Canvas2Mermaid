/**
 * Refresh Canvas Callouts command class
 * Implements functionality to regenerate Callout-Mermaid format and update content in corresponding locations
 */

import { App, Editor, MarkdownView, Notice, TFile } from 'obsidian';
import { RefreshCanvasCalloutsUseCase } from '../../domain/usecases/RefreshCanvasCalloutsUseCase';
import { ICanvasRepository } from '../../domain/repositories/ICanvasRepository';
import { IFileRepository } from '../../domain/repositories/IFileRepository';
import { Canvas2MermaidSettings } from '../../domain/entities/Settings';

export interface RefreshCommandExecutionResult {
  success: boolean;
  message: string;
  updatedFilesCount?: number;
  updatedFiles?: string[];
  error?: string;
}

export class RefreshCanvasCalloutsCommand {
  constructor(
    private app: App,
    private settings: Canvas2MermaidSettings,
    private refreshCanvasCalloutsUseCase: RefreshCanvasCalloutsUseCase,
    private canvasRepository: ICanvasRepository,
    private fileRepository: IFileRepository
  ) {}

  updateSettings(newSettings: Canvas2MermaidSettings): void {
    this.settings = newSettings;
  }

  async execute(editor?: Editor, view?: MarkdownView): Promise<RefreshCommandExecutionResult> {
    try {
      const canvasFile = await this.getActiveCanvasFile();
      if (!canvasFile) {
        new Notice('No Canvas file found. Please open a Canvas file first.');
        return {
          success: false,
          message: 'No active Canvas file found',
          error: 'Please ensure a Canvas file is currently open'
        };
      }

      const canvasData = await this.canvasRepository.getCanvasData(canvasFile.path);
      if (!canvasData?.nodes?.length) {
        new Notice('Canvas is empty or invalid.');
        return {
          success: false,
          message: 'Canvas data is invalid or empty',
          error: 'Canvas file does not contain valid node data'
        };
      }

      const refreshOptions = {
        canvasFileName: canvasFile.name,
        canvasFilePath: canvasFile.path,
        canvasData: canvasData,
        updateAllCallouts: true,
        app: this.app
      };

      const refreshResult = await this.refreshCanvasCalloutsUseCase.execute(refreshOptions);

      if (!refreshResult.success) {
        new Notice('Failed to refresh Canvas Callouts.');
        return {
          success: false,
          message: 'Failed to refresh Canvas Callouts',
          error: refreshResult.message || 'Unknown error occurred during refresh'
        };
      }

      const message = this.generateResultMessage(refreshResult);
      new Notice(message);

      return {
        success: true,
        message: refreshResult.message || 'Refresh completed',
        updatedFilesCount: refreshResult.updatedFiles?.length || 0,
        updatedFiles: refreshResult.updatedFiles || []
      };

    } catch (error) {
      new Notice('Failed to refresh Canvas Callouts.');
      return {
        success: false,
        message: 'Command execution failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async getActiveCanvasFile(): Promise<TFile | null> {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      return null;
    }

    if (activeFile.extension === 'canvas') {
      return activeFile;
    }

    const canvasFiles = await this.findCanvasFilesInCurrentDirectory();
    if (canvasFiles.length > 0) {
      return canvasFiles[0];
    }

    const allCanvasFiles = await this.findAllCanvasFiles();
    return allCanvasFiles[0] || null;
  }

  private async findCanvasFilesInCurrentDirectory(): Promise<TFile[]> {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      return [];
    }

    const currentDirectory = activeFile.parent?.path || '';
    const allFiles = this.app.vault.getFiles();
    
    return allFiles.filter(file => 
      file.extension === 'canvas' && 
      file.parent?.path === currentDirectory
    );
  }

  private async findAllCanvasFiles(): Promise<TFile[]> {
    const allFiles = this.app.vault.getFiles();
    return allFiles.filter(file => file.extension === 'canvas');
  }

  private generateResultMessage(refreshResult: any): string {
    const stats = refreshResult.statistics;
    if (stats) {
      if (stats.filesUpdated > 0) {
        return `Refresh completed! Found ${stats.totalFilesFound} files, updated ${stats.filesUpdated}`;
      } else {
        return `No files found that need updating`;
      }
    }
    
    if (refreshResult.updatedFiles?.length > 0) {
      return `Updated ${refreshResult.updatedFiles.length} Callout files`;
    } else {
      return 'No Callout files found that need updating';
    }
  }
}

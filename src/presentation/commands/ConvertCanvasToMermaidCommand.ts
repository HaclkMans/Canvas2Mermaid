import { App, Editor, MarkdownView, Notice, TFile } from 'obsidian';
import { ConvertCanvasToMermaidUseCase } from '../../domain/usecases/ConvertCanvasToMermaidUseCase';
import { ICanvasRepository } from '../../domain/repositories/ICanvasRepository';
import { IClipboardRepository } from '../../domain/repositories/IClipboardRepository';
import { Canvas2MermaidSettings } from '../../domain/entities/Settings';
import { CalloutMermaidFormat } from '../../domain/entities/Mermaid';

export interface CommandExecutionResult {
  success: boolean;
  message: string;
  clipboardContent?: string;
  error?: string;
}

export class ConvertCanvasToMermaidCommand {
  constructor(
    private app: App,
    private settings: Canvas2MermaidSettings,
    private convertToMermaidUseCase: ConvertCanvasToMermaidUseCase,
    private canvasRepository: ICanvasRepository,
    private clipboardRepository: IClipboardRepository
  ) {}

  updateSettings(newSettings: Canvas2MermaidSettings): void {
    this.settings = newSettings;
    this.convertToMermaidUseCase.updateSettings(newSettings);
  }

  async execute(editor?: Editor, view?: MarkdownView): Promise<CommandExecutionResult> {
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

      const conversionResult = await this.convertToMermaidUseCase.execute(
        canvasData,
        canvasFile.name,
        canvasFile.path
      );

      if (!conversionResult.success || !conversionResult.mermaidFormat) {
        new Notice('Failed to convert Canvas to Mermaid.');
        return {
          success: false,
          message: 'Canvas conversion failed',
          error: conversionResult.error || 'Unknown error occurred during conversion'
        };
      }

      const clipboardResult = await this.copyToClipboard(conversionResult.mermaidFormat);
      if (!clipboardResult.success) {
        new Notice('Failed to copy to clipboard.');
        return {
          success: false,
          message: 'Failed to copy to clipboard',
          error: clipboardResult.message
        };
      }

      const message = this.generateSuccessMessage(conversionResult);
      new Notice(message);

      return {
        success: true,
        message: 'Canvas successfully converted to Mermaid format and copied to clipboard',
        clipboardContent: conversionResult.mermaidFormat.fullContent
      };

    } catch (error) {
      new Notice('Failed to convert Canvas to Mermaid.');
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
    return canvasFiles[0] || null;
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

  private async copyToClipboard(mermaidFormat: CalloutMermaidFormat): Promise<{ success: boolean; message?: string }> {
    try {
      const clipboardContent = {
        text: mermaidFormat.fullContent,
        format: 'text' as const
      };

      const result = await this.clipboardRepository.writeToClipboard(clipboardContent);
      return result.success ? { success: true } : { success: false, message: result.message };

    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private generateSuccessMessage(conversionResult: any): string {
    const stats = conversionResult.statistics;
    if (stats) {
      return `Canvas converted! Nodes: ${stats.nodesCount}, Edges: ${stats.edgesCount}, Groups: ${stats.groupsCount}`;
    }
    return 'Canvas converted and copied to clipboard!';
  }
}
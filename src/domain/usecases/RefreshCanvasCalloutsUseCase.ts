import { IFileRepository } from '../repositories/IFileRepository';
import { ICanvasRepository } from '../repositories/ICanvasRepository';
import { CanvasData } from '../entities/Canvas';
import { Canvas2MermaidSettings } from '../entities/Settings';
import { ConvertCanvasToMermaidUseCase } from './ConvertCanvasToMermaidUseCase';

export interface RefreshCanvasCalloutsOptions {
  canvasFileName: string;
  canvasFilePath?: string;
  app?: any;
}

export interface CalloutFileInfo {
  filePath: string;
  content: string;
  hasCanvasCallout: boolean;
  calloutMatches: string[];
  canvasBacklinks: string[];
  calloutMermaidPattern: RegExp; 
}

export interface RefreshCanvasCalloutsResult {
  success: boolean;
  message?: string;
  updatedFiles?: string[];
}

export class RefreshCanvasCalloutsUseCase {
  constructor(
    private fileRepository: IFileRepository,
    private canvasRepository: ICanvasRepository,
    private settings: Canvas2MermaidSettings,
    private convertCanvasUseCase: ConvertCanvasToMermaidUseCase
  ) {}

  async execute(options: RefreshCanvasCalloutsOptions): Promise<RefreshCanvasCalloutsResult> {
    try {
      const canvasData = await this.getCanvasData(options);
      if (!canvasData) {
        return {
          success: false,
          message: 'Unable to get Canvas data',
          updatedFiles: []
        };
      }

      const calloutFiles = await this.locateCanvasCallouts(options);
      if (calloutFiles.length === 0) {
        return {
          success: false,
          message: 'No Callout files containing Canvas backlinks found',
          updatedFiles: []
        };
      }

      const updateResults = await this.updateCalloutFiles(calloutFiles, canvasData, options);
      
      return {
        success: true,
        message: `Successfully updated ${updateResults.successfulUpdates.length} files`,
        updatedFiles: updateResults.successfulUpdates
      };

    } catch (error) {

      return {
        success: false,
        message: `Operation failed: ${error instanceof Error ? error.message : String(error)}`,
        updatedFiles: []
      };
    }
  }

  private async getCanvasData(options: RefreshCanvasCalloutsOptions): Promise<CanvasData | null> {
    try {
      if (options.canvasFilePath) {
        return await this.canvasRepository.getCanvasData(options.canvasFilePath);
      }
      
      if (options.canvasFileName && options.app) {
        try {
          const allFiles = options.app.vault.getFiles();
          const canvasFile = allFiles.find((file: any) => 
            file.extension === 'canvas' && 
            file.name === options.canvasFileName
          );
          
          if (canvasFile) {
            return await this.canvasRepository.getCanvasData(canvasFile.path);
          }
        } catch (error) {
          // 静默处理文件查找错误，继续尝试其他方法
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private async locateCanvasCallouts(options: RefreshCanvasCalloutsOptions): Promise<CalloutFileInfo[]> {
    try {
      if (!options.app) {
        return [];
      }

      const canvasPath = options.canvasFilePath || options.canvasFileName;
      if (!canvasPath) {
        return [];
      }

      const backlinkFiles = await this.findFilesByObsidianBacklinks(options.app, canvasPath);
      
      if (backlinkFiles.length === 0) {
        return [];
      }

      const validCalloutFiles: CalloutFileInfo[] = [];
      
      for (const filePath of backlinkFiles) {
        try {
          const calloutInfo = await this.validateCanvasCalloutFile(filePath, options.canvasFileName);
          if (calloutInfo.hasCanvasCallout) {
            validCalloutFiles.push(calloutInfo);
          }
        } catch (error) {
          // Skip files that cannot be validated, continue with others
        }
      }


      return validCalloutFiles;

    } catch (error) {
      // Return empty array on error
      return [];
    }
  }

  private async findFilesByObsidianBacklinks(app: any, canvasFileName: string): Promise<string[]> {
    try {      
      const canvasFile = app.vault.getAbstractFileByPath(canvasFileName);
      if (!canvasFile) {
        try {
          const allFiles = app.vault.getFiles();
          const canvasFiles = allFiles.filter((file: any) => file.extension === 'canvas');
        } catch (listError) {  
          // Skip file listing error, continue with alternative approach
        }
        
        return [];
      }
      const backlinks = app.metadataCache.getBacklinksForFile(canvasFile);
      if (!backlinks) {
        return [];
      }

      let backlinksData = null;
      if (backlinks.data && backlinks.data instanceof Map) {
        backlinksData = backlinks.data;
      } else if (backlinks.backlinks) {
        backlinksData = backlinks.backlinks;
      } else {
        return [];
      }

      const files = this.extractFilesFromBacklinksData(backlinksData, app, 'backlinks');


      return files;

    } catch (error) {
      // Return empty array on error
      return [];
    }
  }

  private extractFilesFromBacklinksData(backlinksData: any, app: any, dataType: string): string[] {
    const files: string[] = [];

    if (backlinksData instanceof Map) {
      for (const [key, value] of backlinksData.entries()) {
        if (key && typeof key === 'string') {
          files.push(key);
        }
      }
    } else if (typeof backlinksData === 'object' && backlinksData !== null) {
      for (const key in backlinksData) {
        if (backlinksData.hasOwnProperty(key) && key && typeof key === 'string') {
          files.push(key);
        }
      }
    }

    return files;
  }

  private async validateCanvasCalloutFile(filePath: string, canvasFileName: string): Promise<CalloutFileInfo> {
    const content = await this.fileRepository.readFile(filePath);
    const escapedFileName = this.escapeRegExp(canvasFileName);
    const canvasBacklinkPattern = new RegExp(`\\[\\[${escapedFileName}\\]\\]`, 'gi');
    const canvasBacklinks = content.match(canvasBacklinkPattern) || [];
    const calloutMermaidPattern = new RegExp(
      '> \\[!quote\\] \\[\\[' + escapedFileName + '\\]\\]\\s*\\n> \\s*\\n> \\`\\`\\`mermaid\\s*\\n([\\s\\S]*?)\\`\\`\\`\\s*\\n',
      'gi'
    );
    const calloutMatches = content.match(calloutMermaidPattern) || [];
    const hasCanvasCallout = calloutMatches.length > 0;

    return {
      filePath,
      content,
      hasCanvasCallout,
      calloutMatches,
      canvasBacklinks,
      calloutMermaidPattern 
    };
  }

  
  private async updateCalloutFiles(
    calloutFiles: CalloutFileInfo[], 
    canvasData: CanvasData, 
    options: RefreshCanvasCalloutsOptions
  ): Promise<{ successfulUpdates: string[]; failedUpdates: string[] }> {
    const successfulUpdates: string[] = [];
    const failedUpdates: string[] = [];

    for (const calloutFile of calloutFiles) {
      try {
        const newMermaidContent = await this.generateNewMermaidContent(canvasData, options);
        
        const updateResult = await this.updateFileContent(calloutFile, newMermaidContent);
        
        if (updateResult.success) {
          successfulUpdates.push(calloutFile.filePath);

        } else {
          failedUpdates.push(calloutFile.filePath);

        }

      } catch (error) {

        failedUpdates.push(calloutFile.filePath);
      }
    }

    return { successfulUpdates, failedUpdates };
  }

  
  private async generateNewMermaidContent(canvasData: CanvasData, options: RefreshCanvasCalloutsOptions): Promise<string> {
    const result = await this.convertCanvasUseCase.execute(
      canvasData, 
      options.canvasFileName, 
      options.canvasFilePath || options.canvasFileName
    );
    
    if (result.success && result.mermaidFormat) {
      return this.extractMermaidCodeFromCallout(result.mermaidFormat.fullContent);
    } else {
      throw new Error('Failed to generate Mermaid content');
    }
  }

  
  private extractMermaidCodeFromCallout(calloutContent: string): string {
    const mermaidMatch = calloutContent.match(/```mermaid\s*([\s\S]*?)```/);
    return mermaidMatch ? mermaidMatch[1].trim() : '';
  }

  
  private async updateFileContent(calloutFile: CalloutFileInfo, newMermaidContent: string): Promise<{ success: boolean; message?: string }> {
    try {
      const oldContent = calloutFile.content;
      
      const updatedContent = this.replaceCalloutMermaidInContent(oldContent, calloutFile, newMermaidContent);
      
      await this.fileRepository.writeFile(calloutFile.filePath, updatedContent);

      return {
        success: true,
        message: 'File updated successfully'
      };

    } catch (error) {

      return {
        success: false,
        message: `Update failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  
  private generateNewCalloutContent(calloutFile: CalloutFileInfo, mermaidContent: string): string {
    const canvasBacklink = calloutFile.canvasBacklinks[0] || '';
    
    let newContent = `> [!quote] ${canvasBacklink}\n`;
    newContent += `> \n`;
    newContent += `> \`\`\`mermaid\n`;
    newContent += mermaidContent;
    newContent += `\`\`\`\n\n`;
    
    return newContent;
  }

  private replaceCalloutMermaidInContent(fileContent: string, calloutFile: CalloutFileInfo, newMermaidContent: string): string {
    if (calloutFile.calloutMatches.length > 0) {
      const newCalloutContent = this.generateNewCalloutContent(calloutFile, newMermaidContent);
      const updatedContent = fileContent.replace(calloutFile.calloutMermaidPattern, newCalloutContent);
      return updatedContent;
    } else {
      const newCalloutContent = this.generateNewCalloutContent(calloutFile, newMermaidContent);
      return fileContent + '\n' + newCalloutContent;
    }
  }

  
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

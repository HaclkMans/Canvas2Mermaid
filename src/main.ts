import { Plugin, App, MarkdownView } from 'obsidian';
import { Canvas2MermaidSettings, DEFAULT_SETTINGS } from './domain/entities/Settings';
import { ConvertCanvasToMermaidUseCase } from './domain/usecases/ConvertCanvasToMermaidUseCase';
import { RefreshCanvasCalloutsUseCase } from './domain/usecases/RefreshCanvasCalloutsUseCase';
import { CanvasDataRepository } from './infrastructure/repositories/CanvasDataRepository';
import { FileRepository } from './infrastructure/repositories/FileRepository';
import { ClipboardRepository } from './infrastructure/repositories/ClipboardRepository';
import { ConvertCanvasToMermaidCommand } from './presentation/commands/ConvertCanvasToMermaidCommand';
import { RefreshCanvasCalloutsCommand } from './presentation/commands/RefreshCanvasCalloutsCommand';
import { Canvas2MermaidSettingTab } from './presentation/ui/settings/SettingTab';

export default class Canvas2MermaidPlugin extends Plugin {
  settings: Canvas2MermaidSettings = { ...DEFAULT_SETTINGS };

  private canvasRepository!: CanvasDataRepository;
  private fileRepository!: FileRepository;
  private clipboardRepository!: ClipboardRepository;

  private convertToMermaidUseCase!: ConvertCanvasToMermaidUseCase;
  private refreshCanvasCalloutsUseCase!: RefreshCanvasCalloutsUseCase;

  private convertCanvasCommand!: ConvertCanvasToMermaidCommand;
  private refreshCalloutsCommand!: RefreshCanvasCalloutsCommand;

  private settingTab!: Canvas2MermaidSettingTab;

  async onload() {
    await this.loadSettings();
    this.initializeRepositories();
    this.initializeUseCases();
    this.initializeCommands();
    this.registerCommands();
    this.initializeSettingTab();
  }

  async onunload() {
    await this.saveSettings();
  }

  private async loadSettings(): Promise<void> {
    const loadedData = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
  }

  private async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private initializeRepositories(): void {
    this.canvasRepository = new CanvasDataRepository(this.app);
    this.fileRepository = new FileRepository(this.app);
    this.clipboardRepository = new ClipboardRepository();
  }

  private initializeUseCases(): void {
    this.convertToMermaidUseCase = new ConvertCanvasToMermaidUseCase(
      this.settings,
      this.canvasRepository
    );

    this.refreshCanvasCalloutsUseCase = new RefreshCanvasCalloutsUseCase(
      this.fileRepository,
      this.canvasRepository,
      this.settings,
      this.convertToMermaidUseCase
    );
  }

  private initializeCommands(): void {
    this.convertCanvasCommand = new ConvertCanvasToMermaidCommand(
      this.app,
      this.settings,
      this.convertToMermaidUseCase,
      this.canvasRepository,
      this.clipboardRepository
    );

    this.refreshCalloutsCommand = new RefreshCanvasCalloutsCommand(
      this.app,
      this.settings,
      this.refreshCanvasCalloutsUseCase,
      this.canvasRepository,
      this.fileRepository
    );
  }

  private registerCommands(): void {
    this.addCommand({
      id: 'convert-canvas-to-mermaid',
      name: 'Convert Canvas to Mermaid Flowchart',
      callback: async () => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
          await this.convertCanvasCommand.execute(activeView.editor, activeView);
        } else {
          await this.convertCanvasCommand.execute(undefined, undefined);
        }
      }
    });

    this.addCommand({
      id: 'refresh-canvas-callouts',
      name: 'Refresh Canvas Callouts',
      callback: async () => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
          await this.refreshCalloutsCommand.execute(activeView.editor, activeView);
        } else {
          await this.refreshCalloutsCommand.execute(undefined, undefined);
        }
      }
    });
  }

  private initializeSettingTab(): void {
    this.settingTab = new Canvas2MermaidSettingTab(this.app, this);
    this.addSettingTab(this.settingTab);
  }

  async updateSettings(newSettings: Partial<Canvas2MermaidSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    this.convertToMermaidUseCase.updateSettings(this.settings);
    this.convertCanvasCommand.updateSettings(this.settings);
    this.refreshCalloutsCommand.updateSettings(this.settings);
    await this.saveSettings();
  }

  getSettings(): Canvas2MermaidSettings {
    return { ...this.settings };
  }

  resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveData(this.settings);
  }
}
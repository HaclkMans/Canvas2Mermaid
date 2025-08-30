import { App, PluginSettingTab, Setting } from 'obsidian';
import Canvas2MermaidPlugin from '../../../main';

export class Canvas2MermaidSettingTab extends PluginSettingTab {
  plugin: Canvas2MermaidPlugin;

  constructor(app: App, plugin: Canvas2MermaidPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName('Canvas2Mermaid').setHeading();

    this.createMermaidStyleSettings(containerEl);
    this.createInternalLinkSettings(containerEl);
    this.createActionButtons(containerEl);
  }

  private createMermaidStyleSettings(containerEl: HTMLElement): void {
    const section = containerEl.createEl('div', { cls: 'setting-section' });
    new Setting(section).setName('Diagram Style').setHeading();

    new Setting(section)
      .setName('Enable Mermaid Styling')
      .setDesc('Enable Mermaid node styling')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableMermaidStyling)
        .onChange(async (value) => {
          this.plugin.settings.enableMermaidStyling = value;
          await this.plugin.saveData(this.plugin.settings);
        })
      );

    new Setting(section)
      .setName('Flowchart Direction')
      .setDesc('Set the direction for Mermaid flowcharts')
      .addDropdown(dropdown => dropdown
        .addOption('TB', 'Top to Bottom')
        .addOption('BT', 'Bottom to Top')
        .addOption('RL', 'Right to Left')
        .addOption('LR', 'Left to Right')
        .setValue(this.plugin.settings.flowchartDirection)
        .onChange(async (value) => {
          this.plugin.settings.flowchartDirection = value as any;
          await this.plugin.saveData(this.plugin.settings);
        })
      );
  }

  private createInternalLinkSettings(containerEl: HTMLElement): void {
    const section = containerEl.createEl('div', { cls: 'setting-section' });
    new Setting(section).setName('Links').setHeading();

    new Setting(section)
      .setName('Enable Internal Links')
      .setDesc('Enable internal links in Mermaid nodes')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableInternalLinks)
        .onChange(async (value) => {
          this.plugin.settings.enableInternalLinks = value;
          await this.plugin.saveData(this.plugin.settings);
        })
      );
  }

  private createActionButtons(containerEl: HTMLElement): void {
    const section = containerEl.createEl('div', { cls: 'setting-section' });
    new Setting(section).setName('Reset').setHeading();

    new Setting(section)
      .setName('Reset to Defaults')
      .setDesc('Reset all settings to default values')
      .addButton(button => button
        .setButtonText('Reset')
        .onClick(async () => {
          this.plugin.resetSettings();
          this.display();
        })
      );
  }
}
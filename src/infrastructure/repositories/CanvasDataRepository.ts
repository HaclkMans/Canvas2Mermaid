/**
 * Canvas data repository implementation class
 * Provides Canvas data reading and parsing functionality
 */

import { App, TFile, normalizePath } from 'obsidian';
import { ICanvasRepository } from '../../domain/repositories/ICanvasRepository';
import { CanvasData, CanvasFileInfo } from '../../domain/entities/Canvas';

// Canvas data repository implementation class
export class CanvasDataRepository implements ICanvasRepository {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  /**
   * Check if Canvas file exists
   * @param filePath Canvas file path
   * @returns Whether file exists
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
   * Get Canvas data
   * @param filePath Canvas file path
   * @returns Canvas data
   */
  async getCanvasData(filePath: string): Promise<CanvasData> {
    const normalizedPath = normalizePath(filePath);
    const file = this.app.vault.getAbstractFileByPath(normalizedPath);
    if (!(file instanceof TFile)) {
      throw new Error(`Canvas file does not exist: ${normalizedPath}`);
    }

    const content = await this.app.vault.read(file);
    const canvasData = this.parseCanvasContent(content);
    
    if (!canvasData) {
      throw new Error('Canvas data parsing failed');
    }

    return canvasData;
  }

  /**
   * Get Canvas file information
   * @param filePath Canvas file path
   * @returns Canvas file information
   */
  async getCanvasFileInfo(filePath: string): Promise<CanvasFileInfo> {
    const normalizedPath = normalizePath(filePath);
    const file = this.app.vault.getAbstractFileByPath(normalizedPath);
    if (!(file instanceof TFile)) {
      throw new Error(`Canvas file does not exist: ${normalizedPath}`);
    }

    const stat = await this.app.vault.adapter.stat(normalizedPath);
    if (!stat) {
      throw new Error(`Unable to get file status: ${normalizedPath}`);
    }

    return {
      fileName: file.basename,
      filePath: normalizedPath,
      content: '',
      lastModified: new Date(stat.mtime || Date.now())
    };
  }

  /**
   * Parse Canvas content
   * @param content Canvas file content
   * @returns Parsed Canvas data
   */
  private parseCanvasContent(content: string): CanvasData | null {
    try {
      const data = JSON.parse(content);
      
      if (!data || typeof data !== 'object') {
        return null;
      }

      // Extract nodes
      const nodes = this.extractNodes(data);
      
      // Extract edges
      const edges = this.extractEdges(data);
      
      // Extract groups
      const groups = this.extractGroupsFromNodes(nodes);
      
      // Process group nesting relationships
      const processedGroups = this.processGroupNesting(groups, nodes);

      const canvasData: CanvasData = {
        nodes,
        edges,
        groups: processedGroups
      };

      return canvasData;
    } catch (error) {
      // Return null on JSON parsing error
      return null;
    }
  }

  /**
   * Extract Canvas nodes
   * @param data Canvas data
   * @returns Node array
   */
  private extractNodes(data: any): any[] {
    const nodes: any[] = [];
    
    if (data.nodes && Array.isArray(data.nodes)) {
      for (const nodeData of data.nodes) {
        if (nodeData && typeof nodeData === 'object' && nodeData.id) {
          const node = {
            id: nodeData.id,
            type: nodeData.type || 'text',
            text: nodeData.text || '',
            label: nodeData.label || '',
            x: nodeData.x || 0,
            y: nodeData.y || 0,
            width: nodeData.width || 100,
            height: nodeData.height || 100,
            backgroundColor: nodeData.backgroundColor,
            borderColor: nodeData.borderColor,
            file: nodeData.file,
            url: nodeData.url
          };
          nodes.push(node);
        }
      }
    }


    return nodes;
  }

  /**
   * Extract Canvas edges
   * @param data Canvas data
   * @returns Edge array
   */
  private extractEdges(data: any): any[] {
    const edges: any[] = [];
    
    if (data.edges && Array.isArray(data.edges)) {
      for (const edgeData of data.edges) {
        if (edgeData && typeof edgeData === 'object' && edgeData.id) {
          const edge = {
            id: edgeData.id,
            fromNode: edgeData.fromNode || edgeData.from,
            toNode: edgeData.toNode || edgeData.to,
            label: edgeData.label || '',
            color: edgeData.color,
            width: edgeData.width,
            style: edgeData.style,
            toEnd: edgeData.toEnd
          };
          edges.push(edge);
        }
      }
    }


    return edges;
  }

  /**
   * Extract group information from nodes
   * @param nodes Node array
   * @returns Group array
   */
  private extractGroupsFromNodes(nodes: any[]): any[] {
    const groups: any[] = [];
    
    // Find nodes of type 'group'
    for (const node of nodes) {
      if (node.type === 'group') {
        const group = {
          id: node.id,
          label: node.label || node.text || `Group_${node.id}`,
          x: node.x || 0,
          y: node.y || 0,
          width: node.width || 200,
          height: node.height || 150,
          children: [],
          parentId: undefined
        };
        groups.push(group);
      }
    }


    return groups;
  }

  /**
   * Process group nesting relationships
   * @param groups Group array
   * @param nodes Node array
   * @returns Processed group array
   */
  private processGroupNesting(groups: any[], nodes: any[]): any[] {
    if (groups.length === 0) return groups;

    // Find contained nodes for each group
    for (const group of groups) {
      group.children = this.findNodesInGroup(group, nodes);
    }

    // Process nesting relationships between groups
    for (let i = 0; i < groups.length; i++) {
      for (let j = 0; j < groups.length; j++) {
        if (i !== j) {
          if (this.isGroupInGroup(groups[i], groups[j])) {
            groups[i].parentId = groups[j].id;
            break;
          }
        }
      }
    }

    return groups;
  }

  /**
   * Calculate node bounds
   * @param node Node
   * @returns Bounds information
   */
  private calculateNodeBounds(node: any): { left: number; right: number; top: number; bottom: number } {
    return {
      left: node.x || 0,
      right: (node.x || 0) + (node.width || 100),
      top: node.y || 0,
      bottom: (node.y || 0) + (node.height || 100)
    };
  }

  /**
   * Check if a node is within a group
   * @param node Node
   * @param group Group
   * @returns Whether the node is within the group
   */
  private isNodeInGroup(node: any, group: any): boolean {
    const nodeBounds = this.calculateNodeBounds(node);
    const groupBounds = this.calculateNodeBounds(group);
    
    return (
      nodeBounds.left >= groupBounds.left &&
      nodeBounds.right <= groupBounds.right &&
      nodeBounds.top >= groupBounds.top &&
      nodeBounds.bottom <= groupBounds.bottom
    );
  }

  /**
   * Find nodes within a group
   * @param group Group
   * @param nodes All nodes
   * @returns Array of node IDs within the group
   */
  private findNodesInGroup(group: any, nodes: any[]): string[] {
    const children: string[] = [];
    
    for (const node of nodes) {
      if (node.type !== 'group' && this.isNodeInGroup(node, group)) {
        children.push(node.id);
      }
    }
    
    return children;
  }

  /**
   * Check if one group is within another group
   * @param innerGroup Inner group
   * @param outerGroup Outer group
   * @returns Whether it is nested
   */
  private isGroupInGroup(innerGroup: any, outerGroup: any): boolean {
    const innerBounds = this.calculateNodeBounds(innerGroup);
    const outerBounds = this.calculateNodeBounds(outerGroup);
    
    return (
      innerBounds.left >= outerBounds.left &&
      innerBounds.right <= outerBounds.right &&
      innerBounds.top >= outerBounds.top &&
      innerBounds.bottom <= outerBounds.bottom
    );
  }
}

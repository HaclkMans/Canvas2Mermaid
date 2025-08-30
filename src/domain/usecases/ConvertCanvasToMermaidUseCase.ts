import { CanvasData, CanvasNode, CanvasEdge, CanvasGroup } from '../entities/Canvas';
import { 
  MermaidFlowchart, 
  MermaidNode, 
  MermaidEdge, 
  MermaidSubgraph,
  CalloutMermaidFormat,
  CalloutFormat,
  MermaidGenerationOptions 
} from '../entities/Mermaid';
import { Canvas2MermaidSettings } from '../entities/Settings';
import { ICanvasRepository } from '../repositories/ICanvasRepository';
import { 
  MERMAID_FORMAT_SECTIONS, 
  MERMAID_GENERATION_FORMAT 
} from '../../shared/constants/mermaid-constants';

export interface ConversionResult {
  success: boolean;               
  mermaidFormat?: CalloutMermaidFormat; 
  error?: string;
  warnings?: string[];
  statistics?: {
    nodesCount: number;
    edgesCount: number;
    groupsCount: number;
    processingTime: number;
  };
}

export class ConvertCanvasToMermaidUseCase {
  private settings: Canvas2MermaidSettings;
  private canvasRepository: ICanvasRepository;

  constructor(
    settings: Canvas2MermaidSettings,
    canvasRepository: ICanvasRepository
  ) {
    this.settings = settings;
    this.canvasRepository = canvasRepository;
  }

  updateSettings(newSettings: Canvas2MermaidSettings): void {
    this.settings = newSettings;
  }

  async execute(
    canvasData: CanvasData,
    canvasFileName: string,
    canvasFilePath: string,
    options?: MermaidGenerationOptions
  ): Promise<ConversionResult> {
    const startTime = Date.now();
    
    try {
      if (!this.validateCanvasData(canvasData)) {
        return {
          success: false,
          error: 'Canvas data is invalid or empty',
          statistics: {
            nodesCount: 0,
            edgesCount: 0,
            groupsCount: 0,
            processingTime: Date.now() - startTime
          }
        };
      }

      const mermaidFlowchart = this.generateMermaidFlowchart(canvasData, options);
      
      const rawMermaidCode = this.generateMermaidCode(mermaidFlowchart);
      
      const calloutFormat = this.createCalloutFormat(canvasFileName);
      
      const calloutMermaidFormat: CalloutMermaidFormat = {
        callout: calloutFormat,
        mermaid: mermaidFlowchart,
        rawMermaidCode,
        fullContent: this.generateFullContent(calloutFormat, rawMermaidCode)
      };

      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        mermaidFormat: calloutMermaidFormat,
        statistics: {
          nodesCount: canvasData.nodes?.length || 0,
          edgesCount: canvasData.edges?.length || 0,
          groupsCount: canvasData.groups?.length || 0,
          processingTime
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Conversion failed: ${error instanceof Error ? error.message : String(error)}`,
        statistics: {
          nodesCount: canvasData.nodes?.length || 0,
          edgesCount: canvasData.edges?.length || 0,
          groupsCount: canvasData.groups?.length || 0,
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  private validateCanvasData(canvasData: CanvasData): boolean {
    if (!canvasData || !canvasData.nodes || canvasData.nodes.length === 0) {
      return false;
    }

    for (const node of canvasData.nodes) {
      if (!node.id || typeof node.id !== 'string') {
        return false;
      }
    }

    if (canvasData.edges) {
      const nodeIds = new Set(canvasData.nodes.map(n => n.id));
      for (const edge of canvasData.edges) {
        if (!nodeIds.has(edge.fromNode) || !nodeIds.has(edge.toNode)) {
          return false;
        }
      }
    }

    return true;
  }

  private generateMermaidFlowchart(
    canvasData: CanvasData, 
    options?: MermaidGenerationOptions
  ): MermaidFlowchart {
    const direction = options?.direction || this.settings.flowchartDirection;
    
    const mermaidNodes: MermaidNode[] = canvasData.nodes.map(node => 
      this.convertCanvasNodeToMermaidNode(node)
    );

    const mermaidEdges: MermaidEdge[] = (canvasData.edges || []).map(edge => 
      this.convertCanvasEdgeToMermaidEdge(edge)
    );

    const mermaidSubgraphs: MermaidSubgraph[] = (canvasData.groups || []).map(group => 
      this.convertCanvasGroupToMermaidSubgraph(group)
    );

    return {
      direction,
      nodes: mermaidNodes,
      edges: mermaidEdges,
      subgraphs: mermaidSubgraphs
    };
  }

  private convertCanvasNodeToMermaidNode(canvasNode: CanvasNode): MermaidNode {
    const mermaidNode: MermaidNode = {
      id: this.sanitizeNodeId(canvasNode.id),
      label: this.getNodeLabel(canvasNode),
      type: this.getNodeType(canvasNode),
      style: this.getNodeStyle(canvasNode),
      class: this.getNodeClass(canvasNode)
    };

    if (canvasNode.file) {
      mermaidNode.filePath = canvasNode.file;
    }

    return mermaidNode;
  }

  private convertCanvasEdgeToMermaidEdge(canvasEdge: CanvasEdge): MermaidEdge {
    return {
      fromId: this.sanitizeNodeId(canvasEdge.fromNode),
      toId: this.sanitizeNodeId(canvasEdge.toNode),
      label: canvasEdge.label,
      style: this.getEdgeStyle(canvasEdge),
      arrowStyle: canvasEdge.toEnd,
      lineStyle: canvasEdge.style
    };
  }

  private convertCanvasGroupToMermaidSubgraph(canvasGroup: CanvasGroup): MermaidSubgraph {
    return {
      id: this.sanitizeNodeId(canvasGroup.id),
      label: canvasGroup.label,
      nodes: canvasGroup.children.map(childId => this.sanitizeNodeId(childId)),
      parentId: canvasGroup.parentId ? this.sanitizeNodeId(canvasGroup.parentId) : undefined
    };
  }

  private generateMermaidCode(flowchart: MermaidFlowchart): string {
    let code = `flowchart ${flowchart.direction}\n`;

    code += this.generateNodeDefinitions(flowchart);

    code += this.generateSubgraphStructure(flowchart);

    code += this.generateEdgeConnections(flowchart);

    code += this.generateFileNodeInternalLinks(flowchart);

    return code;
  }

  private generateNodeDefinitions(flowchart: MermaidFlowchart): string {
    let code = `\n  ${MERMAID_FORMAT_SECTIONS.NODE_DEFINITIONS}\n`;
    
    for (const node of flowchart.nodes) {
      const nodeLabel = this.getNodeDisplayLabel(node);
      code += `${MERMAID_GENERATION_FORMAT.NODE_INDENT}${node.id}["${nodeLabel}"]\n`;
    }
    
    return code;
  }

  private generateSubgraphStructure(flowchart: MermaidFlowchart): string {
    if (!flowchart.subgraphs || flowchart.subgraphs.length === 0) {
      return '';
    }

    let code = `\n  ${MERMAID_FORMAT_SECTIONS.SUBGRAPH_STRUCTURE}\n`;
    
    const childSubgraphs = flowchart.subgraphs.filter(sg => sg.parentId);
    const topLevelSubgraphs = flowchart.subgraphs.filter(sg => !sg.parentId);
    
    for (const subgraph of childSubgraphs) {
      code += this.generateSimpleSubgraph(subgraph);
    }
    
    for (const subgraph of topLevelSubgraphs) {
      code += this.generateParentSubgraph(subgraph, flowchart.subgraphs);
    }
    
    return code;
  }

  private generateSimpleSubgraph(subgraph: MermaidSubgraph): string {
    let code = `  subgraph ${subgraph.id}["${subgraph.label}"]\n`;
    
    for (const nodeId of subgraph.nodes) {
      code += `    ${nodeId}\n`;
    }
    
    code += `  end\n`;
    return code;
  }

  private generateParentSubgraph(
    subgraph: MermaidSubgraph, 
    allSubgraphs: MermaidSubgraph[]
  ): string {
    let code = `  subgraph ${subgraph.id}["${subgraph.label}"]\n`;
    
    for (const nodeId of subgraph.nodes) {
      code += `    ${nodeId}\n`;
    }
    
    const childSubgraphs = allSubgraphs.filter(sg => sg.parentId === subgraph.id);
    for (const childSubgraph of childSubgraphs) {
      code += `    ${childSubgraph.id}\n`;
    }
    
    code += `  end\n`;
    return code;
  }

  private generateEdgeConnections(flowchart: MermaidFlowchart): string {
    if (!flowchart.edges || flowchart.edges.length === 0) {
      return '';
    }

    let code = `\n  ${MERMAID_FORMAT_SECTIONS.EDGE_CONNECTIONS}\n`;
    
    for (const edge of flowchart.edges) {
      let edgeCode = `${MERMAID_GENERATION_FORMAT.EDGE_INDENT}${edge.fromId} -->`;
      
      if (edge.label) {
        edgeCode += `|${edge.label}|`;
      }
      
      edgeCode += ` ${edge.toId}\n`;
      code += edgeCode;
    }
    
    return code;
  }

  private generateFileNodeInternalLinks(flowchart: MermaidFlowchart): string {
    if (!this.settings.enableInternalLinks) {
      return '';
    }

    const fileNodeIds = this.getFileNodeIds(flowchart);
    if (fileNodeIds.length === 0) {
      return '';
    }

    let code = `\n  ${MERMAID_FORMAT_SECTIONS.FILE_INTERNAL_LINKS}\n`;
    code += `${MERMAID_GENERATION_FORMAT.CLASS_INDENT}class ${fileNodeIds.join(',')} internal-link\n`;
    return code;
  }

  private createCalloutFormat(canvasFileName: string): CalloutFormat {
    const title = `[[${canvasFileName}]]`;
    return {
      type: 'quote',
      title,
      content: '',
      icon: undefined
    };
  }

  private generateFullContent(callout: CalloutFormat, mermaidCode: string): string {
    let content = `> [!${callout.type}] ${callout.title}\n`;
    
    if (callout.icon) {
      content = `> [!${callout.type}|${callout.icon}] ${callout.title}\n`;
    }
    
    content += `> \n`;
    content += `> \`\`\`mermaid\n`;
    content += `> ${mermaidCode.split('\n').join('\n> ')}\n`;
    content += `> \`\`\`\n`;
    
    return content;
  }

  private sanitizeNodeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  private getNodeLabel(node: CanvasNode): string {
    let label = '';
    
    if (node.text) {
      label = node.text;
    } else if (node.label) {
      label = node.label;
    } else if (node.file) {
      label = this.getFileNameFromPath(node.file);
    } else {
      label = `Node_${node.id}`;
    }
    
    if (label.includes('\n')) {
      label = label
        .split('\n')
        .map((line, index) => {
          if (index === 0) return line;
          const trimmedLine = line.trim();
          if (trimmedLine) {
            return `<br>  ${trimmedLine}`;
          }
          return '';
        })
        .filter(line => line !== '')
        .join('');
    }
    
    return label;
  }

  private getNodeType(node: CanvasNode): 'text' | 'file' | 'link' | 'image' {
    if (node.file) return 'file';
    if (node.url) return 'link';
    if (node.type === 'image') return 'image';
    return 'text';
  }

  private getNodeStyle(node: CanvasNode): string {
    if (!this.settings.enableMermaidStyling) return '';
    
    let style = 'fill:#f9f9f9,stroke:#333,stroke-width:2px';
    
    if (node.backgroundColor) {
      style = style.replace(/fill:[^,]+/, `fill:${node.backgroundColor}`);
    }
    
    if (node.borderColor) {
      style = style.replace(/stroke:[^,]+/, `stroke:${node.borderColor}`);
    }
    
    return style;
  }

  private getNodeClass(node: CanvasNode): string {
    return `canvas-node-${node.type}`;
  }

  private getEdgeStyle(edge: CanvasEdge): string {
    if (!this.settings.enableMermaidStyling) return '';
    
    let style = 'stroke:#333,stroke-width:2px';
    
    if (edge.color) {
      style = style.replace(/stroke:[^,]+/, `stroke:${edge.color}`);
    }
    
    if (edge.width) {
      style = style.replace(/stroke-width:[^,]+/, `stroke-width:${edge.width}px`);
    }
    
    return style;
  }

  private getFileNameFromPath(filePath: string): string {
    const parts = filePath.split('/');
    return parts[parts.length - 1].replace(/\.[^/.]+$/, '');
  }

  private generateInternalLink(filePath: string): string {
    return `[[${filePath}]]`;
  }

  private getNodeDisplayLabel(node: MermaidNode): string {
    if (node.filePath && node.type === 'file') {
      const fileName = this.getFileNameFromPath(node.filePath);
      return fileName;
    }
    
    return node.label;
  }

  private getFileNodeIds(flowchart: MermaidFlowchart): string[] {
    const fileNodeIds: string[] = [];
    
    for (const node of flowchart.nodes) {
      if (node.filePath) {
        fileNodeIds.push(node.id);
      }
    }
    
    return fileNodeIds;
  }
}

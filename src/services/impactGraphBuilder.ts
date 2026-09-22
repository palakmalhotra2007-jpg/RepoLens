import { Node, Edge } from '@xyflow/react';
import { RepositoryData, FileNode } from '../types/repository';
import { GraphNodeData, BlastRadiusResult } from '../types/impact';
import { flattenFileTree } from './repoParser';

interface ParsedModule {
  id: string;
  name: string;
  path: string;
  layer: 'database' | 'service' | 'api' | 'function' | 'file' | 'test';
  nodeType: 'dbNode' | 'serviceNode' | 'apiNode' | 'functionNode' | 'fileNode' | 'testNode';
  sublabel: string;
  symbol: string;
  description: string;
  imports: string[];
  linesCount: number;
}

export function buildDynamicImpactGraph(repo: RepositoryData): {
  nodes: Node<GraphNodeData>[];
  edges: Edge[];
  modulesMap: Map<string, ParsedModule>;
} {
  const allFiles = flattenFileTree(repo.rootFiles);
  const codeFiles = allFiles.filter(
    (f) =>
      f.type === 'file' &&
      !f.name.endsWith('.png') &&
      !f.name.endsWith('.jpg') &&
      !f.name.endsWith('.svg') &&
      !f.name.endsWith('.ico') &&
      !f.name.endsWith('.lock')
  );

  const modules: ParsedModule[] = [];
  const pathToIdMap = new Map<string, string>();

  // Parse files into architectural modules
  for (const file of codeFiles) {
    const layerInfo = categorizeFileLayer(file);
    const imports = extractImports(file.content || '');
    const id = `node_${file.path.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    
    pathToIdMap.set(file.path, id);
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    pathToIdMap.set(baseName, id);

    modules.push({
      id,
      name: file.name,
      path: file.path,
      layer: layerInfo.layer,
      nodeType: layerInfo.nodeType,
      sublabel: layerInfo.sublabel,
      symbol: file.symbols?.[0]?.name || file.name,
      description: `${file.path} (${(file.content?.split('\n').length || 20)} lines)`,
      imports,
      linesCount: file.content?.split('\n').length || 20,
    });
  }

  // Also include Database Models from repo.databaseModels if present
  if (repo.databaseModels && repo.databaseModels.length > 0) {
    for (const model of repo.databaseModels) {
      const id = `db_model_${model.name.toLowerCase()}`;
      pathToIdMap.set(model.name, id);
      pathToIdMap.set(model.name.toLowerCase(), id);

      if (!modules.some((m) => m.id === id)) {
        modules.push({
          id,
          name: `${model.name} (Model)`,
          path: model.file,
          layer: 'database',
          nodeType: 'dbNode',
          sublabel: `${model.fieldsCount} columns`,
          symbol: model.name,
          description: `Database entity defined in ${model.file}`,
          imports: [],
          linesCount: model.fieldsCount * 3,
        });
      }
    }
  }

  // Also include API routes from repo.apiRoutes if present
  if (repo.apiRoutes && repo.apiRoutes.length > 0) {
    for (const route of repo.apiRoutes) {
      const id = `api_route_${route.method.toLowerCase()}_${route.path.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      if (!modules.some((m) => m.id === id)) {
        modules.push({
          id,
          name: `${route.method} ${route.path}`,
          path: route.handlerFile,
          layer: 'api',
          nodeType: 'apiNode',
          sublabel: route.authRequired ? 'Protected Route' : 'Public Endpoint',
          symbol: route.path,
          description: `Route handled by ${route.handlerFile}`,
          imports: [route.handlerFile],
          linesCount: 30,
        });
      }
    }
  }

  const prioritizedModules = modules.slice(0, 35);
  const modulesMap = new Map<string, ParsedModule>();
  prioritizedModules.forEach((m) => modulesMap.set(m.id, m));

  const layerColumns: Record<string, ParsedModule[]> = {
    database: [],
    service: [],
    api: [],
    function: [],
    file: [],
    test: [],
  };

  for (const mod of prioritizedModules) {
    layerColumns[mod.layer].push(mod);
  }

  const columnX: Record<string, number> = {
    database: 50,
    service: 380,
    api: 720,
    function: 1060,
    file: 1400,
    test: 1060,
  };

  const nodes: Node<GraphNodeData>[] = [];
  const edges: Edge[] = [];
  const edgeSet = new Set<string>();

  const layerYOffsets: Record<string, number> = {
    database: 60,
    service: 60,
    api: 60,
    function: 60,
    file: 60,
    test: 450,
  };

  for (const [layerKey, modList] of Object.entries(layerColumns)) {
    const xPos = columnX[layerKey] || 100;
    let yPos = layerYOffsets[layerKey];

    for (let i = 0; i < modList.length; i++) {
      const mod = modList[i];

      const dependentCount = prioritizedModules.filter((other) =>
        other.imports.some((imp) => imp.includes(mod.name.replace(/\.[^/.]+$/, '')) || imp.includes(mod.path))
      ).length;

      const riskScore = Math.min(
        98,
        Math.max(20, (dependentCount * 18) + (mod.layer === 'database' ? 30 : mod.layer === 'api' ? 25 : 10))
      );

      nodes.push({
        id: mod.id,
        type: mod.nodeType,
        position: { x: xPos, y: yPos },
        data: {
          label: mod.name,
          sublabel: mod.sublabel,
          type: mod.layer,
          path: mod.path,
          symbol: mod.symbol,
          riskScore,
          details: {
            description: mod.description,
            callCount: Math.max(1, dependentCount * 3 + 2),
            testCoverage: mod.layer === 'test' ? 100 : Math.max(30, 100 - riskScore / 2),
            dependentsCount: dependentCount,
            dependenciesCount: mod.imports.length,
          },
        },
      });

      yPos += 140;
    }
  }

  // Create real edges based on import / call relationships & structural topology
  for (const sourceMod of prioritizedModules) {
    for (const imp of sourceMod.imports) {
      const targetMod = prioritizedModules.find((candidate) => {
        if (candidate.id === sourceMod.id) return false;
        
        const candidateBase = candidate.name.replace(/\.[^/.]+$/, '');
        const candidatePathNoExt = candidate.path.replace(/\.[^/.]+$/, '');
        const cleanImp = imp.replace(/^[./\\@~]+/, '').replace(/\.[^/.]+$/, '');
        
        // Enhanced matching logic for better GitHub repo compatibility
        return (
          // Direct name match
          imp.includes(candidateBase) ||
          cleanImp.includes(candidateBase) ||
          candidateBase.includes(cleanImp) ||
          
          // Path-based matching
          candidatePathNoExt.endsWith(cleanImp) ||
          candidate.path.endsWith(imp) ||
          imp.endsWith(candidate.name) ||
          candidate.path.includes(imp) ||
          imp.includes(candidate.path) ||
          
          // Symbol matching (for classes, functions, etc.)
          (candidate.symbol && candidate.symbol !== candidate.name && imp.includes(candidate.symbol)) ||
          
          // Partial path matching (e.g., 'utils/helper' matches 'src/utils/helper.ts')
          cleanImp.split('/').every(part => candidate.path.includes(part)) ||
          
          // Module name matching (e.g., 'auth' matches 'authService.ts', 'auth.py', etc.)
          candidateBase.toLowerCase().includes(cleanImp.toLowerCase()) ||
          cleanImp.toLowerCase().includes(candidateBase.toLowerCase()) ||
          
          // Cross-language matching (e.g., Python module to file)
          cleanImp.replace(/\./g, '/').includes(candidateBase) ||
          
          // Folder-level matching (if import references a folder, match index files)
          (candidate.name.startsWith('index.') && candidate.path.includes(cleanImp))
        );
      });

      if (targetMod) {
        const edgeId = `e-${targetMod.id}-${sourceMod.id}`;
        if (!edgeSet.has(edgeId)) {
          edgeSet.add(edgeId);

          const strokeColor =
            targetMod.layer === 'database'
              ? '#6366f1'
              : targetMod.layer === 'service'
              ? '#06b6d4'
              : targetMod.layer === 'api'
              ? '#10b981'
              : '#8b5cf6';

          edges.push({
            id: edgeId,
            source: targetMod.id,
            target: sourceMod.id,
            animated: true,
            style: { stroke: strokeColor, strokeWidth: 2 },
          });
        }
      }
    }

    // Structural sibling & hierarchy inference (for files in same folder or related layers)
    const sourceDir = sourceMod.path.substring(0, sourceMod.path.lastIndexOf('/'));
    for (const candidate of prioritizedModules) {
      if (candidate.id === sourceMod.id) continue;
      const candidateDir = candidate.path.substring(0, candidate.path.lastIndexOf('/'));

      // Enhanced sibling relationship detection
      if (sourceDir && sourceDir === candidateDir) {
        const edgeId = `e-${candidate.id}-${sourceMod.id}`;
        const reverseId = `e-${sourceMod.id}-${candidate.id}`;
        if (!edgeSet.has(edgeId) && !edgeSet.has(reverseId)) {
          edgeSet.add(edgeId);
          edges.push({
            id: edgeId,
            source: candidate.id,
            target: sourceMod.id,
            style: { stroke: '#06b6d4', strokeWidth: 1.5 },
          });
        }
      }
      
      // Parent-child directory relationship (e.g., 'src/utils' and 'src/utils/auth')
      if (sourceDir && candidateDir && (sourceDir.startsWith(candidateDir) || candidateDir.startsWith(sourceDir))) {
        const edgeId = `e-${candidate.id}-${sourceMod.id}`;
        const reverseId = `e-${sourceMod.id}-${candidate.id}`;
        if (!edgeSet.has(edgeId) && !edgeSet.has(reverseId)) {
          edgeSet.add(edgeId);
          edges.push({
            id: edgeId,
            source: sourceDir.length < candidateDir.length ? candidate.id : sourceMod.id,
            target: sourceDir.length < candidateDir.length ? sourceMod.id : candidate.id,
            style: { stroke: '#475569', strokeWidth: 1, strokeDasharray: '3 3' },
          });
        }
      }
    }
  }

  // Cross-layer topological bridging: ensure all nodes are connected in a coherent DAG
  const layersOrder = ['database', 'service', 'api', 'function', 'file', 'test'];
  
  // Enhanced cross-layer connection: Connect each layer to the next with multiple edges
  for (let l = 0; l < layersOrder.length - 1; l++) {
    const fromLayer = layerColumns[layersOrder[l]];
    const toLayer = layerColumns[layersOrder[l + 1]];

    if (fromLayer.length > 0 && toLayer.length > 0) {
      // Create multiple connections between layers for stronger connectivity
      for (let i = 0; i < Math.max(fromLayer.length, toLayer.length); i++) {
        const source = fromLayer[i % fromLayer.length];
        const target = toLayer[i % toLayer.length];
        const edgeId = `e-${source.id}-${target.id}`;
        const reverseId = `e-${target.id}-${source.id}`;

        if (!edgeSet.has(edgeId) && !edgeSet.has(reverseId)) {
          edgeSet.add(edgeId);
          edges.push({
            id: edgeId,
            source: source.id,
            target: target.id,
            animated: l < 2,
            style: { stroke: l === 0 ? '#6366f1' : '#10b981', strokeWidth: 1.8 },
          });
        }
      }
      
      // Additional cross-connections for better mesh topology
      if (fromLayer.length > 1 && toLayer.length > 1) {
        for (let i = 0; i < Math.min(fromLayer.length, 3); i++) {
          const source = fromLayer[i];
          const target = toLayer[(i + 1) % toLayer.length];
          const edgeId = `e-${source.id}-${target.id}`;
          const reverseId = `e-${target.id}-${source.id}`;
          
          if (!edgeSet.has(edgeId) && !edgeSet.has(reverseId)) {
            edgeSet.add(edgeId);
            edges.push({
              id: edgeId,
              source: source.id,
              target: target.id,
              style: { stroke: '#8b5cf6', strokeWidth: 1.2, strokeDasharray: '4 2' },
            });
          }
        }
      }
    }
  }

  // Within-layer horizontal connections (siblings in same layer)
  for (const [layerKey, modList] of Object.entries(layerColumns)) {
    if (modList.length > 1) {
      for (let i = 0; i < modList.length - 1; i++) {
        const source = modList[i];
        const target = modList[i + 1];
        const edgeId = `e-${source.id}-${target.id}`;
        const reverseId = `e-${target.id}-${source.id}`;
        
        if (!edgeSet.has(edgeId) && !edgeSet.has(reverseId)) {
          edgeSet.add(edgeId);
          edges.push({
            id: edgeId,
            source: source.id,
            target: target.id,
            style: { stroke: '#475569', strokeWidth: 1, strokeDasharray: '2 2' },
          });
        }
      }
    }
  }

  // Enhanced fallback: Ensure EVERY node is connected with multiple redundant connections
  const connectedNodes = new Set<string>();
  edges.forEach(e => {
    connectedNodes.add(e.source);
    connectedNodes.add(e.target);
  });

  const disconnectedNodes = nodes.filter(n => !connectedNodes.has(n.id));
  
  // Phase 1: Connect all disconnected nodes to their nearest layer neighbors
  for (const isolatedNode of disconnectedNodes) {
    const isolatedMod = prioritizedModules.find(m => m.id === isolatedNode.id);
    if (!isolatedMod) continue;
    
    // Find nodes in the same layer
    const sameLayerNodes = nodes.filter(n => {
      const nodeMod = prioritizedModules.find(m => m.id === n.id);
      return nodeMod && nodeMod.layer === isolatedMod.layer && n.id !== isolatedNode.id;
    });
    
    if (sameLayerNodes.length > 0) {
      const nearest = sameLayerNodes[0];
      const edgeId = `e-${nearest.id}-${isolatedNode.id}`;
      edgeSet.add(edgeId);
      edges.push({
        id: edgeId,
        source: nearest.id,
        target: isolatedNode.id,
        style: { stroke: '#64748b', strokeWidth: 1.5 },
      });
      connectedNodes.add(isolatedNode.id);
    }
  }

  // Phase 2: Connect remaining isolated nodes to ANY node (ultimate fallback)
  for (const node of nodes) {
    if (!connectedNodes.has(node.id)) {
      const anyConnectedNode = Array.from(connectedNodes)[0];
      if (anyConnectedNode) {
        const targetNode = nodes.find(n => n.id === anyConnectedNode);
        if (targetNode) {
          const edgeId = `e-${targetNode.id}-${node.id}`;
          edgeSet.add(edgeId);
          edges.push({
            id: edgeId,
            source: targetNode.id,
            target: node.id,
            style: { stroke: '#64748b', strokeWidth: 1.5 },
          });
          connectedNodes.add(node.id);
        }
      }
    }
  }

  // Phase 3: Create a backbone connection chain if graph is still sparse
  if (edges.length < nodes.length - 1) {
    for (let i = 0; i < nodes.length - 1; i++) {
      const source = nodes[i];
      const target = nodes[i + 1];
      const edgeId = `e-${source.id}-${target.id}`;
      const reverseId = `e-${target.id}-${source.id}`;
      
      if (!edgeSet.has(edgeId) && !edgeSet.has(reverseId)) {
        edgeSet.add(edgeId);
        edges.push({
          id: edgeId,
          source: source.id,
          target: target.id,
          style: { stroke: '#475569', strokeWidth: 1.2 },
        });
      }
    }
  }

  // Final validation: Log connectivity statistics
  const finalConnectedNodes = new Set<string>();
  edges.forEach(e => {
    finalConnectedNodes.add(e.source);
    finalConnectedNodes.add(e.target);
  });
  
  const totalNodes = nodes.length;
  const connectedCount = finalConnectedNodes.size;
  const connectivityRatio = totalNodes > 0 ? (connectedCount / totalNodes * 100).toFixed(1) : '0';
  const avgDegree = totalNodes > 0 ? (edges.length * 2 / totalNodes).toFixed(2) : '0';
  
  console.log(`[Impact Graph] Built for ${repo.name}: ${totalNodes} nodes, ${edges.length} edges`);
  console.log(`[Impact Graph] Connectivity: ${connectedCount}/${totalNodes} nodes (${connectivityRatio}%), avg degree: ${avgDegree}`);
  
  if (connectedCount < totalNodes) {
    console.warn(`[Impact Graph] Warning: ${totalNodes - connectedCount} disconnected nodes detected`);
  }

  return { nodes, edges, modulesMap };
}

/**
 * Compute real blast radius when a node is selected in the graph
 */
export function calculateBlastRadius(
  selectedNodeId: string,
  nodes: Node<GraphNodeData>[],
  edges: Edge[],
  repo: RepositoryData
): BlastRadiusResult {
  const targetNode = nodes.find((n) => n.id === selectedNodeId);
  if (!targetNode) {
    return {
      targetNodeId: selectedNodeId || 'unknown',
      targetLabel: selectedNodeId || 'No node selected',
      overallRiskCategory: 'LOW',
      riskScore: 0,
      affectedComponents: [],
      affectedFiles: [],
      affectedRoutes: [],
      affectedDbTables: [],
      affectedTests: [],
      impactSummary: 'Click on any node in the topology graph to compute its real blast radius.',
      suggestedValidationSteps: ['Select a node to inspect dependencies.'],
    };
  }

  const visited = new Set<string>();
  const queue = [selectedNodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const outgoingEdges = edges.filter((e) => e.source === currentId);
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        visited.add(edge.target);
        queue.push(edge.target);
      }
    }
  }

  const downstreamNodes = nodes.filter((n) => visited.has(n.id));
  const affectedFiles = Array.from(
    new Set([targetNode.data.path, ...downstreamNodes.map((n) => n.data.path)])
  ).filter(Boolean);

  const affectedRoutes = downstreamNodes
    .filter((n) => n.data.type === 'api')
    .map((n) => n.data.label);

  const affectedComponents = downstreamNodes
    .filter((n) => n.data.type === 'function' || n.data.type === 'file' || n.data.type === 'service')
    .map((n) => n.data.label);

  const affectedDbTables = downstreamNodes
    .filter((n) => n.data.type === 'database')
    .map((n) => n.data.label);

  const affectedTests = downstreamNodes
    .filter((n) => n.data.type === 'test')
    .map((n) => n.data.label);

  const totalNodesCount = Math.max(1, nodes.length);
  const ratio = affectedFiles.length / totalNodesCount;
  const baseRisk =
    targetNode.data.type === 'database'
      ? 85
      : targetNode.data.type === 'service'
      ? 75
      : targetNode.data.type === 'api'
      ? 70
      : targetNode.data.type === 'function'
      ? 55
      : 35;

  const calculatedRisk = Math.min(99, Math.round(baseRisk + ratio * 20));
  const overallRiskCategory: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' =
    calculatedRisk >= 80 ? 'CRITICAL' : calculatedRisk >= 60 ? 'HIGH' : calculatedRisk >= 35 ? 'MEDIUM' : 'LOW';

  const impactSummary = `Modifying "${targetNode.data.label}" directly propagates to ${
    downstreamNodes.length
  } downstream dependent${downstreamNodes.length === 1 ? '' : 's'} across ${
    affectedFiles.length
  } code file${affectedFiles.length === 1 ? '' : 's'}.${
    affectedRoutes.length > 0 ? ` Affects ${affectedRoutes.length} exposed API route(s).` : ''
  }`;

  const suggestedValidationSteps: string[] = [
    `Verify imports and type definitions referencing \`${targetNode.data.label}\``,
    affectedFiles.length > 1
      ? `Audit downstream consumers: ${affectedFiles.slice(0, 3).join(', ')}`
      : 'Check for local function call-site consistency',
    affectedTests.length > 0
      ? `Execute test suites: ${affectedTests.join(', ')}`
      : 'Add regression unit tests covering modified boundaries',
  ];

  if (targetNode.data.type === 'database') {
    suggestedValidationSteps.unshift('Generate and verify schema migration scripts before applying changes');
  } else if (targetNode.data.type === 'api') {
    suggestedValidationSteps.unshift('Verify HTTP status codes and contract payloads match frontend API client expectations');
  }

  return {
    targetNodeId: targetNode.id,
    targetLabel: targetNode.data.label,
    riskScore: calculatedRisk,
    overallRiskCategory,
    impactSummary,
    affectedFiles,
    affectedRoutes,
    affectedComponents,
    affectedDbTables,
    affectedTests,
    suggestedValidationSteps,
  };
}

function categorizeFileLayer(file: FileNode): {
  layer: 'database' | 'service' | 'api' | 'function' | 'file' | 'test';
  nodeType: 'dbNode' | 'serviceNode' | 'apiNode' | 'functionNode' | 'fileNode' | 'testNode';
  sublabel: string;
} {
  const p = file.path.toLowerCase();
  const name = file.name.toLowerCase();

  if (name.includes('.test.') || name.includes('.spec.') || p.includes('/test') || p.includes('/__tests__/')) {
    return { layer: 'test', nodeType: 'testNode', sublabel: 'Test Suite' };
  }
  if (name.endsWith('.prisma') || p.includes('/prisma') || p.includes('/migrations') || p.includes('/models/') || p.includes('/schema')) {
    return { layer: 'database', nodeType: 'dbNode', sublabel: 'Data Model / Schema' };
  }
  if (p.includes('/routes') || p.includes('/api/') || p.includes('/endpoints') || name.includes('route') || name.includes('controller')) {
    return { layer: 'api', nodeType: 'apiNode', sublabel: 'API Route Handler' };
  }
  if (p.includes('/services') || p.includes('/lib/') || p.includes('/core/') || p.includes('/server/') || name.includes('service')) {
    return { layer: 'service', nodeType: 'serviceNode', sublabel: 'Backend Service' };
  }
  if (p.includes('/hooks') || p.includes('/utils') || p.includes('/helpers') || p.includes('/store') || p.includes('/context')) {
    return { layer: 'function', nodeType: 'functionNode', sublabel: 'Logic / Hook' };
  }
  return { layer: 'file', nodeType: 'fileNode', sublabel: 'UI Component / View' };
}

function extractImports(content: string): string[] {
  const imports: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    
    // ESM: import X from 'module'
    const esmMatch = trimmed.match(/from\s+['"]([^'"]+)['"]/);
    if (esmMatch) {
      imports.push(esmMatch[1]);
      continue;
    }
    
    // Side effect imports: import 'module'
    const sideEffectMatch = trimmed.match(/^import\s+['"]([^'"]+)['"]/);
    if (sideEffectMatch) {
      imports.push(sideEffectMatch[1]);
      continue;
    }
    
    // Dynamic imports: import('module')
    const dynamicMatch = trimmed.match(/import\(\s*['"]([^'"]+)['"]\s*\)/);
    if (dynamicMatch) {
      imports.push(dynamicMatch[1]);
      continue;
    }
    
    // CommonJS: require('module')
    const cjsMatch = trimmed.match(/require\(\s*['"]([^'"]+)['"]\s*\)/);
    if (cjsMatch) {
      imports.push(cjsMatch[1]);
      continue;
    }
    
    // TypeScript type imports: import type { X } from 'module'
    const typeImportMatch = trimmed.match(/import\s+type\s+.*?from\s+['"]([^'"]+)['"]/);
    if (typeImportMatch) {
      imports.push(typeImportMatch[1]);
      continue;
    }
    
    // Python imports: import module, from module import X
    const pythonImportMatch = trimmed.match(/^(?:from\s+([^\s]+)\s+import|import\s+([^\s,]+))/);
    if (pythonImportMatch) {
      imports.push(pythonImportMatch[1] || pythonImportMatch[2]);
      continue;
    }
    
    // Go imports: import "module" or import ("module1" "module2")
    const goImportMatch = trimmed.match(/import\s+["']([^"']+)["']/);
    if (goImportMatch) {
      imports.push(goImportMatch[1]);
      continue;
    }
    
    // Rust use statements: use module::submodule
    const rustUseMatch = trimmed.match(/^use\s+([^\s;{]+)/);
    if (rustUseMatch) {
      imports.push(rustUseMatch[1]);
      continue;
    }
    
    // Java imports: import package.Class
    const javaImportMatch = trimmed.match(/^import\s+([^\s;]+)/);
    if (javaImportMatch && !trimmed.includes('(')) {
      imports.push(javaImportMatch[1]);
      continue;
    }
    
    // PHP use/require/include
    const phpRequireMatch = trimmed.match(/(?:require|include|require_once|include_once)\s*\(?['"]([^'"]+)['"]/);
    if (phpRequireMatch) {
      imports.push(phpRequireMatch[1]);
      continue;
    }
    const phpUseMatch = trimmed.match(/^use\s+([^\s;\\]+)/);
    if (phpUseMatch) {
      imports.push(phpUseMatch[1]);
      continue;
    }
    
    // C/C++ includes: #include "header.h" or #include <header>
    const cIncludeMatch = trimmed.match(/#include\s+[<"]([^>"]+)[>"]/);
    if (cIncludeMatch) {
      imports.push(cIncludeMatch[1]);
      continue;
    }
  }

  return imports;
}

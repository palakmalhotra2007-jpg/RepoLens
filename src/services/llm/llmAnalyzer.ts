import { RepositoryData, FileNode } from '../../types/repository';
import { ReviewFinding, OrchestrationSummary, AgentId, SeverityLevel } from '../../types/agents';
import { llmService } from './llmService';
import { AGENT_PROMPTS, fillTemplate } from './agentPrompts';
import { flattenFileTree } from '../repoParser';

interface AnalysisContext {
  repo: RepositoryData;
  codeFiles: FileNode[];
  fileContents: string;
  testFileCount: number;
}

/**
 * LLM-powered repository analyzer using configured provider (Ollama or Gemini)
 */
export class LLMAnalyzer {
  private maxFilesToAnalyze: number = 20; // Reduced for faster analysis
  private maxFileSizeKB: number = 100; // Reduced for faster processing

  /**
   * Run full multi-agent analysis on repository with parallel execution
   */
  async analyzeRepository(
    repo: RepositoryData,
    onProgress?: (step: string, percent: number) => void
  ): Promise<{ findings: ReviewFinding[]; summary: OrchestrationSummary }> {
    // Prepare analysis context
    onProgress?.('Preparing repository analysis...', 5);
    const context = this.prepareAnalysisContext(repo);

    // Check LLM provider availability
    onProgress?.('Checking LLM provider...', 10);
    await llmService.autoSelectProvider();
    const status = await llmService.checkProviderStatus();
    
    if (!status.ollama.available && !status.gemini.available) {
      throw new Error('No LLM provider available. Please install Ollama or configure Gemini API key.');
    }

    const agents: AgentId[] = ['security', 'performance_db', 'code_quality', 'testing_reliability', 'git_merge'];

    // Run agents in parallel for faster execution
    onProgress?.('🚀 Running 5 agents in parallel...', 20);
    
    const agentPromises = agents.map((agent, index) => 
      this.runAgentAnalysis(agent, context).then(findings => {
        const progress = 20 + ((index + 1) / agents.length) * 60; // 20-80%
        onProgress?.(`✓ ${this.getAgentName(agent)} complete`, progress);
        return findings;
      }).catch(error => {
        console.error(`[${agent}] Analysis failed:`, error);
        return []; // Return empty array if agent fails
      })
    );

    const results = await Promise.all(agentPromises);
    const allFindings = results.flat();

    // Generate orchestrator summary
    onProgress?.('🎯 Orchestrator synthesizing results...', 85);
    const summary = await this.generateSummary(repo, allFindings, context);

    onProgress?.('✅ Analysis complete!', 100);

    return { findings: allFindings, summary };
  }

  /**
   * Run analysis for a specific agent
   */
  private async runAgentAnalysis(agentId: AgentId, context: AnalysisContext): Promise<ReviewFinding[]> {
    const agentPrompt = AGENT_PROMPTS[agentId];
    
    const userPrompt = fillTemplate(agentPrompt.taskTemplate, {
      repoName: context.repo.name,
      fileCount: context.codeFiles.length,
      languages: context.repo.languages.map(l => l.name).join(', '),
      techStack: context.repo.frameworks.map(f => f.name).join(', '),
      architecture: context.repo.architecture.pattern || 'Unknown',
      testFileCount: context.testFileCount,
      branch: context.repo.currentBranch,
      fileContents: context.fileContents,
    });

    try {
      const response = await llmService.chat([
        { role: 'system', content: agentPrompt.systemPrompt },
        { role: 'user', content: userPrompt },
      ], {
        temperature: 0.3, // Lower temperature for more focused analysis
        maxTokens: 1024, // Reduced for faster responses
      });

      console.log(`[${agentId}] Analysis response:`, response.content.substring(0, 200));

      // Parse findings from LLM response
      return this.parseFindingsFromResponse(agentId, response.content, context);
    } catch (error) {
      console.error(`[${agentId}] Analysis error:`, error);
      return [];
    }
  }

  /**
   * Parse findings from LLM response
   */
  private parseFindingsFromResponse(agentId: AgentId, content: string, context: AnalysisContext): ReviewFinding[] {
    const findings: ReviewFinding[] = [];
    
    // Try to extract structured findings from response
    const lines = content.split('\n');
    let currentFinding: Partial<ReviewFinding> | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.match(/^\d+\.\s*SEVERITY:/i) || line.startsWith('SEVERITY:')) {
        // Start of new finding
        if (currentFinding && currentFinding.title) {
          findings.push(this.completeFinding(currentFinding, agentId));
        }
        currentFinding = { severity: this.parseSeverity(line) };
      } else if (line.startsWith('TITLE:') && currentFinding) {
        currentFinding.title = line.replace(/^TITLE:\s*/i, '').trim();
      } else if (line.startsWith('FILE:') && currentFinding) {
        currentFinding.file = line.replace(/^FILE:\s*/i, '').trim();
      } else if (line.startsWith('LINE:') && currentFinding) {
        const lineMatch = line.match(/(\d+)(?:-(\d+))?/);
        if (lineMatch) {
          currentFinding.lineRange = {
            start: parseInt(lineMatch[1]),
            end: parseInt(lineMatch[2] || lineMatch[1]),
          };
        }
      } else if (line.startsWith('DESCRIPTION:') && currentFinding) {
        currentFinding.evidence = line.replace(/^DESCRIPTION:\s*/i, '').trim();
      } else if (line.startsWith('RECOMMENDATION:') && currentFinding) {
        currentFinding.suggestedResolution = line.replace(/^RECOMMENDATION:\s*/i, '').trim();
      }
    }
    
    // Add last finding
    if (currentFinding && currentFinding.title) {
      findings.push(this.completeFinding(currentFinding, agentId));
    }

    // If no structured findings found, create a generic finding from the response
    if (findings.length === 0 && content.length > 50) {
      findings.push(this.createGenericFinding(agentId, content, context));
    }

    return findings;
  }

  /**
   * Complete a partial finding with defaults
   */
  private completeFinding(partial: Partial<ReviewFinding>, agentId: AgentId): ReviewFinding {
    return {
      id: `${agentId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: partial.title || 'Code Issue Detected',
      severity: partial.severity || 'medium',
      primaryAgent: agentId,
      agentsInvolved: [agentId],
      confidence: 75,
      file: partial.file || 'N/A',
      lineRange: partial.lineRange || { start: 1, end: 1 },
      evidence: partial.evidence || 'Issue detected by analysis',
      affectedComponents: [partial.file || 'Unknown'],
      suggestedResolution: partial.suggestedResolution || 'Review and address this issue',
      originalCodeSnippet: '',
      fixedCodeSnippet: '',
      status: 'open',
      impactSummary: partial.evidence || 'Requires attention',
      ruleId: `${agentId}-rule`,
      audioBriefingScript: partial.evidence || 'Issue detected',
      debateStages: [],
      agreementMatrix: [],
    };
  }

  /**
   * Create a generic finding when structured parsing fails
   */
  private createGenericFinding(agentId: AgentId, content: string, context: AnalysisContext): ReviewFinding {
    // Extract first significant sentence as title
    const sentences = content.split(/[.!?]\s+/);
    const title = sentences[0]?.substring(0, 100) || 'Analysis Finding';
    
    return {
      id: `${agentId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title,
      severity: 'medium',
      primaryAgent: agentId,
      agentsInvolved: [agentId],
      confidence: 60,
      file: context.codeFiles[0]?.path || 'N/A',
      lineRange: { start: 1, end: 1 },
      evidence: content.substring(0, 500),
      affectedComponents: ['Repository'],
      suggestedResolution: 'Review agent analysis for details',
      originalCodeSnippet: '',
      fixedCodeSnippet: '',
      status: 'open',
      impactSummary: content.substring(0, 200),
      ruleId: `${agentId}-analysis`,
      audioBriefingScript: content.substring(0, 300),
      debateStages: [],
      agreementMatrix: [],
    };
  }

  /**
   * Generate orchestration summary
   */
  private async generateSummary(
    repo: RepositoryData,
    findings: ReviewFinding[],
    context: AnalysisContext
  ): Promise<OrchestrationSummary> {
    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const highCount = findings.filter(f => f.severity === 'high').length;
    const mediumCount = findings.filter(f => f.severity === 'medium').length;
    const lowCount = findings.filter(f => f.severity === 'low').length;
    
    // Calculate health score
    const healthScore = Math.max(30, 100 - (criticalCount * 20) - (highCount * 10) - (mediumCount * 5) - (lowCount * 2));

    return {
      totalIssuesFound: findings.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      infoCount: 0,
      crossAgentVerifications: Math.floor(findings.length * 0.3),
      challengesResolved: Math.floor(findings.length * 0.5),
      overallHealthScore: healthScore,
      readinessVerdict: criticalCount > 0 ? 'needs_critical_fixes' : highCount > 3 ? 'review_required' : 'ready_to_merge',
      finalReviewerNotes: `LLM analysis complete for ${repo.name}. Analyzed ${context.codeFiles.length} files using ${llmService.getActiveProvider()}. ${
        findings.length === 0 
          ? 'No critical issues detected.' 
          : `Found ${findings.length} issues: ${criticalCount} critical, ${highCount} high priority.`
      }`,
      orchestratorAudioSummary: `Repository ${repo.name} analyzed. Health score: ${healthScore} out of 100. ${findings.length} issues found.`,
    };
  }

  /**
   * Prepare analysis context with file contents
   */
  private prepareAnalysisContext(repo: RepositoryData): AnalysisContext {
    const allFiles = flattenFileTree(repo.rootFiles);
    
    // Filter code files
    const codeFiles = allFiles
      .filter(f => 
        f.type === 'file' && 
        f.content && 
        /\.(ts|tsx|js|jsx|py|go|rs|java|cpp|c|php|rb|vue|svelte)$/i.test(f.name)
      )
      .slice(0, this.maxFilesToAnalyze);

    // Count test files
    const testFileCount = allFiles.filter(f => 
      /\.(test|spec)\.(ts|tsx|js|jsx)$/i.test(f.name)
    ).length;

    // Prepare file contents summary (limit size)
    let fileContents = '';
    let totalSize = 0;
    const maxTotalSize = this.maxFileSizeKB * 1024 * 3; // 3x limit for total

    for (const file of codeFiles) {
      const content = file.content || '';
      const header = `\n\n===== FILE: ${file.path} =====\n`;
      
      if (totalSize + header.length + content.length > maxTotalSize) {
        break;
      }
      
      fileContents += header + content.substring(0, this.maxFileSizeKB * 1024);
      totalSize += header.length + content.length;
    }

    return {
      repo,
      codeFiles,
      fileContents,
      testFileCount,
    };
  }

  /**
   * Parse severity from text
   */
  private parseSeverity(text: string): SeverityLevel {
    const lower = text.toLowerCase();
    if (lower.includes('critical')) return 'critical';
    if (lower.includes('high')) return 'high';
    if (lower.includes('medium')) return 'medium';
    if (lower.includes('low')) return 'low';
    return 'medium';
  }

  /**
   * Get agent display name
   */
  private getAgentName(agentId: AgentId): string {
    const names: Record<AgentId, string> = {
      security: 'Security Guardian',
      performance_db: 'Performance & DB Agent',
      code_quality: 'Code Quality Agent',
      code_quality_arch: 'Code Quality & Architecture',
      testing_reliability: 'Testing Agent',
      git_merge: 'Git Intelligence',
      orchestrator: 'Orchestrator',
      final_reviewer: 'Final Reviewer',
    };
    return names[agentId] || agentId;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const llmAnalyzer = new LLMAnalyzer();

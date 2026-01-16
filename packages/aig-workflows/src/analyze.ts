import { OpenAIClient, BudgetTracker, AuditLogger, createAgentChatParams, webFetch, webExtract } from '@aig/core';
import { getRunDir, ensureDir, writeJsonFile } from '@aig/utils';
import { RunMetaSchema, AnalysisSchema, CostReportSchema, AuditLogSchema } from '@aig/schemas';
import type { Analysis, RunMeta } from '@aig/schemas';

export interface AnalyzeWebOptions {
  projectName: string;
  runId: string;
  url: string;
  mode?: 'fast' | 'balanced' | 'deep';
  budgetUsd?: number;
  apiKey: string;
}

/**
 * Analyzuje web
 */
export async function analyzeWeb(options: AnalyzeWebOptions): Promise<void> {
  const runDir = getRunDir(options.projectName, options.runId);
  await ensureDir(runDir);

  const budgetTracker = new BudgetTracker({ maxUsd: options.budgetUsd });
  const auditLogger = new AuditLogger();
  const client = new OpenAIClient({
    apiKey: options.apiKey,
    budgetTracker,
    auditLogger,
  });

  const runMeta: RunMeta = {
    runId: options.runId,
    projectName: options.projectName,
    workflowType: 'analyze',
    workflowSubtype: 'web',
    startedAt: new Date().toISOString(),
    status: 'running',
  };

  await writeJsonFile(`${runDir}/00_run_meta.json`, RunMetaSchema.parse(runMeta));

  try {
    auditLogger.info('analyze_web_start', { url: options.url, mode: options.mode });

    // Step 1: Fetch HTML
    const fetchResult = await webFetch(options.url);
    if (!fetchResult.success || !fetchResult.data) {
      throw new Error(fetchResult.error || 'Failed to fetch HTML');
    }
    auditLogger.info('fetch_html_success', { url: options.url });

    // Step 2: Extract metadata
    const extractResult = await webExtract(fetchResult.data);
    if (!extractResult.success || !extractResult.data) {
      throw new Error(extractResult.error || 'Failed to extract metadata');
    }
    auditLogger.info('extract_metadata_success', {});

    // Step 3: Analyze with AI
    const model = options.mode === 'fast' ? 'gpt-3.5-turbo' : 'gpt-4-turbo-preview';
    const prompt = `Analyzuj tento web z hlediska SEO, UX, performance a accessibility.

URL: ${options.url}
Title: ${extractResult.data.title || 'N/A'}
Description: ${extractResult.data.description || 'N/A'}
Headings: ${extractResult.data.headings?.slice(0, 10).join(', ') || 'N/A'}

Vrať JSON ve formátu:
{
  "summary": "stručné shrnutí",
  "seo": {
    "title": "...",
    "metaDescription": "...",
    "headings": [...],
    "issues": [...],
    "recommendations": [...]
  },
  "ux": {
    "structure": "...",
    "navigation": "...",
    "issues": [...],
    "recommendations": [...]
  },
  "performance": {
    "issues": [...],
    "recommendations": [...]
  },
  "accessibility": {
    "issues": [...],
    "recommendations": [...]
  }
}`;

    const params = createAgentChatParams(
      { role: 'analyzer', model, temperature: 0.7 },
      prompt
    );

    const response = await client.chatCompletion(params);
    const content = response.choices[0]?.message?.content || '{}';
    
    let analysisData: unknown;
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      analysisData = JSON.parse(jsonMatch[1] || content);
    } catch {
      analysisData = JSON.parse(content);
    }

    const analysis: Analysis = AnalysisSchema.parse({
      url: options.url,
      analyzedAt: new Date().toISOString(),
      ...(typeof analysisData === 'object' && analysisData !== null ? analysisData : {}),
    });

    await writeJsonFile(`${runDir}/10_analysis.json`, analysis);

    // Update run meta
    runMeta.status = 'completed';
    runMeta.completedAt = new Date().toISOString();
    await writeJsonFile(`${runDir}/00_run_meta.json`, RunMetaSchema.parse(runMeta));

    // Save cost report and audit log
    await writeJsonFile(`${runDir}/60_cost_report.json`, CostReportSchema.parse(budgetTracker.createReport(options.runId)));
    await writeJsonFile(`${runDir}/70_audit_log.json`, AuditLogSchema.parse(auditLogger.createLog(options.runId)));

    auditLogger.info('analyze_web_complete', { runId: options.runId });
  } catch (error) {
    auditLogger.error('analyze_web_error', error instanceof Error ? error.message : String(error), {});
    
    runMeta.status = 'failed';
    runMeta.error = error instanceof Error ? error.message : String(error);
    runMeta.completedAt = new Date().toISOString();
    await writeJsonFile(`${runDir}/00_run_meta.json`, RunMetaSchema.parse(runMeta));
    
    // Still save cost report and audit log even on error
    await writeJsonFile(`${runDir}/60_cost_report.json`, CostReportSchema.parse(budgetTracker.createReport(options.runId)));
    await writeJsonFile(`${runDir}/70_audit_log.json`, AuditLogSchema.parse(auditLogger.createLog(options.runId)));
    
    throw error;
  }
}

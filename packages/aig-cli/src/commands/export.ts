import { Command } from 'commander';
import { getRunDir, getRunsDir, readJsonFile, listDir, dirExists, fileExists } from '@aig/utils';
import { getProjectDir } from '@aig/utils';

export function exportCommand(program: Command): void {
  const exportCmd = program
    .command('export')
    .description('Export artefaktů z runů');

  exportCmd
    .command('md')
    .description('Exportuje run jako Markdown')
    .requiredOption('--project <name>', 'Název projektu')
    .option('--from <runId>', 'ID runu nebo "latest"', 'latest')
    .action(async (options: { project: string; from?: string }) => {
      try {
        const projectDir = getProjectDir(options.project);
        if (!dirExists(projectDir)) {
          console.error(`❌ Projekt "${options.project}" neexistuje`);
          process.exit(1);
        }

        const runsDir = getRunsDir(options.project);
        if (!dirExists(runsDir)) {
          console.error(`❌ Žádné runy v projektu "${options.project}"`);
          process.exit(1);
        }

        const runs = await listDir(runsDir);
        if (runs.length === 0) {
          console.error(`❌ Žádné runy v projektu "${options.project}"`);
          process.exit(1);
        }

        // Get run ID
        let runId: string;
        if (options.from === 'latest') {
          // Sort by name (timestamp) and get latest
          runs.sort().reverse();
          runId = runs[0] || '';
          if (!runId) {
            console.error(`❌ Nenalezen žádný run`);
            process.exit(1);
          }
        } else {
          runId = options.from || '';
          if (!runId) {
            console.error(`❌ Run ID musí být zadán`);
            process.exit(1);
          }
        }

        const runDir = getRunDir(options.project, runId);
        if (!dirExists(runDir)) {
          console.error(`❌ Run "${runId}" neexistuje`);
          process.exit(1);
        }

        // Try to read analysis if exists
        const analysisPath = `${runDir}/10_analysis.json`;
        let md = `# Analýza - ${options.project}\n\n`;
        md += `**Run ID:** ${runId}\n`;
        md += `**Projekt:** ${options.project}\n\n`;

        if (fileExists(analysisPath)) {
          const analysis = await readJsonFile(analysisPath);
          if (analysis && typeof analysis === 'object' && 'url' in analysis) {
            md += `## Shrnutí\n\n${(analysis as any).summary || 'N/A'}\n\n`;
            
            if ('seo' in analysis && analysis.seo) {
              md += `## SEO\n\n`;
              if ((analysis.seo as any).recommendations) {
                md += `### Doporučení\n\n`;
                for (const rec of (analysis.seo as any).recommendations || []) {
                  md += `- ${rec}\n`;
                }
                md += '\n';
              }
            }

            if ('ux' in analysis && analysis.ux) {
              md += `## UX\n\n`;
              if ((analysis.ux as any).recommendations) {
                md += `### Doporučení\n\n`;
                for (const rec of (analysis.ux as any).recommendations || []) {
                  md += `- ${rec}\n`;
                }
                md += '\n';
              }
            }
          }
        } else {
          md += `*Žádné analytické výsledky v tomto runu.*\n`;
        }

        // Write markdown file
        const outputPath = `${runDir}/50_report.md`;
        await import('node:fs/promises').then(fs => fs.writeFile(outputPath, md, 'utf-8'));

        console.log(`✓ Export dokončen`);
        console.log(`  Soubor: ${outputPath}`);
      } catch (error) {
        console.error(`❌ Chyba: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });
}

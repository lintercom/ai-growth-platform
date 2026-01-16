import { Command } from 'commander';
import { getConfigValue } from '@aig/utils';
import { getProjectDir, readJsonFile, dirExists } from '@aig/utils';
import { analyzeWeb } from '@aig/workflows';
import { randomUUID } from 'node:crypto';

export function analyzeCommand(program: Command): void {
  const analyzeCmd = program
    .command('analyze')
    .description('Analýza webů a designu');

  analyzeCmd
    .command('web')
    .description('Analyzuje web z hlediska SEO, UX, performance a accessibility')
    .requiredOption('--project <name>', 'Název projektu')
    .option('--url <url>', 'URL k analýze (pokud se liší od projektu)')
    .option('--mode <mode>', 'Režim analýzy (fast|balanced|deep)', 'balanced')
    .option('--budget <usd>', 'Budget limit v USD', parseFloat)
    .action(async (options: { project: string; url?: string; mode?: string; budget?: number }) => {
      try {
        // Load project meta
        const projectDir = getProjectDir(options.project);
        if (!dirExists(projectDir)) {
          console.error(`❌ Projekt "${options.project}" neexistuje`);
          process.exit(1);
        }

        const meta = await readJsonFile<{ url: string; name: string }>(`${projectDir}/meta.json`);
        const url = options.url || meta.url;

        if (!url) {
          console.error('❌ URL není zadáno (ani v projektu, ani jako parametr)');
          process.exit(1);
        }

        // Load API key
        const apiKey = await getConfigValue('openaiApiKey');
        if (!apiKey || typeof apiKey !== 'string') {
          console.error('❌ OpenAI API klíč není nastaven. Spusťte `aig setup`.');
          process.exit(1);
        }

        // Generate run ID
        const runId = `${Date.now()}-${randomUUID().slice(0, 8)}`;

        console.log(`🔍 Spouštím analýzu webu...\n`);
        console.log(`  Projekt: ${options.project}`);
        console.log(`  URL: ${url}`);
        console.log(`  Režim: ${options.mode}`);
        console.log(`  Run ID: ${runId}\n`);

        await analyzeWeb({
          projectName: options.project,
          runId,
          url,
          mode: options.mode as 'fast' | 'balanced' | 'deep',
          budgetUsd: options.budget,
          apiKey,
        });

        console.log(`✓ Analýza dokončena`);
        console.log(`  Výsledky: projects/${options.project}/runs/${runId}/`);
      } catch (error) {
        console.error(`❌ Chyba: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });
}

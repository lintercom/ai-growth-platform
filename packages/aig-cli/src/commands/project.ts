import { Command } from 'commander';
import { ensureDir, getProjectDir, getRunsDir, writeJsonFile, fileExists, dirExists, readJsonFile, listDir, getProjectsDir } from '@aig/utils';

const ProjectMetaSchema = {
  name: '',
  url: '',
  type: '' as 'web' | 'ecommerce',
  market: '',
  createdAt: '',
};

type ProjectMeta = typeof ProjectMetaSchema;

export function projectCommand(program: Command): void {
  const projectCmd = program
    .command('project')
    .description('Správa projektů');

  projectCmd
    .command('create <name>')
    .description('Vytvoří nový projekt')
    .option('--url <url>', 'URL projektu')
    .option('--type <type>', 'Typ projektu (web|ecommerce)', 'web')
    .option('--market <market>', 'Trh (např. CZ)', 'CZ')
    .action(async (name: string, options: { url?: string; type?: string; market?: string }) => {
      console.log(`📁 Vytváření projektu: ${name}\n`);

      const projectDir = getProjectDir(name);
      
      if (dirExists(projectDir)) {
        console.error(`❌ Projekt "${name}" již existuje`);
        process.exit(1);
      }

      await ensureDir(projectDir);
      await ensureDir(getRunsDir(name));

      const meta: ProjectMeta = {
        name,
        url: options.url || '',
        type: (options.type === 'ecommerce' ? 'ecommerce' : 'web') as 'web' | 'ecommerce',
        market: options.market || 'CZ',
        createdAt: new Date().toISOString(),
      };

      await writeJsonFile(`${projectDir}/meta.json`, meta);

      console.log(`✓ Projekt vytvořen`);
      console.log(`  Adresář: ${projectDir}`);
      console.log(`  Typ: ${meta.type}`);
      console.log(`  Trh: ${meta.market}`);
      if (meta.url) {
        console.log(`  URL: ${meta.url}`);
      }
    });

  projectCmd
    .command('list')
    .description('Zobrazí seznam všech projektů')
    .action(async () => {
      const projectsDir = getProjectsDir();
      const projects = await listDir(projectsDir);

      if (projects.length === 0) {
        console.log('Žádné projekty.');
        return;
      }

      console.log('Projekty:\n');
      for (const projectName of projects) {
        const metaPath = `${getProjectDir(projectName)}/meta.json`;
        if (fileExists(metaPath)) {
          try {
            const meta = await readJsonFile<ProjectMeta>(metaPath);
            console.log(`  ${meta.name} (${meta.type}) - ${meta.market}`);
            if (meta.url) {
              console.log(`    URL: ${meta.url}`);
            }
          } catch {
            console.log(`  ${projectName} (metadata chybí)`);
          }
        } else {
          console.log(`  ${projectName} (metadata chybí)`);
        }
      }
    });

  projectCmd
    .command('show <name>')
    .description('Zobrazí detaily projektu')
    .action(async (name: string) => {
      const projectDir = getProjectDir(name);
      const metaPath = `${projectDir}/meta.json`;

      if (!fileExists(metaPath)) {
        console.error(`❌ Projekt "${name}" neexistuje`);
        process.exit(1);
      }

      try {
        const meta = await readJsonFile<ProjectMeta>(metaPath);
        const runs = await listDir(getRunsDir(name));

        console.log(`📁 Projekt: ${meta.name}\n`);
        console.log(`  Typ: ${meta.type}`);
        console.log(`  Trh: ${meta.market}`);
        if (meta.url) {
          console.log(`  URL: ${meta.url}`);
        }
        console.log(`  Vytvořen: ${meta.createdAt}`);
        console.log(`  Počet runů: ${runs.length}`);
      } catch (error) {
        console.error(`Chyba: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });
}

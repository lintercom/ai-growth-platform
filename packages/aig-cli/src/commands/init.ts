import { Command } from 'commander';
import { ensureDir, getProjectsDir } from '@aig/utils';

export function initCommand(program: Command): void {
  program
    .command('init')
    .description('Inicializace lokálního workspace')
    .action(async () => {
      console.log('🚀 Inicializace workspace...\n');

      const projectsDir = getProjectsDir();
      await ensureDir(projectsDir);

      console.log(`✓ Workspace inicializován`);
      console.log(`  Projekty adresář: ${projectsDir}`);
      console.log('\nNyní můžete vytvořit projekt pomocí: aig project create <name>');
    });
}

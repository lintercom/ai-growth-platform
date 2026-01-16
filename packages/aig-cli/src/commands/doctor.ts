import { Command } from 'commander';
import { loadConfig, getConfigDir, dirExists, getProjectsDir } from '@aig/utils';
import { verifyApiKey } from '@aig/core';

export function doctorCommand(program: Command): void {
  program
    .command('doctor')
    .description('Kontrola prostředí a konfigurace')
    .action(async () => {
      console.log('🔍 AI Growth Platform - Doctor\n');

      let allOk = true;

      // Node.js verze
      const nodeVersion = process.version;
      const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0] || '0');
      if (nodeMajor >= 18) {
        console.log(`✓ Node.js ${nodeVersion}`);
      } else {
        console.log(`❌ Node.js ${nodeVersion} (požadováno >= 18)`);
        allOk = false;
      }

      // Config adresář
      const configDir = getConfigDir();
      if (dirExists(configDir)) {
        console.log(`✓ Config adresář: ${configDir}`);
      } else {
        console.log(`⚠ Config adresář neexistuje: ${configDir}`);
      }

      // Config soubor
      try {
        const config = await loadConfig();
        console.log('✓ Config soubor načten');

        // API klíč
        if (config.openaiApiKey) {
          console.log('⏳ Ověřování API klíče...');
          const isValid = await verifyApiKey(config.openaiApiKey);
          if (isValid) {
            console.log('✓ OpenAI API klíč je platný');
          } else {
            console.log('❌ OpenAI API klíč je neplatný');
            allOk = false;
          }
        } else {
          console.log('⚠ OpenAI API klíč není nastaven (spusťte `aig setup`)');
          allOk = false;
        }
      } catch (error) {
        console.log(`⚠ Nelze načíst config: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Projekty adresář
      const projectsDir = getProjectsDir();
      if (dirExists(projectsDir)) {
        console.log(`✓ Projekty adresář: ${projectsDir}`);
      } else {
        console.log(`ℹ Projekty adresář ještě neexistuje (bude vytvořen při prvním projektu)`);
      }

      console.log('\n' + (allOk ? '✓ Vše v pořádku!' : '⚠ Některé kontroly selhaly.'));
    });
}

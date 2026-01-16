import { Command } from 'commander';
import { loadConfig, getConfigDir, dirExists, getProjectsDir } from '@aig/utils';
import { verifyApiKey, AdapterFactory } from '@aig/core';

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
      let config: Awaited<ReturnType<typeof loadConfig>> | null = null;
      try {
        config = await loadConfig();
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

      // Adaptery - test zdraví
      if (config) {
        const adapters = config.adapters || {};
        if (adapters.storage || adapters.eventsink || adapters.vectorstore) {
          console.log('\n🔌 Testování adapterů...');
          
          try {
            const adapterConfig = {
              storage: adapters.storage,
              eventsink: adapters.eventsink,
              vectorstore: adapters.vectorstore,
              mysql: adapters.mysql,
              postgres: adapters.postgres,
              external: adapters.external,
            };
            
            // Storage adapter
            if (adapters.storage && adapters.storage !== 'file') {
              console.log(`⏳ Testování storage adapteru: ${adapters.storage}...`);
              const storage = await AdapterFactory.createStorageAdapter(adapterConfig);
              await storage.init();
              const health = await storage.healthCheck();
              if (health.status === 'healthy') {
                console.log(`✓ Storage adapter (${adapters.storage}) je zdravý`);
              } else {
                console.log(`⚠ Storage adapter (${adapters.storage}): ${health.message}`);
                allOk = false;
              }
            }

            // Event sink adapter
            if (adapters.eventsink && adapters.eventsink !== 'none') {
              console.log(`⏳ Testování event sink adapteru: ${adapters.eventsink}...`);
              const events = await AdapterFactory.createEventSinkAdapter(adapterConfig);
              await events.init();
              const health = await events.healthCheck();
              if (health.status === 'healthy') {
                console.log(`✓ Event sink adapter (${adapters.eventsink}) je zdravý`);
              } else {
                console.log(`⚠ Event sink adapter (${adapters.eventsink}): ${health.message}`);
                allOk = false;
              }
            }
          } catch (error) {
            console.log(`❌ Chyba při testování adapterů: ${error instanceof Error ? error.message : String(error)}`);
            allOk = false;
          }
        }
      }

      console.log('\n' + (allOk ? '✓ Vše v pořádku!' : '⚠ Některé kontroly selhaly.'));
    });
}

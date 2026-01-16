import { Command } from 'commander';
import { loadConfig, setNestedConfigValue } from '@aig/utils';

export function adaptersCommand(program: Command): void {
  const adaptersCmd = program
    .command('adapters')
    .description('Správa adapterů (Storage, EventSink, VectorStore)');

  adaptersCmd
    .command('show')
    .description('Zobrazí aktuální konfiguraci adapterů')
    .action(async () => {
      try {
        const config = await loadConfig();
        const adapters = config.adapters || {};

        console.log('Konfigurace adapterů:\n');
        console.log(`  Storage: ${adapters.storage || 'file'} (default)`);
        console.log(`  EventSink: ${adapters.eventsink || 'none'} (default)`);
        console.log(`  VectorStore: ${adapters.vectorstore || 'none'} (default)`);

        if (adapters.mysql) {
          console.log('\n  MySQL config:');
          console.log(`    Host: ${adapters.mysql.host || 'N/A'}`);
          console.log(`    Database: ${adapters.mysql.database || 'N/A'}`);
        }

        if (adapters.postgres) {
          console.log('\n  Postgres config:');
          console.log(`    URL: ${adapters.postgres.url ? '***' : 'N/A'}`);
        }

        if (adapters.external) {
          console.log('\n  External config:');
          console.log(`    Endpoint: ${adapters.external.endpoint || 'N/A'}`);
          console.log(`    VectorEndpoint: ${adapters.external.vectorEndpoint || 'N/A'}`);
        }
      } catch (error) {
        console.error(`Chyba: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });

  adaptersCmd
    .command('set <adapter> <type>')
    .description('Nastaví typ adapteru (storage|eventsink|vectorstore)')
    .action(async (adapter: string, type: string) => {
      try {
        const validAdapters = ['storage', 'eventsink', 'vectorstore'];
        if (!validAdapters.includes(adapter)) {
          console.error(`❌ Neplatný adapter. Použijte: ${validAdapters.join(', ')}`);
          process.exit(1);
        }

        let validTypes: string[];
        switch (adapter) {
          case 'storage':
            validTypes = ['file', 'mysql', 'postgres'];
            break;
          case 'eventsink':
            validTypes = ['none', 'file', 'db-aggregate', 'external'];
            break;
          case 'vectorstore':
            validTypes = ['none', 'local', 'external'];
            break;
          default:
            validTypes = [];
        }

        if (!validTypes.includes(type)) {
          console.error(`❌ Neplatný typ pro ${adapter}. Použijte: ${validTypes.join(', ')}`);
          process.exit(1);
        }

        await setNestedConfigValue(`adapters.${adapter}`, type);
        console.log(`✓ ${adapter} nastaven na: ${type}`);
      } catch (error) {
        console.error(`Chyba: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });
}

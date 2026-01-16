import { Command } from 'commander';
import { getConfigValue, setConfigValue, loadConfig } from '@aig/utils';

export function configCommand(program: Command): void {
  const configCmd = program
    .command('config')
    .description('Správa konfigurace');

  configCmd
    .command('get <key>')
    .description('Zobrazí hodnotu konfiguračního klíče')
    .action(async (key: string) => {
      try {
        const value = await getConfigValue(key as 'openaiApiKey' | 'defaultMarket' | 'defaultBudget');
        if (value !== undefined) {
          if (key === 'openaiApiKey' && typeof value === 'string') {
            // Skryj API klíč (zobraz jen začátek a konec)
            const masked = value.length > 8 
              ? `${value.slice(0, 4)}...${value.slice(-4)}`
              : '***';
            console.log(masked);
          } else {
            console.log(value);
          }
        } else {
          console.log('(nenastaveno)');
        }
      } catch (error) {
        console.error(`Chyba: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });

  configCmd
    .command('set <key> <value>')
    .description('Nastaví hodnotu konfiguračního klíče')
    .action(async (key: string, value: string) => {
      try {
        // Konverze hodnoty podle typu
        let parsedValue: string | number = value;
        if (key === 'defaultBudget') {
          parsedValue = parseFloat(value);
          if (isNaN(parsedValue)) {
            throw new Error('defaultBudget musí být číslo');
          }
        }

        await setConfigValue(key as 'openaiApiKey' | 'defaultMarket' | 'defaultBudget', parsedValue as any);
        console.log(`✓ ${key} nastaven na: ${value}`);
      } catch (error) {
        console.error(`Chyba: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });

  configCmd
    .command('list')
    .description('Zobrazí všechny konfigurační hodnoty')
    .action(async () => {
      try {
        const config = await loadConfig();
        console.log('Konfigurace:');
        for (const [key, value] of Object.entries(config)) {
          if (key === 'openaiApiKey' && value && typeof value === 'string') {
            const masked = value.length > 8 
              ? `${value.slice(0, 4)}...${value.slice(-4)}`
              : '***';
            console.log(`  ${key}: ${masked}`);
          } else {
            console.log(`  ${key}: ${value ?? '(nenastaveno)'}`);
          }
        }
      } catch (error) {
        console.error(`Chyba: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });
}

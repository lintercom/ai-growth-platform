import { Command } from 'commander';
import { getConfigValue, setConfigValue, loadConfig, getNestedConfigValue, setNestedConfigValue } from '@aig/utils';

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
          } else if (key === 'adapters' && value && typeof value === 'object') {
            console.log(`  ${key}:`);
            const adapters = value as Record<string, unknown>;
            for (const [ak, av] of Object.entries(adapters)) {
              if (ak === 'mysql' || ak === 'postgres' || ak === 'external') {
                if (typeof av === 'object' && av !== null) {
                  const subConfig = av as Record<string, unknown>;
                  console.log(`    ${ak}:`);
                  for (const [sk, sv] of Object.entries(subConfig)) {
                    if (typeof sv === 'string' && (sk.includes('password') || sk.includes('key') || sk.includes('url'))) {
                      const masked = sv.length > 8 
                        ? `${sv.slice(0, 4)}...${sv.slice(-4)}`
                        : '***';
                      console.log(`      ${sk}: ${masked}`);
                    } else {
                      console.log(`      ${sk}: ${sv ?? '(nenastaveno)'}`);
                    }
                  }
                }
              } else {
                console.log(`    ${ak}: ${av ?? '(nenastaveno)'}`);
              }
            }
          } else {
            console.log(`  ${key}: ${value ?? '(nenastaveno)'}`);
          }
        }
      } catch (error) {
        console.error(`Chyba: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });

  configCmd
    .command('get <path>')
    .description('Zobrazí hodnotu z nested configu (např. adapters.mysql.url)')
    .action(async (path: string) => {
      try {
        const value = await getNestedConfigValue(path);
        if (value === undefined) {
          console.log('(nenastaveno)');
        } else if (typeof value === 'string' && (path.includes('password') || path.includes('key') || path.includes('url'))) {
          const masked = value.length > 8 
            ? `${value.slice(0, 4)}...${value.slice(-4)}`
            : '***';
          console.log(masked);
        } else {
          console.log(value);
        }
      } catch (error) {
        console.error(`Chyba: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });

  configCmd
    .command('set <path> <value>')
    .description('Nastaví hodnotu v nested configu (např. adapters.mysql.url "mysql://...")')
    .action(async (path: string, value: string) => {
      try {
        // Try to parse as JSON if possible
        let parsedValue: unknown = value;
        try {
          parsedValue = JSON.parse(value);
        } catch {
          // Keep as string
        }

        await setNestedConfigValue(path, parsedValue);
        console.log(`✓ ${path} nastaven`);
      } catch (error) {
        console.error(`Chyba: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });
}

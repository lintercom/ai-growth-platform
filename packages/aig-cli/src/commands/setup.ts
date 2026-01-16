import { Command } from 'commander';
import inquirer from 'inquirer';
import { saveConfig, getConfigValue } from '@aig/utils';
import { verifyApiKey } from '@aig/core';
import * as process from 'node:process';

export function setupCommand(program: Command): void {
  program
    .command('setup')
    .description('Nastavení platformy a API klíčů')
    .action(async () => {
      console.log('🔧 AI Growth Platform - Setup\n');

      // Zkontroluj jestli už existuje klíč
      const existingKey = await getConfigValue('openaiApiKey');
      if (existingKey) {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: 'OpenAI API klíč již existuje. Přejete si ho přepsat?',
            default: false,
          },
        ]);

        if (!overwrite) {
          console.log('✓ Setup zrušen.');
          return;
        }
      }

      // Zeptej se na API klíč nebo použij env
      const envKey = process.env.OPENAI_API_KEY;
      
      const { apiKey } = await inquirer.prompt([
        {
          type: 'input',
          name: 'apiKey',
          message: 'OpenAI API Key:',
          default: envKey || '',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'API klíč je povinný';
            }
            if (!input.startsWith('sk-')) {
              return 'OpenAI API klíč musí začínat "sk-"';
            }
            return true;
          },
        },
      ]);

      console.log('\n⏳ Ověřování API klíče...');

      // Ověř klíč
      const isValid = await verifyApiKey(apiKey);
      
      if (!isValid) {
        console.error('❌ Neplatný API klíč. Zkontrolujte prosím klíč a zkuste to znovu.');
        process.exit(1);
      }

      // Ulož klíč
      await saveConfig({ openaiApiKey: apiKey });

      console.log('✓ API klíč úspěšně ověřen a uložen.');
      console.log('✓ Setup dokončen!');
    });
}

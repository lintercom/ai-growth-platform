#!/usr/bin/env node

import { Command } from 'commander';
import { setupCommand } from '../commands/setup.js';
import { doctorCommand } from '../commands/doctor.js';
import { initCommand } from '../commands/init.js';
import { projectCommand } from '../commands/project.js';
import { configCommand } from '../commands/config.js';
import { analyzeCommand } from '../commands/analyze.js';
import { exportCommand } from '../commands/export.js';

const program = new Command();

program
  .name('aig')
  .description('AI Growth & Design Platform - CLI nástroje')
  .version('0.1.0');

// Přidání příkazů
setupCommand(program);
doctorCommand(program);
initCommand(program);
configCommand(program);
projectCommand(program);
analyzeCommand(program);
exportCommand(program);

program.parse();

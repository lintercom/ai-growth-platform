# Vytvoření EXE souboru

## Postup

### 1. Instalace závislostí

```bash
pnpm install
```

### 2. Build TypeScript

```bash
pnpm -r run build
```

### 3. Vytvoření EXE

```bash
pnpm build:exe
```

EXE soubor bude vytvořen v `bin/aig-installer.exe` (v root adresáři projektu).

## Jak to funguje

1. **První spuštění EXE:**
   - Zkontroluje Node.js a pnpm
   - Naklonuje/aktualizuje repozitář z GitHubu
   - Nainstaluje závislosti (`pnpm install`)
   - Zbuilduje projekt (`pnpm -r run build`)
   - Vytvoří flag soubor `installed.flag`

2. **Další spuštění:**
   - Detekuje, že instalace proběhla
   - Přímo spustí CLI z naklonovaného repozitáře

## Použití EXE

Po vytvoření EXE můžete:

```bash
# Spustit EXE (automaticky provede instalaci při prvním spuštění)
.\bin\aig-installer.exe --help

# Nebo zkopírovat do jakéhokoliv adresáře
copy bin\aig-installer.exe C:\Tools\aig.exe
aig.exe setup
aig.exe doctor
```

## Distribuce

EXE soubor je samostatný a obsahuje:
- Node.js runtime (v baleném formátu)
- Wrapper kód pro instalaci
- Spojení na GitHub repozitář pro stažení zdrojového kódu

**Velikost:** Cca 50-70 MB (kvůli zabalenému Node.js runtime)

## Poznámky

- EXE vyžaduje internetové připojení pro první spuštění (klonování z GitHubu)
- Instalace proběhne do adresáře vedle EXE (`ai-growth-platform/`)
- Pro aktualizaci smažte `installed.flag` v `packages/aig-cli/` a znovu spusťte EXE

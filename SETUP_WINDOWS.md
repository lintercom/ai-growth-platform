# Nastavení pro Windows

## Problém: `pnpm link -g` nefunguje

Pokud dostáváte chybu `ERR_PNPM_NO_GLOBAL_BIN_DIR`, proveďte:

### Řešení 1: Nastavení pnpm (doporučeno)

```powershell
pnpm setup
```

Tento příkaz automaticky:
- Vytvoří globální bin directory
- Přidá pnpm do PATH
- Nastaví potřebné environment variables

**Po `pnpm setup` restartujte terminál** a pak:

```powershell
cd packages/aig-cli
pnpm link --global
cd ../..
aig --help
```

### Řešení 2: Použití bez globální instalace

Můžete používat CLI přímo z projektu:

```powershell
# Z root adresáře projektu
pnpm aig --help
pnpm aig setup
pnpm aig doctor
pnpm aig init
```

Nebo přímo přes node:

```powershell
node packages/aig-cli/dist/bin/aig.js --help
node packages/aig-cli/dist/bin/aig.js setup
```

### Řešení 3: Přidání do PATH manuálně

Pokud `pnpm setup` nefunguje:

1. Najděte globální bin directory pnpm:
   ```powershell
   pnpm config get global-bin-dir
   ```

2. Přidejte cestu do PATH environment variable:
   - Win + R → `sysdm.cpl` → Advanced → Environment Variables
   - Přidejte cestu z kroku 1 do User nebo System PATH

3. Restartujte terminál

4. Pak:
   ```powershell
   cd packages/aig-cli
   pnpm link --global
   ```

---

**Doporučení:** Pro rychlé použití použijte `pnpm aig` přímo z root adresáře projektu.

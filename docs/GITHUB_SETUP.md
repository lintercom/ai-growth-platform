# Nastavení GitHub repozitáře

## GitHub CLI (doporučeno)

Pokud máte nainstalované GitHub CLI:

```bash
# Instalace GitHub CLI (Windows)
winget install GitHub.cli
# nebo stáhněte z: https://cli.github.com

# Přihlášení
gh auth login

# Vytvoření repo a push
gh repo create ai-growth-platform --private --source=. --remote=origin --push
```

## Manuální postup

1. **Vytvořte repozitář na GitHubu:**
   - Přejděte na https://github.com/new
   - Název: `ai-growth-platform`
   - Viditelnost: Private (nebo Public)
   - NEVYTVÁŘEJTE README, .gitignore ani licenci (už existují)

2. **Připojte remote a pushněte:**
   ```bash
   git remote add origin https://github.com/lintercom/ai-growth-platform.git
   git branch -M main
   git push -u origin main
   ```

3. **Ověření:**
   ```bash
   git remote -v
   ```

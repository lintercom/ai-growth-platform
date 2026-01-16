# Nahrání na GitHub

## Postup

### 1. Vytvořte repozitář na GitHubu

**Pomocí GitHub CLI (pokud máte nainstalované):**
```bash
gh auth login
gh repo create ai-growth-platform --private --source=. --remote=origin --push
```

**Manuálně:**
1. Přejděte na https://github.com/new
2. Název: `ai-growth-platform`
3. Viditelnost: Private (nebo Public - dle vašeho výběru)
4. **Nevytvářejte** README, .gitignore ani licenci (už existují)
5. Klikněte na "Create repository"

### 2. Připojte remote a pushněte

```bash
# Připojení remote (nahraďte <VAŠE-USERNAME> svým GitHub username)
git remote add origin https://github.com/<VAŠE-USERNAME>/ai-growth-platform.git

# Pokud už remote existuje, aktualizujte ho:
# git remote set-url origin https://github.com/<VAŠE-USERNAME>/ai-growth-platform.git

# Přesunutí na main branch (pokud jste na master)
git branch -M main

# Push na GitHub
git push -u origin main
```

### 3. Ověření

```bash
git remote -v
git log --oneline -3
```

### 4. Aktualizace README s vaším username

Po nahrání na GitHub aktualizujte:
- `README.md` - nahraďte `<username>` svým GitHub username
- `INSTALL.md` - nahraďte `<VAŠE-USERNAME>` svým GitHub username
- `packages/aig-cli/package.json` - nahraďte `<username>` v repository URL

```bash
# Příklad (nahraďte 'vas-username' svým skutečným username):
git add README.md INSTALL.md packages/aig-cli/package.json
git commit -m "docs: aktualizace GitHub URLs"
git push
```

## Instalace z GitHubu

Po nahrání na GitHub může kdokoliv nainstalovat projekt:

```bash
git clone https://github.com/<VAŠE-USERNAME>/ai-growth-platform.git
cd ai-growth-platform
pnpm install
pnpm -r run build
pnpm link -g
aig --help
```

Nebo použít přímo bez globální instalace:
```bash
pnpm aig --help
```

## Poznámky

- Všechny workspace dependencies (`workspace:*`) fungují pouze při instalaci z Git pomocí pnpm
- Pro publikování na npm by bylo potřeba upravit dependencies (to není nutné pro základní použití)
- Build produkty (`dist/`) jsou v `.gitignore`, ale jsou vytvořeny při `pnpm -r run build`

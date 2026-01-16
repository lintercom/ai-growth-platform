# Rychlý upload na GitHub

## Krok 1: Vytvořte repozitář na GitHubu

1. Přejděte na: https://github.com/new
2. Repository name: `ai-growth-platform`
3. Description: `AI Growth & Design Platform - Toolkit a CLI pro weby a e-shopy`
4. Vyberte **Private** nebo **Public**
5. **Nevytvářejte** README, .gitignore ani licenci (už existují!)
6. Klikněte na **"Create repository"**

## Krok 2: Zkopírujte URL vašeho repozitáře

Po vytvoření uvidíte něco jako:
```
https://github.com/VAS-USERNAME/ai-growth-platform.git
```

## Krok 3: Spusťte tyto příkazy (nahraďte VAS-USERNAME)

```bash
git remote add origin https://github.com/VAS-USERNAME/ai-growth-platform.git
git branch -M main
git push -u origin main
```

Pokud už remote existuje, použijte:
```bash
git remote set-url origin https://github.com/VAS-USERNAME/ai-growth-platform.git
git branch -M main
git push -u origin main
```

**To je vše!** Projekt je na GitHubu.

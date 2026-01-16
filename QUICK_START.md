# Rychlý start

Po klonování a build projektu můžete používat CLI několika způsoby:

## Způsob 1: Pomocí pnpm scriptu (doporučeno)

```bash
pnpm aig --help
pnpm aig setup
pnpm aig doctor
pnpm aig init
```

## Způsob 2: Přímo přes node

```bash
node packages/aig-cli/dist/bin/aig.js --help
node packages/aig-cli/dist/bin/aig.js setup
```

## Způsob 3: Globální instalace (volitelné)

```bash
cd packages/aig-cli
pnpm link --global
cd ../..
aig --help
```

Nebo z root adresáře:
```bash
pnpm --filter @aig/cli link --global
aig --help
```

## Způsob 4: Přes npx (po publikování na npm)

```bash
npx @aig/cli --help
```

---

**Doporučení:** Pro lokální vývoj používejte `pnpm aig`, pro produkci globální instalaci.

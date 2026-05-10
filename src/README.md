# Etape 8 — Uniformisation zinc toutes les pages restantes

## Fichiers à copier

```
etape8/components/Backtest/Backtest.tsx   → src/components/Backtest/Backtest.tsx
etape8/components/Calendar/Calendar.tsx   → src/components/Calendar/Calendar.tsx
etape8/components/Settings/Settings.tsx   → src/components/Settings/Settings.tsx
etape8/components/Trading/Trading.tsx     → src/components/Trading/Trading.tsx
```

## Ce qui change

- Tous les `gray-800/900/700` remplacés par `zinc-800/900/700`
- Tous les inputs uniformisés avec le même style
- Tableaux avec le composant `Table` réutilisable
- Badges `Badge` pour Side, impact, raison
- Boutons `Button` uniformes
- Cards `Card` avec `border-zinc-800`

## Commit

```bash
git add .
git commit -m "feat: uniformisation zinc toutes pages"
git push

./deploy.sh frontend
```

# Etape 6 — Prix animé + modal confirmation

## Fichiers à copier

```
etape6/components/UI/Modal.tsx              → src/components/UI/Modal.tsx  (nouveau)
etape6/hooks/useAnimatedPrice.ts            → src/hooks/useAnimatedPrice.ts  (nouveau)
etape6/components/Dashboard/Dashboard.tsx  → src/components/Dashboard/Dashboard.tsx
```

## Ce qui change

- `Modal.tsx` — composant modal réutilisable avec overlay + confirmation
- `useAnimatedPrice.ts` — hook qui détecte si le prix monte/descend et applique un flash de couleur
- `Dashboard.tsx` — prix BTC flash vert/rouge + modal de confirmation avant fermeture de trade avec PnL estimé

## Commit

```bash
git add .
git commit -m "feat: prix anime + modal confirmation fermeture trade"
```

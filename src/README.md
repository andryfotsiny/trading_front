# Etape 3 — Skeleton loading + spinners

## Fichiers à copier

```
etape3/components/UI/Skeleton.tsx          → src/components/UI/Skeleton.tsx  (nouveau)
etape3/components/Dashboard/Dashboard.tsx  → src/components/Dashboard/Dashboard.tsx
etape3/components/Bot/Bot.tsx              → src/components/Bot/Bot.tsx
```

## Ce qui change

- `Skeleton.tsx` — composants réutilisables : `Skeleton`, `SkeletonCard`, `SkeletonTable`, `SkeletonList`
- `Dashboard` — skeletons sur toutes les cards et tableaux pendant le chargement
- `Bot` — skeletons sur les cards de statut et la liste des stratégies
- Spinners sur les boutons en action (Fermer, Vérifier, Lancer)

## Commit

```bash
git add .
git commit -m "feat: skeleton loading + spinners"
```

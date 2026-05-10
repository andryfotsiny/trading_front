# Etape 2 — Design system + couleurs modernes

## Fichiers à copier

```
etape2/components/Layout/AppLayout.tsx  → src/components/Layout/AppLayout.tsx
etape2/components/Layout/Sidebar.tsx    → src/components/Layout/Sidebar.tsx
etape2/components/UI/Toast.tsx          → src/components/UI/Toast.tsx
etape2/components/UI/Components.tsx     → src/components/UI/Components.tsx  (nouveau)
etape2/components/Dashboard/Dashboard.tsx → src/components/Dashboard/Dashboard.tsx
```

## Ce qui change

- Fond `zinc-950` au lieu de `gray-950`
- Sidebar avec accent `cyan-400` + border subtile
- Cards avec `border-zinc-800`
- Gains en `emerald-400`, pertes en `rose-400`
- Composants réutilisables : `Card`, `StatCard`, `Badge`, `Button`, `Table`, `PageHeader`
- Toast redesigné avec bordures colorées

## Commit

```bash
git add .
git commit -m "feat: design system zinc/cyan + composants UI"
```

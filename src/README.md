# Etape 1 — React Query

## 1. Installer React Query

```bash
npm install @tanstack/react-query
```

## 2. Copier les fichiers

```
etape1/App.tsx                          → src/App.tsx
etape1/store/index.ts                   → src/store/index.ts
etape1/store/authStore.ts               → src/store/authStore.ts  (nouveau)
etape1/hooks/useTrading.ts              → src/hooks/useTrading.ts (nouveau)
etape1/components/Dashboard/Dashboard.tsx → src/components/Dashboard/Dashboard.tsx
etape1/components/Bot/Bot.tsx           → src/components/Bot/Bot.tsx
```

## 3. Push et deploy

```bash
git add .
git commit -m "feat: React Query + hooks centralisés"
git push

./deploy.sh frontend
```

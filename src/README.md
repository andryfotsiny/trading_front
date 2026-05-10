# Etape 7 — Page 404 + token expiré + sécurité JWT + Login/Register redesignés

## Fichiers à copier

```
etape7/App.tsx                        → src/App.tsx
etape7/services/api.ts                → src/services/api.ts
etape7/store/index.ts                 → src/store/index.ts
etape7/components/UI/NotFound.tsx     → src/components/UI/NotFound.tsx  (nouveau)
etape7/components/Auth/Login.tsx      → src/components/Auth/Login.tsx
etape7/components/Auth/Register.tsx   → src/components/Auth/Register.tsx
```

## Ce qui change

- `App.tsx` — route `*` → page 404 pour toute URL inconnue
- `NotFound.tsx` — page 404 moderne avec lien retour dashboard
- `api.ts` — token lu depuis Zustand (plus de localStorage direct) + toast "Session expirée" avant redirect
- `store/index.ts` — logout nettoie tout le state + try/catch sur localStorage
- `Login.tsx` — redesigné avec zinc + spinner sur le bouton
- `Register.tsx` — redesigné avec zinc + spinner sur le bouton

## Commit final

```bash
git add .
git commit -m "feat: page 404 + session expiree + login redesigne"
git push

cd ~/Projects/trading_bot
./deploy.sh frontend
```

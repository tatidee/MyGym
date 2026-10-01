# MyGym

Registro personal de entrenamiento, comida, agua, baño, peso y dolor de hombro.
Next.js 15 + Supabase (login y base de datos) + Vercel.

La semana se muestra como una barra olímpica: cada día entrenado carga su disco de competencia
(Lower 25 rojo, Legs 20 azul, Upper 15 amarillo, Pull 10 verde, Push 5 blanco).

## 1. Base de datos (una sola vez)

1. Supabase → **SQL Editor** → New query.
2. Pegá todo `supabase/schema.sql` y tocá **Run**.
   Crea las tablas `dias` y `sesiones` con Row Level Security: cada fila solo la ve su dueño.

## 2. Login

1. Supabase → **Authentication → Sign In / Providers → Email**: desactivá **Confirm email**
   mientras creás tu cuenta (así entrás directo, sin mail de confirmación).
2. Levantá la app (paso 3), entrá a `/login` y tocá **Es mi primera vez: crear cuenta**.
3. Ya con tu cuenta creada: **Authentication → Sign In / Providers** → desactivá **Allow new users to sign up**.
   Así nadie más puede registrarse en tu app.

## 3. Correrla en tu PC

```bash
npm install
cp .env.example .env.local   # si no tenés ya el .env.local
npm run dev
```

Abrí http://localhost:3000

## 4. Subir a GitHub

```bash
git init
git add .
git commit -m "MyGym: primera versión"
git branch -M main
git remote add origin https://github.com/tatidee/MyGym.git
git push -u origin main
```

`.env.local` no se sube (está en `.gitignore`).

## 5. Publicar en Vercel

1. vercel.com → **Add New → Project** → importá `tatidee/MyGym`.
2. En **Environment Variables** cargá las dos de `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. **Deploy**.
4. Volvé a Supabase → **Authentication → URL Configuration**:
   - **Site URL**: la URL que te dio Vercel (ej. `https://mygym-xxx.vercel.app`)
   - **Redirect URLs**: agregá `https://mygym-xxx.vercel.app/auth/callback`

Desde ahí, cada `git push` a `main` publica la nueva versión sola.

## 6. Instalarla en el celular

Abrí la URL de Vercel en Chrome → menú ⋮ → **Agregar a la pantalla principal**.
Queda como una app más.

## Cómo cambiar el plan

Todo el plan está en **`lib/plan.ts`**: ejercicios, series, rangos, RIR, notas, menú, macros y metas.

- Para cambiar un ejercicio editá su objeto. Si solo lo renombrás, cambiá `n` y dejá el `id`
  igual para no perder el historial de cargas.
- Para agregar uno, sumalo a la lista del día con un `id` nuevo.
- Cuando cambies algo grande, actualizá `PLAN_VERSION`: sale en el informe.

## Estructura

```
app/
  page.tsx              → la app (protegida por login)
  login/page.tsx        → entrar / crear cuenta
  auth/callback/        → destino del mail de confirmación
  globals.css           → todo el diseño (colores, tipografía, componentes)
components/
  GymApp.tsx            → encabezado, pestañas y dock
  Barra.tsx             → la barra olímpica de la semana
  Hoy.tsx · Rutina.tsx · Comidas.tsx · Registro.tsx · Informe.tsx
lib/
  plan.ts               → EL PLAN (lo que vas a editar más seguido)
  useGymData.ts         → lectura y guardado en Supabase
  informe.ts            → el texto que le pasás a Claude
supabase/schema.sql     → tablas y permisos
middleware.ts           → mantiene la sesión y manda a /login si no entraste
```

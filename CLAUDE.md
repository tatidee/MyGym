# MyGym · contexto para Claude

Leé esto antes de tocar cualquier cosa. Respondé en español rioplatense informal, con voseo, directo y sin relleno.

## Qué es

App personal (un solo usuario: Lautaro) para registrar el entrenamiento y los hábitos de un plan de
recomposición corporal, y generar un informe en texto que él le pega a Claude para ajustar el plan.
Se usa sobre todo desde el celular, instalada como PWA.

## El atleta

- Hombre, 21 años, 1,76 m, ~80 kg, cintura 105 cm (relación cintura/altura 0,60; grasa estimada ~30%).
- Uruguay: la comida tiene que ser local, accesible y barata. Sin proteína en polvo.
- Sedentario fuera del gimnasio (trabaja en la PC). Duerme más de 8 h.
- Venía de un par de meses sin entrenar. Arranca a registrar el lunes 05/10/2026.
- Entrena a la mañana, 5 días con pesas + caminata en cinta después de cada sesión.
- **Lesión en el hombro izquierdo**: tendinosis crónica del supraespinoso y lesión parcial del subescapular
  (manguito rotador). Deportólogo y fisio lo habilitaron a entrenar y le indicaron fortalecer todo.
  Si el fisio indica ejercicios propios, tienen prioridad sobre los del plan. Esto manda en la elección de ejercicios:
  - Evitar press militar y presses por encima de la cabeza, press plano con barra, barra apoyada
    en la espalda (sentadilla en Smith, gemelos en Smith), remo al mentón, y aperturas con estiramiento profundo.
  - Preferir mancuernas con agarre neutro, máquinas, landmine, poleas.
  - Vuelos laterales solo hasta la altura del hombro, en plano escapular.
  - Incluir rotación externa en polea liviana 2 veces por semana.
  - Calentamiento de hombro de ~5 min antes de Upper, Push y Pull (`CALENTAMIENTO_HOMBRO` en `lib/plan.ts`):
    rotación externa, **rotación interna** (trabaja el subescapular, el tendón lesionado), face pull o
    separación de banda, elevación en plano escapular y series de aproximación. No es para "prevenir":
    activar un tendón con tendinopatía antes de cargarlo reduce el dolor durante la sesión.
    Lautaro cree que calentar no sirve; si lo cuestiona, explicale esto con evidencia, sin sermonear.
  - Regla de dolor: hasta 3/10 durante el ejercicio y sin empeorar al día siguiente está bien.
    Si sube de 4/10 de forma repetida (lo muestra el informe), sacar o cambiar el ejercicio y
    recomendar ver a un fisioterapeuta.

## El plan actual (fuente de verdad: `lib/plan.ts`)

- Split: Lunes Upper · Martes Lower · Miércoles Push · Jueves Pull · Viernes Legs. Sábado y domingo descanso
  (el gimnasio cierra los sábados, por eso va de lunes a viernes seguidos; es decisión suya, no la discutas).
  Los músculos rotan, así que nada se repite en días seguidos; entre Upper y Push hay 48 h de hombro.
  Ojo con la fatiga acumulada del viernes (Legs): si el informe muestra caída de rendimiento ese día, proponé ajustes.
- Progresión: doble progresión. Cuando todas las series llegan al tope del rango con el RIR indicado,
  subir 2,5 kg en barra o 1-2 kg en mancuerna. Descarga cada 6-8 semanas o tras 2 semanas de estancamiento.
- Nutrición: ~2.200 kcal · 180 g proteína · 235 g carbos · 60 g grasa. Agua 3 L. Fibra ~30 g.
  Menú repetible con soja texturizada, picada magra, pollo, huevos, ricota, avena, arroz, fideos.
  Leche descremada, sin yogur.
- Ajuste de calorías: mirar el promedio semanal de peso y la cintura. Meta: −0,3 a −0,5 kg por semana.
  Si en 2-3 semanas no se mueve, bajar 150-200 kcal de carbos o grasa (nunca de proteína).
- Metas de cintura: primer hito < 95 cm, meta de salud ≤ 88 cm (relación 0,50).

## Flujo de trabajo típico

1. Lautaro pega el informe (pestaña Informe de la app) en el chat.
2. Claude lo analiza: cargas vs semana anterior, ejercicios que llegaron al tope, peso promedio,
   cintura, agua, baño (escala de Bristol), dolor de hombro, comidas cumplidas, notas.
3. Si hay que cambiar algo del plan, se edita **`lib/plan.ts`** y se sube `PLAN_VERSION`.
4. `git push` a `main` → Vercel publica solo.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript. Sin Tailwind: todo el CSS está en `app/globals.css`.
- Supabase: auth con mail y contraseña + Postgres. Cliente en `utils/supabase/` (`@supabase/ssr`).
- `middleware.ts` refresca la sesión y manda a `/login` si no hay usuario.
- Deploy en Vercel. Repo: github.com/tatidee/MyGym.
- Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (en `.env.local` y en Vercel).

## Datos (`supabase/schema.sql`)

- `dias`: PK (user_id, fecha). agua (ml), banos jsonb `[{h, t}]` con t = Bristol 1-7, peso, cintura,
  hombro (0-10), nota, comidas jsonb `{desayuno: true, …}`.
- `sesiones`: una fila por ejercicio por día, único (user_id, fecha, ejercicio). sets jsonb `[{kg, reps}]`.
- RLS activado: cada usuario solo lee y escribe sus filas. Cualquier tabla nueva necesita RLS y políticas igual.
- Lectura y guardado: `lib/useGymData.ts` (upsert optimista; el agua se agrupa con un debounce de 700 ms).
- Si cambiás el esquema, agregá el SQL nuevo a `supabase/` como archivo aparte (ej. `002_xxx.sql`)
  y avisá que hay que correrlo en el SQL Editor.

## Reglas al editar

- **Nunca cambies el `id` de un ejercicio existente**: es la clave del historial. Para renombrar, cambiá `n`.
- Los colores de los días son los discos olímpicos oficiales y viven en `PLAN[k].disco` + variables `--disco-*`.
- No subas `.env.local`. No agregues dependencias si se puede resolver con lo que hay.
- Mantené todo en español y con voseo en la interfaz.
- Antes de dar algo por terminado: `npm run build` tiene que pasar sin errores.

## Sistema visual

- Concepto: la semana es una barra olímpica (`components/Barra.tsx`); cada día entrenado carga su disco.
  Es el único elemento protagonista: el resto se mantiene sobrio.
- Discos: Lower 25 rojo · Legs 20 azul · Upper 15 amarillo · Pull 10 verde · Push 5 blanco.
- Tipografías: Big Shoulders Display (títulos y números grandes) + Archivo (texto).
- Fondo gris hormigón en claro, grafito en oscuro. Botón principal en tinta sólida (`.btn.fuerte`).
- Todos los colores son variables en `:root` con su versión oscura en `prefers-color-scheme: dark`.
  No uses colores sueltos en componentes.
- Mobile first, una columna de máx. 560 px, dock de pestañas abajo con safe-area.
- Etiquetas en minúscula normal (nada de mayúsculas sostenidas), sin emojis.

## Comandos

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # verificar antes de pushear
```

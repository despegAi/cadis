---
target: landing page (index.html) + CreditSimulator.tsx
total_score: 20
max_score: 36
na_heuristics: 7
p0_count: 3
p1_count: 2
target_identity: "file:C:\\cadis-proyecto\\index.html (landing + CreditSimulator)"
timestamp: 2026-09-16T16-15-52Z
slug: index-html-landing-creditsimulator
---
Method: dual-agent (A: general-purpose subagent · B: general-purpose subagent) + parent-authored technical audit. Browser visualization unavailable in this session (no browser-automation tool exposed) — all findings are source-level (JSX/Tailwind) analysis, not rendered-page inspection.

## Design Health Score (Nielsen's 10 Heuristics)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2/4 | Real-time recalculation is good, but the down-payment figure used to go stale (now fixed) |
| 2 | Match System / Real World | 4/4 | Correct local terms (C.I., DDRR, manzanos), real municipalities, USD pricing, WhatsApp-first |
| 3 | User Control and Freedom | 3/4 | Reset flows work; property modal has no Escape/backdrop dismiss |
| 4 | Consistency and Standards | 1/4 | Two different WhatsApp numbers site-wide; 30% figure computed differently across files |
| 5 | Error Prevention | 1/4 | Price input declares `max=50000` but nothing enforces it; three different stated ceilings ($30k/$50k) never reconciled |
| 6 | Recognition Rather Than Recall | 3/4 | Selected lot persists as a labeled banner; consistent color-state highlighting |
| 7 | Flexibility and Efficiency | n/a | No accounts/shortcuts/personalization — genuinely absent from a first-visit persuade/simulate flow |
| 8 | Aesthetic and Minimalist Design | 2/4 | Hero/Gallery are clean; CreditSimulator has ~22 simultaneous controls + 4 competing badges |
| 9 | Help Recognize/Diagnose/Recover from Errors | 1/4 | Zero inline error states in any of the 3 lead forms; failed submit silently no-ops |
| 10 | Help and Documentation | 3/4 | A 5-item FAQ covers the "crédito directo" mechanics well, but it's the only place they're explained |
| **Total** | | **20/36 applicable** | **Acceptable (≈56%)** |

## Audit Health Score (technical, 5 dimensions)

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2/4 | 4 inputs missing label/aria-label; no inline validation errors; modal has no keyboard dismiss; 7 touch targets under ~44px (all still have aria-label) |
| 2 | Performance | 2/4 | 13 below-the-fold images without `loading="lazy"`; `transition-all` used broadly instead of targeted properties; multiple simultaneous `blur-3xl`/`blur-md` decorative layers |
| 3 | Theming | 1/4 | 69 hardcoded hex literals as Tailwind arbitrary values (`bg-[#25D366]`, `text-[#009698]`, etc.) instead of design tokens; no single source of truth for brand color |
| 4 | Responsive Design | 2/4 | WhatsApp widget panel (`w-[340px]`) can overflow <360px viewports; CreditSimulator loses its sticky results summary on mobile once stacked to 1 column; Header's desktop nav only appears at `xl:` (1280px) |
| 5 | Implementation Integrity | 1/4 | Down-payment math didn't match the "30%" label it sat under (fixed this session); two different WhatsApp numbers in live use; a "Real Photo Gallery" built from stock images with site-specific captions; a hardcoded "Últimos 14 Lotes" scarcity claim disconnected from actual inventory (8 lots, 6 available); "IA Activa"/"Análisis Inteligente" framing with no AI actually wired up |
| **Total** | | **8/20** | **Poor (major overhaul needed on trust/consistency, not on visual polish)** |

## Design Specificity Verdict

Mixed, leaning generic at the craft/interaction layer despite genuinely specific copy and data. Real evidence of specificity: an actual DDRR matrícula number, catastral code, named titleholders, real GPS coordinates, a named 5-stop Santa Cruz→Limoncito route with distances/times, and named lots (RB-01…RB-08) with individual m²/price data. That is not template filler.

Undercutting that verdict: the component architecture (hero + value-prop card + gallery + calculator + FAQ + recruitment form + newsletter) is an interchangeable Tailwind real-estate/SaaS template skeleton, all photography is generic Unsplash stock with zero shots of the actual property, and — critically — the gallery explicitly labels that stock imagery "Galería Fotográfica Real" with captions asserting it depicts the specific site. That's worse than generic: it's specific-sounding copy wrapped around unverifiable visuals, directly undermining the "Seguridad Jurídica" (legal trust) positioning the same section is built on.

## Implementation Integrity Verdict

**Fails as found, materially improved this session.** The one component built specifically to demonstrate the project's core differentiator (30% direct-credit down payment) computed a different number than its own label — that bug is now fixed. What remains unresolved: two different WhatsApp numbers in live use across the site (a real lead-loss risk), a stock-photo gallery captioned as authentic site photography, a hardcoded scarcity counter disconnected from real inventory, and "AI" framing with no AI behind it. These are trust/correctness problems on a page whose entire pitch is legal/financial trustworthiness — more damaging than any visual-polish gap found.

## Overall Impression

The strategic bones are good and genuinely product-specific (legal grounding, transparent line-item math, WhatsApp-first contact flow matched to how Bolivian real-estate leads actually close). But the execution has several places where the page asserts things that aren't true — a math error on the core financing rule, a mismatched contact number, and marketing claims (real photos, live scarcity, AI) that don't hold up — which is a bigger risk to a first-time, no-credit-history buyer's trust than any spacing or color issue.

## What's Working

1. **Legal/geographic grounding as a trust mechanic** (RioBonitoSection) — real matrícula/catastral numbers, named titleholders, a concrete named route. In a market where informal "loteo" fraud is a real buyer fear, leading with verifiable paperwork instead of lifestyle-only marketing is a smart, non-generic choice.
2. **Line-item transparency in the simulator** — total price, down payment, modality, remaining balance, and "Requisitos: Solo C.I. (Sin buró crediticio)" directly enacts the product's stated principle of not hiding the mechanics behind financial jargon.
3. **Intent-aware WhatsApp widget** with tabbed contexts (lot inquiry / credit / weekend tour / vendor / general) and pre-scripted opening messages reflects real understanding that Bolivian real-estate leads close over WhatsApp, not web forms.
4. **Accessibility fundamentals are mostly solid**: every `<img>` has meaningful alt text, every icon-only button has an `aria-label`, and nearly every form input has a correctly paired `<label htmlFor>`.

## Priority Issues

**[P0] [FIXED THIS SESSION] Cuota inicial no reflejaba realmente el 30% obligatorio**
- Why it matters: es la regla de negocio central del producto; el simulador construido específicamente para demostrarla la incumplía.
- Fix applied: `cuotaInicialMonto` ahora se deriva siempre como `precioTerreno * 0.30` en vez de vivir en un `useState` que se congelaba en $2,000 y nunca se recalculaba al cambiar el precio.
- Suggested command: /impeccable polish (regression-test the rest of the simulator's derived values)

**[P0] Dos números de WhatsApp distintos en uso simultáneo**
- Header/Hero/Footer/schema.org usan +59163560078; el widget flotante (superficie de contacto más usada del sitio) y varias otras secciones usan 71234567 por defecto.
- Why it matters: si no es la misma línea monitoreada, una parte importante de los leads generados por el canal más usado del sitio nunca llega a nadie.
- Fix: extraer un único `CADIS_WHATSAPP_NUMBER` exportado y reemplazar todos los literales.
- Suggested command: /impeccable harden

**[P0] Contenido de autenticidad cuestionable: fotos de stock etiquetadas como "reales" + contador de inventario hardcodeado**
- "Galería Fotográfica Real" usa solo fotos de stock de Unsplash con descripciones que afirman ser del terreno específico; el Hero muestra "Últimos 14 Lotes" fijo aunque el inventario real (`initialData.ts`) es de 8 lotes, 6 disponibles.
- Why it matters: PRODUCT.md establece explícitamente "no fabricar cifras, disponibilidad ni testimonios"; esto es justo eso, en la sección que más depende de la confianza del comprador.
- Fix: reemplazar por fotos reales o renombrar honestamente la sección; calcular el contador desde `properties.filter(p => p.estado === 'disponible').length`.
- Suggested command: /impeccable clarify

**[P1] Sin validación/feedback de error inline en los 3 formularios de captura de leads**
- `handleSubmitLead` (CreditSimulator) y `handleSubmit` (VendorRecruitment) simplemente no hacen nada si faltan campos requeridos — sin mensaje, sin borde rojo.
- Why it matters: para un comprador sin historial crediticio formal, un típo en el teléfono destruye silenciosamente un lead de $8,000–$30,000 sin señal de recuperación.
- Fix: validación visible en vivo (borde + texto de ayuda) y verificación de formato de teléfono antes de permitir el envío.
- Suggested command: /impeccable harden

**[P1] El panel del widget de WhatsApp puede desbordar en viewports angostos**
- `w-[340px] sm:w-[390px]` en un mercado con muchos equipos Android económicos de 320-360px de ancho.
- Fix: usar `w-[calc(100vw-2rem)] max-w-[390px]` o equivalente.
- Suggested command: /impeccable adapt

**[P2] Sobrecarga cognitiva en el simulador**
- ~22 controles interactivos simultáneos sin divulgación progresiva; el precio se puede fijar de 3 formas redundantes a la vez (input numérico + slider + chips) sin indicar cuál es la principal.
- Fix: dividir en 2-3 pasos secuenciales (precio/plazo → modalidad → contacto) con un resumen persistente; eliminar controles de precio redundantes.
- Suggested command: /impeccable distill

**[P2] 4 inputs sin `<label>`/`aria-label` propio**
- El slider de precio duplicado en CreditSimulator, el slider de precio máximo en PropertiesGallery, el input de newsletter y el input del chat de WhatsApp.
- Suggested command: /impeccable harden

**[P2] Colores de marca como literales hex arbitrarios en vez de tokens (69 ocurrencias)**
- `bg-[#25D366]`, `text-[#009698]`, etc. repetidos en 10 archivos sin una fuente única de verdad — alto riesgo de drift si cambia el color de marca.
- Suggested command: /impeccable extract

**[P2] 13 imágenes bajo el pliegue sin `loading="lazy"`**
- Todas las imágenes de PropertiesGallery, RioBonitoSection y ReferenceMapsSection cargan de forma eager.
- Suggested command: /impeccable optimize

**[P3] "Panel Admin" y contador de leads visibles en el header/footer público**
- Compiten visualmente con el CTA de WhatsApp en una página cuyo propósito es 100% persuasión, no operación.
- Suggested command: /impeccable layout

**[P3] 7 botones-ícono con área táctil bajo ~44×44px** (todos con `aria-label`, así que el problema es solo de tamaño físico, no de nombre accesible).
- Suggested command: /impeccable adapt

**[P3] `animate-bounce` en el widget de WhatsApp** se siente anticuado; considerar un easing exponencial de salida.
- Suggested command: /impeccable animate

## False Positives Noted (and suppressed)

El detector determinista marcó 15 hallazgos `gray-on-color` (texto `slate-800`/`slate-950` sobre fondos `teal-50`/`emerald-50`/`emerald-500`/`emerald-400`/`amber-400`). Verifiqué contraste WCAG real en los pares de CreditSimulator.tsx: `slate-950` es casi negro, no un gris lavado, y da ~8:1–10.5:1 de contraste contra esos fondos — muy por encima del mínimo AA (4.5:1). Es un falso positivo sistemático de esa regla (no distingue dirección de luminancia). Ya suprimí `gray-on-color` específicamente en `CreditSimulator.tsx` con la evidencia documentada; las otras 11 ocurrencias del mismo patrón en Hero.tsx, RioBonitoSection.tsx, PropertiesGallery.tsx, NewsletterAndContact.tsx y WhatsAppFloatingWidget.tsx casi con certeza son el mismo falso positivo, pero las dejé sin tocar porque el hook no se disparó sobre esos archivos en esta sesión.

## Persona Red Flags

**Riley (stress-tester):** alternar rápidamente entre el input numérico, el slider y los chips de precio antes exponía el bug de la cuota congelada en segundos (ya corregido). Escribir un precio fuera de rango (ej. 99999999) sigue sin techo aplicado (el código solo fuerza un piso de $1,000).

**Casey (usuario móvil):** en móvil, el simulador apila precio → 2 tarjetas de modalidad → 8 botones de plazo → resumen → 4 campos de formulario en una sola columna larga sin nada fijo (sticky); para cuando llega al botón de envío, la cuota calculada que lo convenció ya se desplazó fuera de vista.

**"Doña Rosa", 45, sector informal, sin historial bancario formal, primera vez usando un "simulador" financiero, en un Android antiguo con pantalla dañada al sol:** el microcopy pervasivo de 10-11px sobre el tema oscuro del simulador es difícil de leer con reflejo solar; el triple control redundante de precio asume una fluidez de UI que puede no tener; y nada en el simulador explica en lenguaje simple qué pasa si se atrasa una cuota — el FAQ solo cubre el prepago anticipado, dejando sin atender justo la ansiedad que tendría un comprador sin historial crediticio.

## Minor Observations

- El nav de escritorio del Header solo aparece desde `xl:` (1280px) — un corte inusualmente conservador frente al más común `lg:` (1024px).
- El modal de detalle de PropertiesGallery no tiene cierre por Escape ni por click en el fondo, solo el botón X.
- El copy "IA Activa"/"Análisis Inteligente de Viabilidad CADIS" presenta texto enlatado como si fuera generado/vivo por IA, cuando no hay integración de Gemini activa en el código — el mismo tipo de brecha de autenticidad que la galería de fotos.
- Formato de números inconsistente: precios usan `toLocaleString()` (sin decimales), cuotas mensuales usan `toFixed(2)` — no está mal, pero conviene una sola utilidad de formato de moneda compartida.
- `transition-all` se usa de forma extendida en vez de propiedades específicas (`transition-colors`, `transition-transform`), lo cual anima todas las propiedades del elemento y es más costoso de lo necesario.

## Questions to Consider

- Si un lead escribe al número de WhatsApp "equivocado" (71234567) desde cualquiera de las CTAs secundarias, ¿alguien lo está viendo hoy — y cómo sabría CADIS si ya se perdieron leads así?
- ¿El equipo de ventas se sentiría cómodo defendiendo la "Galería Fotográfica Real" ante un comprador escéptico que pida ver una foto real de su lote?
- Dado que el cálculo de la cuota inicial estaba mal justo en el componente construido para demostrar la regla del 30%, ¿alguien ha comparado una simulación en vivo contra lo que un vendedor dice en persona?

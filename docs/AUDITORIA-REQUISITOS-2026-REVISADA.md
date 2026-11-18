# Auditoría revisada — Proyecto Placitum 2026

**Fecha:** 17 de noviembre de 2026
**Criterio nuevo:** el docente autorizó omitir el multiarchivo justificando que
VS Code puede abrir una carpeta con varios archivos y que esa es la IDE del
proyecto. También autorizó omitir otras especificaciones que no tengan sentido
para este tipo de lenguaje, **siempre que se justifiquen correctamente**.

**Alcance:** HEAD actual de `pl-lg`, `pl-lsp` y `pl-vscode`; la raíz no es un
repositorio git. Se revisaron código, documentación, tests, tags e historial.

> **Actualización (17 nov 2026):** se generaron
> [`PROYECTO-PLACITUM-2026.md`](./PROYECTO-PLACITUM-2026.md) y su
> [`PDF`](./PROYECTO-PLACITUM-2026.pdf), con el planteamiento del problema y
> las justificaciones de exclusión. El menú de referencia y el estado resumido
> de análisis están implementados; los tags locales `v1.0.1`, `v0.1.1` y
> `v0.1.3` también. Quedan el push/PR, el proyecto de ejemplo, el manual y la
> presentación.

## 1. Veredicto revisado

Con la autorización del docente, **el multiarchivo, las importaciones y el
archivo principal dejan de ser fallos**: pasan a ser **exclusiones de alcance
autorizadas**. Lo mismo aplica, con distinto grado de justificación, a la
entrada por stdin, a la separación entero/flotante y al botón de compilación.

Pero la autorización **no convierte la omisión en cumplimiento automático**. El
docente pidió justificar correctamente y esa justificación ya está escrita en
[`PROYECTO-PLACITUM-2026.md`](./PROYECTO-PLACITUM-2026.md) §20.2. Además, la
frase “VS Code puede abrir una carpeta con varios archivos” justifica la
**organización del proyecto**, pero no demuestra **importación de funciones
entre archivos**. Hay que presentarla como una decisión de alcance aceptada, no
como una equivalencia funcional.

Los dos bloqueos documentales de la auditoría base ya están cubiertos:

1. **Documentación del proyecto en PDF** (`PROYECTO-PLACITUM-2026.pdf`, 26
   páginas, con portada, TOC, problema, lenguaje, arquitectura y pruebas).
2. **Planteamiento del problema y evidencias de investigación** (sección 2 del
   documento del proyecto).

Quedan brechas P1: proyecto de ejemplo en carpeta, publicar/pushear los tags y
mergear los PR, manual y presentación, y el pre-chequeo semántico antes de
ejecutar. El menú de referencia y el estado de análisis ya están implementados.

### Resumen revisado por sección

| Estado | Secciones | Total |
|---|---|---:|
| ✅ Cumple | 1, 3, 10, 15, 17 | 5 |
| ✅* Cumple por equivalencia | 6, 9, 11, 12, 13, 16 | 6 |
| 🟡 Parcial | 2, 4, 5, 14, 18, 19, 20 | 7 |
| ❌ No cumple | — | 0 |
| ⚪ Excluido autorizado | 7, 8 | 2 |
| ⚪ No verificable | 21 | 1 |

> Comparado con la auditoría base, desaparecen como “no cumple” las secciones
> 3, 6, 7, 8 y 17: multiarchivo/imports/main quedan como exclusión autorizada,
> y el PDF/planteamiento ya están generados. El veredicto global mejora, pero
> sigue dependiendo de que la justificación y los P1 restantes se mantengan.

## 2. Exclusiones autorizadas: qué cubren y qué no

| Requisito omitido | Cómo se justifica | ¿Es suficiente? |
|---|---|---|
| Proyecto multiarchivo con importación de funciones (6, 8) | El proyecto es un **workspace de VS Code**: se abre una carpeta, el explorador permite crear/abrir/renombrar/eliminar/seleccionar archivos y el archivo activo se ejecuta con `Placitum: Run file`. Cada `.placitum` es una unidad de ejecución y un límite de capabilities; no se componen manifiestos entre archivos. | **Parcialmente.** Cubre la organización y edición multiarchivo, pero **no la reutilización de funciones entre archivos**. Es una exclusión de alcance, no una equivalencia funcional. Debe quedar aceptada explícitamente y escrita en el PDF. |
| Archivo principal (7) | En un lenguaje de shell cada script es ejecutable por sí mismo; el “punto de entrada” es el archivo activo/`placitum run <file>`. No hay un proyecto que compilar en conjunto. | **Sí, si se acepta el modelo de scripts independientes.** Es coherente con el lenguaje y con VS Code. |
| Entrada de datos por stdin (5.3) | El modelo de capabilities prohíbe canales ambientales implícitos. La entrada llega por `fs.readFile!`, `curl!` o se valida con `env(...)`; todo debe declararse en `needs`. | **Sí, si se documenta.** La entrada existe, pero es explícita (archivos/red), no interactiva. |
| Entero y flotante separados (5.5) | `number` es un IEEE double único; es una decisión común en lenguajes de shell/scripting (Lua, JS) que evita overflow de enteros y coerciones. Quedan 4 tipos simples + 2 compuestos. | **Sí, como simplificación de diseño.** Hay que documentar que “number” cubre enteros y flotantes y explicar las restricciones. |
| Botón de compilar / IDE propio (9, 13) | VS Code + LSP hacen análisis continuo; `Placitum: Reanalyze file` es la acción explícita. El lenguaje es interpretado: no hay una fase separada de compilación a código objeto. | **Sí para el botón**, porque el análisis es continuo. **Falta** un mensaje/estado que diga “análisis OK” o “N errores” además de los diagnósticos. |
| Errores de importación y warnings (12) | No hay imports, así que no hay errores de importación. El lenguaje no emite warnings: todos los diagnósticos son errores. | **Aceptable como N/A**, siempre que se diga en la documentación. Si se agregan warnings, el esquema ya los soporta. |
| Menú de referencia del lenguaje (10) | No se justifica omitirlo: es una función de IDE útil y fácil de agregar. VS Code tiene command palette, pero no una referencia de Placitum. | **No.** Agregar un comando “Placitum: Language reference” con palabras reservadas, sintaxis, tipos, control, funciones, operaciones e imports (aunque imports sea N/A). |
| PDF, planteamiento, logotipo y tabla de palabras (3, 5.1, 5.2, 17) | No son especificaciones que “no tengan sentido” para este lenguaje; son entregables de documentación e identidad. | **No se pueden omitir.** Siguen siendo brechas reales. |

### La justificación del multiarchivo, en términos defendibles

La justificación correcta no es “VS Code ya permite varios archivos”, sino algo
así:

> Placitum es un lenguaje de shell orientado a scripts con capabilities. La
> unidad de ejecución y de seguridad es el archivo `.placitum`: cada script
> declara su propio `needs` y se ejecuta de forma independiente. Componer
> manifiestos de capabilities entre archivos introduciría ambigüedad sobre qué
> permisos hereda cada función y rompería el modelo de “un script = un límite
> de capabilities”. Por eso se excluyó un sistema de importaciones. El proyecto
> se organiza como un workspace de VS Code: el explorador permite crear, abrir,
> renombrar, eliminar y seleccionar archivos, y el archivo activo es el punto
> de entrada que ejecuta `Placitum: Run file`. Esta exclusión fue autorizada
> por el docente [fecha/medio]. Limitación: no hay reutilización de funciones
> entre archivos; las funciones compartidas deben duplicarse o extraerse a un
> script invocable.

Esta justificación es coherente con el modelo de seguridad del lenguaje y con
el uso de VS Code como IDE. **No convierte el proyecto en un sistema de
módulos**, y conviene decirlo con honestidad: es una exclusión de alcance
autorizada. Si el docente ya lo aceptó, no debería penalizarse como requisito
faltante; si no quedó por escrito, hay que pedir confirmación y citarla en el
PDF.

### Justificaciones breves para el PDF

**Entrada de datos:**

> No se agregó entrada estándar (stdin) porque sería un canal ambiental
> implícito, contrario al modelo de capabilities. Toda entrada se declara en
> `needs` y llega por `fs.readFile!`, `curl!` o la validación de `env(...)`.
> Esto hace que el origen de los datos sea visible y auditable.

**Números:**

> `number` es un IEEE double único. No se separan enteros y flotantes para
> evitar overflow de enteros, coerciones implícitas y dos conjuntos de
> operadores; es la misma decisión que toman lenguajes de scripting como Lua o
> JavaScript. Las restricciones (por ejemplo, `/0` es E504) están documentadas.

**Compilación:**

> El análisis es continuo a través del servidor LSP: lexer, parser, extractor,
> binder y chequeos estáticos producen diagnósticos mientras se edita.
> `Placitum: Reanalyze file` fuerza el análisis. No hay un botón “compilar”
> separado porque el lenguaje es interpretado y no genera código objeto; el
> estado de análisis se refleja en los diagnósticos de VS Code.

## 3. Matriz revisada

| # | Requisito | Estado | Evidencia / nota |
|---|---|---|---|
| 1 | Lenguaje orientado a un problema concreto | ✅ | `pl-lg/README.md:3-7`; `placitum-implementation.md:55-90`. El objetivo técnico está; el planteamiento académico falta (#3). |
| 2 | Entorno gráfico, compilación, ejecución, multiarchivo, innovación | 🟡 | GUI/ejecución/innovación cubiertas; multiarchivo excluido; compilación es análisis continuo. |
| 3 | Planteamiento del problema (6 puntos) | ✅ | Sección 2 de `PROYECTO-PLACITUM-2026.md`: problema, afectados, contexto, soluciones existentes, limitaciones, aporte y evidencias de investigación. |
| 4 | Propuesta de solución (usuarios, contexto, alcance, limitaciones, beneficios, características, ejemplos) | 🟡 | README cubre características y ejemplos; arquitectura cubre alcance. Faltan usuarios, contexto, beneficios y justificación de un lenguaje nuevo. |
| 5 | Diseño del lenguaje (identidad, palabras, sintaxis, semántica, tipos) | 🟡 | Lo aplicable está implementado y documentado; faltan tabla de palabras reservadas, logotipo, usuarios y documentar las exclusiones (stdin, int/float, imports, main). |
| 6 | Proyecto multiarchivo y árbol de archivos | ✅* | VS Code cubre el workspace y las operaciones de archivos; imports/main excluidos por autorización. La principal limitación es no poder compartir funciones entre archivos. |
| 7 | Archivo principal único y validación | ⚪ | Excluido: cada script es ejecutable; el archivo activo es el punto de entrada. Documentar. |
| 8 | Importación de funciones entre archivos y sus validaciones | ⚪ | Excluido por autorización; no hay imports (`pl-lg/README.md:52-53`). Documentar que no hay reutilización entre archivos. |
| 9 | IDE: menú, árbol, editor, salida, compilar, ejecutar, archivo activo, estado | ✅* | VS Code cubre editor/árbol/salida/ejecución; menú de referencia y estado implementados. El botón de compilar se sustituye por análisis continuo + `Reanalyze`. |
| 10 | Menú de opciones con referencia del lenguaje | ✅ | Comando `placitum.showReference` implementado con palabras, sintaxis, tipos, operaciones, capabilities y comandos. |
| 11 | Editor: escribir, abrir, guardar, varios archivos, ubicar errores, insertar contenido; opcionales | ✅* | VS Code cubre edición/guardado/pestañas/búsqueda/temas; la extensión aporta gramática, diagnósticos y quick fixes. |
| 12 | Salida: errores, advertencias, resultados, estado de compilación/ejecución; tipo/archivo/línea/descripción/causa | ✅* | Diagnósticos, terminal y resumen en barra/canal (`Placitum — Analysis`); `format-error.ts` da código, archivo, línea, mensaje y `hint`. Import errors N/A; warnings no se emiten. |
| 13 | Compilación: análisis y validaciones; indicar éxito/errores | ✅* | Lex/parse/extract/guard + checks LSP + resumen de estado; no hay botón separado (justificado); imports/main N/A. |
| 14 | Ejecución: entrada, instrucciones, expresiones, control, variables, funciones, retornos, imports, resultados | 🟡 | Evaluador completo; imports N/A. Un error semántico puede ejecutar efectos previos antes de fallar (ver §5). |
| 15 | Innovación útil, integrada, validada, demostrable y explicada | ✅ | Capabilities, manifiesto estático, guard runtime, `explain`, atenuación, LSP y quick fixes; tests de capability/guard/chokepoint. |
| 16 | Git/GitHub: integrantes, contribuciones, commits, README, código/docs/pruebas, versión final, enlace | ✅* | 3 repos, 44+27+36 commits, 3 autores en `pl-lg`, 2 en `pl-lsp`, 1 en `pl-vscode`; tags locales `v1.0.1`, `v0.1.1`, `v0.1.3` creados. Falta push/PR y publicación npm. |
| 17 | Documentación del proyecto en PDF con todas las secciones | ✅ | `PROYECTO-PLACITUM-2026.pdf`, 26 páginas A4, con portada, TOC, planteamiento, lenguaje, arquitectura, pruebas y exclusiones. |
| 18 | Pruebas: 5 válidos, 5 sintácticos, 5 semánticos, 3 imports, 1 circular, 1 completo; con 5 campos | 🟡 | 207/207 en `pl-lg` y 288/288 en `pl-lsp`; se cumplen 5/5/5. Imports/circular N/A por exclusión; falta prueba completa del problema y el informe con objetivo/obtenido/estado. |
| 19 | Entregables: fuente, ejecutable, ejemplo, PDF, manual, pruebas, presentación, enlace, versión final | 🟡 | Fuente/instalación/tests/enlace sí; ejemplo multiarchivo y PDF no; manual/presentación/versión final parciales. |
| 20 | Equipo máximo 3; participación en diseño, programación, pruebas, documentación, presentación; defensa individual | 🟡 | `AUTHORS` lista 3; colaboración técnica visible; no hay evidencia de presentación/defensa y la extensión concentra el trabajo en Kristel. |
| 21 | Fecha de entrega | ⚪ | No está en el repositorio; confirmar con el curso. |

## 4. Lo que sigue siendo P0

### 4.1 Documento PDF del proyecto

No se puede omitir: es un entregable explícito y el docente no lo incluyó en la
autorización. El PDF debe incorporar todas las secciones del requisito 17 y,
además, una sección de **“Decisiones de alcance y exclusiones autorizadas”**
con:

- Multiarchivo/imports/main: justificación técnica + autorización del docente.
- Entrada por stdin: por qué la entrada es explícita vía capabilities.
- `number` único: por qué no se separan enteros y flotantes.
- Compilación: por qué el análisis es continuo y no hay botón separado.
- Menú/estado: qué se agregó o por qué se resolvió con VS Code.

Sin esa sección, la autorización del docente no queda evidenciada y el proyecto
puede verse como incumplimiento.

### 4.2 Planteamiento del problema y evidencias de investigación

Es la otra sección que no se puede omitir: vale 12% de la rúbrica. Hay que
escribir, como mínimo:

- Cuál es el problema (scripts con acceso ambiental excesivo; falta de
  trazabilidad de efectos).
- A quiénes afecta (usuarios de shell, automatizaciones, agentes/IA que
  ejecutan scripts generados).
- Contexto (scripts que leen archivos, hacen HTTP, escriben archivos).
- Soluciones existentes (sandboxes, contenedores, permisos del sistema, shells
  con `set -e`/`set -u`, lenguajes con módulos de permisos).
- Limitaciones de esas soluciones (son externas al código, no declaran
  intención, no son portables, etc.).
- Cómo Placitum ayuda: `needs`, prueba estática, guard runtime, manifiesto
  `explain`, atenuación por función.
- Evidencias de investigación: referencias a capability-based security,
  principio de menor privilegio, sandboxing y shell scripting.

La motivación ya existe en `placitum-implementation.md:55-90`, pero está escrita
como directiva de implementación, no como planteamiento académico.

## 5. Brechas P1 restantes

El menú de referencia, el estado de análisis, el PDF, el planteamiento, la tabla
de pruebas y el logotipo ya están cubiertos. Quedan:

1. **Proyecto de ejemplo**: una carpeta con varios scripts independientes y un
   README que explique que no se importan entre sí; por ejemplo
   `reporte.placitum`, `limpieza.placitum`, `consulta.placitum`.
2. **Push/PR de los tags**: los tags `v1.0.1`, `v0.1.1` y `v0.1.3` existen
   localmente; falta pushearlos y mergear las ramas. Además, `placitum@1.0.1`
   y `placitum-lsp@0.1.1` todavía no están publicados en npm.
3. **Entregables**: manual de usuario formal y presentación.
4. **Error semántico antes de ejecutar**: `print!("before"); let x = 1 + "a"`
   imprime `before` y luego falla. Si se quiere cumplir literalmente el
   requisito 14, la extensión/CLI debería hacer un pre-chequeo estático y
   bloquear la ejecución; si se justifica como lenguaje dinámico, documentarlo.

## 6. Evidencia de verificación

| Componente | Comando | Resultado |
|---|---|---|
| `pl-lg` | `npm test` | 26 archivos, **207/207 tests pasan** |
| `pl-lg` | `npm run typecheck` + `npm run build` | OK |
| `pl-lsp` | `npm test` | 34 archivos pasan, 1 skip; **288/288 tests pasan, 4 skip** |
| `pl-lsp` | `npm run typecheck` + `npm run build` | OK |
| `pl-vscode` | `npm run test:guard` | 8/8 pasan (3 guards + 3 status + 2 reference) |
| `pl-vscode` | `smoke:server`, `smoke:cli`, `smoke:wrapper` | Los tres pasan |

La auditoría no abrió VS Code de forma interactiva; usó los smokes y la lectura
del código. La presentación/defensa no es verificable desde el repositorio.

## 7. Conclusión

Con la autorización del docente, el proyecto **puede presentarse como un
lenguaje de un solo archivo/workspace de VS Code**, no como un sistema de
módulos. Eso elimina el fallo más grande de la auditoría anterior, siempre que
la exclusión quede justificada por escrito y con una limitación explícita: no
hay reutilización de funciones entre archivos.

El núcleo técnico está bien: lenguaje, ejecución, capabilities, LSP, extensión
y pruebas. Lo que queda no es principalmente código, sino **documentación y
justificación**: el PDF del proyecto, el planteamiento del problema, el informe
de pruebas, el menú de referencia y el cierre de versiones.

Si se completan los dos P0 y se agregan las justificaciones de exclusión, el
proyecto queda en una posición defendible para la mayoría de los requisitos.

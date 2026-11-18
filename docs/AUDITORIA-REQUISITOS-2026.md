# Auditoría de requisitos — Proyecto Placitum 2026

**Fecha:** 17 de noviembre de 2026
**Alcance:** estado actual (HEAD) de `pl-lg`, `pl-lsp` y `pl-vscode`. La raíz
`placitum/` no es un repositorio git; el proyecto vive en tres repos hermanos.
**Método:** lectura de código y documentación, revisión de historial/tags y
ejecución de las suites de pruebas y builds.

> **Revisión 2:** este documento es la auditoría base. La versión que incorpora
> la autorización del docente para omitir el multiarchivo y justificar otras
> exclusiones está en
> [`AUDITORIA-REQUISITOS-2026-REVISADA.md`](./AUDITORIA-REQUISITOS-2026-REVISADA.md).

## 1. Veredicto ejecutivo

El proyecto tiene un núcleo de lenguaje sólido y verificado: lexer, parser,
evaluador, guard de capabilities, CLI, servidor LSP y extensión de VS Code. La
innovación principal (seguridad por capabilities con manifiesto estático y guard
en runtime) está implementada, integrada y probada.

La extensión de VS Code **se acepta como equivalente al entorno gráfico** pedido
en los requisitos 9 y 11. Bajo esa equivalencia cubre editor, árbol de archivos
de VS Code, salida en terminal, diagnósticos y botón de ejecución.

Sin embargo, el proyecto **no cumple dos bloques obligatorios**:

1. **Proyectos multiarchivo, importación de funciones entre archivos y archivo
   principal** (requisitos 2, 6, 7, 8 y partes de 13, 14, 18 y 19). El propio
   lenguaje declara que no tiene `import` ni sistema de módulos.
2. **Documentación del proyecto en PDF** con las secciones académicas exigidas
   (requisitos 17 y 19). El único PDF existente es la guía de desarrollo y
   publicación de la extensión, no el informe del proyecto.

Además quedan brechas parciales en: menú de referencia del entorno, botón/estado
de compilación, pruebas de importación/circular, tabla de palabras reservadas,
distinción entero/flotante, entrada de datos, logotipo y cierre de versiones.

### Resumen por sección

| Estado | Secciones | Total |
|---|---|---:|
| ✅ Cumple | 1, 11 (por equivalencia), 15 | 3 |
| 🟡 Parcial | 2, 4, 5, 9, 12, 13, 14, 16, 18, 19, 20 | 11 |
| ❌ No cumple | 3, 6, 7, 8, 10, 17 | 6 |
| ⚪ No verificable | 21 | 1 |

> El conteo es por sección del enunciado. A nivel de subrequisitos, la mayoría
> de sintaxis, control de flujo, funciones, operadores, ejecución e innovación
> sí están implementados; las fallas se concentran en multiarchivo/imports y en
> el entregable documental.

## 2. Matriz de cumplimiento

### 2.1 Objetivo, descripción y problema (secciones 1–4)

| # | Requisito | Estado | Evidencia | Brecha / acción |
|---|---|---|---|---|
| 1 | Lenguaje orientado a un problema concreto | ✅ | `pl-lg/README.md:3-7`; `pl-lg/placitum-implementation.md:55-90` | El objetivo técnico está claro: shell capability-secure. Falta el planteamiento académico formal (ver #3). |
| 2 | Entorno gráfico, compilación, ejecución, multiarchivo, innovación | 🟡 | Extensión VS Code + LSP; tests verdes | Editor/ejecución/innovación sí; compilación solo como análisis; multiarchivo/imports no. |
| 3 | Planteamiento del problema (6 puntos) | ❌ | No hay sección de planteamiento; `pl-lg/README.md:3-7` solo describe el lenguaje y `placitum-implementation.md:55-90` da filosofía, no usuarios/contexto/soluciones existentes | Escribir problema, afectados, contexto, soluciones actuales, limitaciones y relación con Placitum. |
| 4 | Propuesta de solución (usuarios, contexto, alcance, limitaciones, beneficios, características, ejemplos) | 🟡 | `pl-lg/README.md` cubre características y ejemplos; `docs/ARQUITECTURA.md` cubre arquitectura | Faltan usuarios, contexto de uso, beneficios esperados y justificación de por qué un lenguaje nuevo. |

### 2.2 Diseño del lenguaje (sección 5)

| # | Requisito | Estado | Evidencia | Brecha / acción |
|---|---|---|---|---|
| 5.1 | Identidad: nombre, propósito, usuarios, extensión, logotipo, filosofía | 🟡 | Nombre `Placitum`, extensión `.placitum` (`pl-vscode/package.json:44-46`), filosofía en `placitum-implementation.md:55-90` | No hay logotipo ni usuarios explícitos; el propósito está en una línea. |
| 5.2 | Tabla de palabras reservadas con propósito, uso y ejemplo | 🟡 | Los 14 keywords están en `pl-lg/src/lexer/lexer.ts:78-93` | No existe la tabla documental de 4 columnas; el lexer no reemplaza ese entregable. |
| 5.3 | Sintaxis: instrucciones, condicionales, ciclos, funciones y operadores | 🟡 | Ver desglose abajo | Faltan entrada de datos, importaciones y una función principal explícita. |
| 5.4 | Semántica: inicio, bloques, indentación, variables, alcances, expresiones, condiciones, ciclos, llamadas, retornos, importaciones, errores | 🟡 | `pl-lg/README.md:29-53`, `:74-178`, `:291-312` | Todo está documentado salvo importaciones, que no existen. La indentación no es obligatoria (bloques con `{}`). |
| 5.5 | 5 tipos simples y 2 compuestos, con declaración, uso, operaciones y restricciones | 🟡 | `pl-lg/README.md:55-72`; `pl-lg/src/shared/values.ts:3` | Solo 4 tipos simples: `number`, `string`, `boolean`, `null`. No hay entero separado de flotante. Compuestos: `array` y `object` (2/2). |

#### Desglose 5.3

| Subrequisito | Estado | Evidencia |
|---|---|---|
| Declaración de variables (`let`) | ✅ | `pl-lg/README.md:74-87` |
| Asignación | ✅ | `pl-lg/README.md:74-79` |
| Entrada de datos | ❌ | No hay builtin de stdin/input; `pl-lg/src/stdlib/stdlib.ts:15-27` solo tiene `print`, `eprint`, `fs.readFile`, `fs.writeFile`, `curl`, `json.parse`. `env` solo se verifica, no se lee. |
| Salida de datos (`print!`/`eprint!`) | ✅ | `pl-lg/README.md:220-244` |
| Llamadas a funciones | ✅ | `pl-lg/README.md:152-178` |
| Importaciones | ❌ | `pl-lg/README.md:52-53` y `docs/LENGUAJE.md:28` dicen explícitamente que no hay `import` ni módulos. |
| Condicional simple / con alternativa / múltiple | ✅ | `if`, `else if`, `else` en `pl-lg/README.md:123-150` |
| Ciclo `for` / `while` | ✅ | `for..in` y `while` en `pl-lg/README.md:123-150` |
| Funciones con retorno / sin retorno | ✅ | `return` devuelve valor o `null`; `pl-lg/README.md:152-178` |
| Parámetros, argumentos, llamadas | ✅ | Aridad exacta, sin defaults ni variádicos; `pl-lg/README.md:169-178` |
| Punto de entrada / función principal | 🟡 | El script se ejecuta desde la primera sentencia de tope (`pl-lg/src/evaluator/run.ts:22-27`); no hay `main` ni archivo principal. |
| Aritmética (`+ - * /`) | ✅ | `pl-lg/README.md:102-121` |
| Lógica (`&&`, `\|\|`, `not`) | ✅ | `pl-lg/README.md:102-121` |
| Relacionales (`== != < <= > >=`) | ✅ | `pl-lg/README.md:102-121` |

### 2.3 Proyectos, entorno y ejecución (secciones 6–14)

| # | Requisito | Estado | Evidencia | Brecha / acción |
|---|---|---|---|---|
| 6 | Proyecto multiarchivo y árbol de archivos (crear, abrir, renombrar, eliminar, seleccionar activo, identificar principal) | ❌ | No hay concepto de proyecto ni imports; VS Code cubre el árbol por equivalencia | Faltan proyecto multiarchivo e identificación del archivo principal. Crear/abrir/renombrar/eliminar/seleccionar sí los da VS Code. |
| 7 | Archivo principal: existe, es único, inicia ejecución, dependencias válidas | ❌ | `placitum run <file>` acepta cualquier archivo (`pl-lg/src/cli/main.ts:75-85`); `Run file` ejecuta el archivo activo (`pl-vscode/src/extension.ts:55-88`) | Implementar convención de archivo principal y validar existencia/unicidad/dependencias. |
| 8 | Importación de funciones entre archivos y sus 7 validaciones | ❌ | No hay sintaxis de import; `pl-lg/README.md:52-53`; no hay tests de import | Implementar archivo/función/aridad/tipos/duplicados/circular/errores en importados. |
| 9 | Entorno gráfico: menú, árbol, editor, salida, compilar, ejecutar, archivo activo, estado | 🟡 | Extensión VS Code: editor, árbol, terminal, Run, diagnósticos (`pl-vscode/README.md`) | Por equivalencia se acepta el IDE; faltan menú de referencia y botón/estado de compilación. |
| 10 | Menú de opciones: palabras reservadas, sintaxis, control, funciones, operaciones, semántica, tipos, imports, ejemplos | ❌ | `pl-vscode/package.json:57-75` solo declara 4 comandos: run, manifest, reanalyze, addNeeds | Agregar un menú/comando de referencia del lenguaje (webview o documento). |
| 11 | Editor: escribir, abrir, guardar, varios archivos, ubicar errores, insertar contenido generado; opcionales | ✅ | VS Code cubre edición/guardado/pestañas/búsqueda/temas; la extensión aporta gramática, diagnósticos y quick fixes | Por equivalencia cumple. La inserción de contenido generado se limita a quick fixes (`addNeeds`, declarar, renombrar). |
| 12 | Salida: errores de sintaxis/semánticos/importación/ejecución, advertencias, resultados, estado de compilación/ejecución; tipo/archivo/línea/descripción/causa | 🟡 | Diagnósticos LSP y terminal; `format-error.ts` incluye código, archivo, línea, mensaje y `hint` | No hay errores de importación (no existen), no se emiten warnings (aunque el esquema los admite) y no hay estado explícito de compilación. |
| 13 | Compilación: palabras/símbolos, sintaxis, variables, tipos, operaciones, funciones, parámetros, imports, punto de entrada, errores relacionados; indicar éxito/errores | 🟡 | Pipeline lex/parse/extract/guard; checks estáticos del LSP (`pl-lsp/README.md:20-35`); `npm run build` OK | No hay `compile`/botón de compilar; imports y main ausentes; `run` no hace un pre-pase semántico completo antes de ejecutar. |
| 14 | Ejecución: desde entrada, instrucciones, expresiones, condicionales, ciclos, variables, llamadas, retornos, imports, resultados; no ejecutar con errores | 🟡 | Evaluador completo (`pl-lg/src/evaluator/interpreter.ts`, `run.ts`); `run` ejecuta el AST | Imports ausentes. Un error semántico puede ejecutar efectos previos antes de fallar (ver §4). |

### 2.4 Innovación, Git, documentación, pruebas y entregables (15–19)

| # | Requisito | Estado | Evidencia | Brecha / acción |
|---|---|---|---|---|
| 15 | Innovación útil, integrada, validada, demostrable y explicada técnicamente | ✅ | Capabilities: `needs`, extractor estático, guard runtime, `explain`, atenuación `only`, LSP y quick fixes. `pl-lg/README.md:246-275`; `placitum-implementation.md:55-90`; tests de capability/guard/chokepoint | La demostración en defensa no es verificable desde el repo, pero técnicamente está implementada y probada. |
| 16 | Git/GitHub: integrantes, contribuciones, commits progresivos, README, código/docs/pruebas, versión final, enlace | 🟡 | 3 repos, `AUTHORS` con 3 nombres; 44+27+36 commits; READMEs y tests | Los tags no identifican el estado final: `pl-lg` tiene `v1.0.0` pero package 1.0.1; `pl-lsp` no tiene tag 0.1.1 y `v0.1.0` no es ancestro; `pl-vscode` `v0.1.2` no es ancestro del HEAD. |
| 17 | Documentación únicamente en PDF con portada, TOC, introducción, problema, investigación, propuesta, objetivos, alcance, lenguaje, palabras, sintaxis, semántica, tipos, funciones, control, operaciones, archivos, imports, compilación, ejecución, errores, innovación, arquitectura, pruebas, contribuciones, conclusiones, referencias y anexos | ❌ | Solo existe `pl-vscode/docs/DESARROLLO-Y-PUBLICACION.pdf`, que es una guía de la extensión | Crear el PDF del proyecto. El material Markdown existente sirve de base, pero faltan varias secciones académicas y la consolidación. |
| 18 | Pruebas: 5 válidos, 5 sintácticos, 5 semánticos, 3 imports, 1 circular, 1 completo del problema; con objetivo/entrada/esperado/obtenido/estado | 🟡 | Ver desglose abajo; suites verdes | Faltan imports/circular y el informe de pruebas con los campos pedidos. |
| 19 | Entregables: fuente, ejecutable/instalación, proyecto de ejemplo, PDF, manual, pruebas, presentación, enlace GitHub, versión final | 🟡 | Fuente, `local-deploy.sh`, npm, VSIX, READMEs y tests | Ejemplo multiarchivo ausente; PDF del proyecto ausente; no hay presentación en el repo; manual formal y versión final parciales. |

#### Desglose 18 (pruebas)

| Subrequisito | Estado | Evidencia |
|---|---|---|
| Cinco programas válidos | ✅ | `examples/rosetta.placitum`, `tests/capability/kitchen-sink.placitum`, `tests/eval/control-flow.placitum`, `tests/parser/rosetta.placitum`, `tests/parser/kitchen-sink.placitum` |
| Cinco errores sintácticos | ✅ | 7 fixtures de lexer + 14 de parser en `pl-lg/tests/*/negative/` |
| Cinco errores semánticos | ✅ | 9 fixtures de eval + 4 de binder en `pl-lg/tests/eval/negative` y `pl-lsp/tests/fixtures/binder` |
| Tres pruebas de importaciones | ❌ | 0 pruebas; no hay imports |
| Una prueba de importación circular | ❌ | 0 pruebas; no hay imports |
| Una prueba completa relacionada con el problema | 🟡 | `rosetta.placitum` recorre el lenguaje y capabilities, pero no un caso de problema concreto con varios archivos |
| Objetivo, entrada, esperado, obtenido, estado por prueba | 🟡 | Los fixtures tienen entrada y `.expected-error.json`/goldens; el runner da el estado. Falta el informe con objetivo y resultado obtenido documentado |

#### Desglose 19 (entregables)

| Entregable | Estado | Evidencia |
|---|---|---|
| Código fuente | ✅ | `pl-lg/src`, `pl-lsp/src`, `pl-vscode/src` |
| Ejecutable o instrucciones de instalación | ✅ | `pl-lg/local-deploy.sh`, npm, VSIX de VS Code |
| Proyecto de ejemplo | 🟡 | Solo `rosetta.placitum`, de un archivo; no hay proyecto multiarchivo |
| Documentación PDF | ❌ | No existe el informe del proyecto en PDF |
| Manual de usuario | 🟡 | `pl-lg/README.md` y `pl-vscode/README.md` sirven de guía, pero no hay manual formal separado |
| Pruebas | ✅ | 207 en `pl-lg`, 288 en `pl-lsp`, smokes de la extensión |
| Presentación | ⚪ | No hay archivo de presentación en los repos; puede existir fuera |
| Enlace del repositorio | ✅ | Remotes de GitHub y referencias en `docs/README.md`; son tres repos, no uno |
| Versión final identificada | 🟡 | Versiones en `package.json`, pero tags incompletos/desalineados |

### 2.5 Equipo y fecha (20–21)

| # | Requisito | Estado | Evidencia | Brecha |
|---|---|---|---|---|
| 20 | Equipo máximo 3; todos participan en diseño, programación, pruebas, documentación, presentación; defensa individual | 🟡 | `AUTHORS` lista 3 nombres; 3 autores en `pl-lg`, 2 en `pl-lsp` y 1 en `pl-vscode` (35 de 36 commits; 1 bot) | La colaboración técnica es visible, pero no hay evidencia de presentación/defensa y la extensión concentra el trabajo en una persona. |
| 21 | Fecha de entrega | ⚪ | No está en el repositorio | Confirmar con el programa del curso. |

## 3. Brechas críticas y plan de acción

### P0 — bloquean la entrega si se evalúa literalmente

#### 3.1 Proyectos multiarchivo, imports y archivo principal

Es la brecha funcional más grande. No es una omisión de la extensión: el
lenguaje mismo no tiene `import` ni módulos (`pl-lg/README.md:52-53`,
`docs/LENGUAJE.md:28`). Sin esto no se cumplen los requisitos 2, 6, 7, 8 y
partes de 13, 14, 18 y 19.

Mínimo aceptable:

- Sintaxis de importación relativa al archivo actual.
- Resolución de archivos y funciones importadas.
- Validación de existencia de archivo/función, aridad, tipos, duplicados,
  ciclos y errores dentro de archivos importados.
- Archivo principal único, con validación de existencia y dependencias, y
  ejecución desde ese punto de entrada.
- Diagnósticos con archivo/línea también en archivos importados.
- Soporte LSP para definición/referencias/diagnósticos entre archivos.
- Tres pruebas de importación, una circular y un proyecto de ejemplo
  multiarchivo.

Si el alcance no se puede ampliar, hay que renegociar formalmente este punto
con el docente; no conviene presentarlo como si estuviera implementado.

#### 3.2 Documentación del proyecto en PDF

No existe. El PDF de `pl-vscode/docs/` es una guía de desarrollo/publicación de
la extensión, no el informe académico. Los Markdown actuales cubren lenguaje y
arquitectura, pero no el planteamiento, la investigación, las contribuciones,
las conclusiones ni el informe de pruebas.

El PDF debe incluir, como mínimo, todas las secciones del requisito 17. Una
forma práctica de armarlo es usar `pl-lg/README.md`, `docs/LENGUAJE.md`,
`docs/ARQUITECTURA.md` y `pl-lsp/docs/PHASES.md` como fuente, y agregar:

- Portada, tabla de contenidos e introducción.
- Planteamiento del problema y evidencias de investigación.
- Propuesta, objetivos, alcance y limitaciones.
- Palabras reservadas en tabla (palabra, propósito, uso, ejemplo).
- Sintaxis, semántica, tipos, funciones, control y operaciones.
- Organización de archivos e importaciones (cuando existan).
- Proceso de compilación y ejecución.
- Manejo de errores con ejemplos.
- Innovación explicada técnicamente.
- Arquitectura del aplicativo.
- Tabla de pruebas con objetivo, entrada, esperado, obtenido y estado.
- Contribuciones de los integrantes.
- Conclusiones, referencias y anexos.

### P1 — brechas parciales que conviene cerrar antes de la defensa

1. **Informe de pruebas**: agregar las pruebas de importación/circular y una
   tabla con los cinco campos pedidos. Las suites actuales son una buena base,
   pero no reemplazan el documento.
2. **Menú de referencia en la extensión**: comando “Placitum: Language
   reference” con palabras reservadas, sintaxis, tipos, estructuras, funciones,
   operaciones, imports y ejemplos. Hoy solo hay 4 comandos
   (`pl-vscode/package.json:57-75`).
3. **Estado de compilación**: un canal de salida/estado que diga “análisis OK”
   o muestre el resumen de errores, además de los diagnósticos del editor. Hoy
   “Reanalyze file” existe, pero no hay botón/estado de compilación.
4. **Tags y versión final**: crear `v1.0.1` en `pl-lg`, `v0.1.1` en `pl-lsp` y
   asegurar que `v0.1.2` de `pl-vscode` apunte al commit final. Los tags
   actuales no son ancestros del HEAD en dos repos.
5. **Identidad**: agregar logotipo/icono PNG y una sección de usuarios,
   propósito y filosofía. También falta la tabla de palabras reservadas.
6. **Tipos y entrada**: decidir si `number` cubre enteros y flotantes o si se
   agrega la distinción; documentar la decisión. Implementar o justificar la
   ausencia de entrada de datos.
7. **Entregables**: agregar proyecto de ejemplo multiarchivo, manual de usuario
   formal y presentación.

## 4. Evidencia de verificación ejecutada

| Componente | Comando | Resultado |
|---|---|---|
| `pl-lg` | `npm test` | 26 archivos, **207/207 tests pasan** |
| `pl-lg` | `npm run typecheck` + `npm run build` | OK |
| `pl-lsp` | `npm test` | 34 archivos pasan, 1 skip; **288 tests pasan, 4 skip** |
| `pl-lsp` | `npm run typecheck` + `npm run build` | OK |
| `pl-vscode` | `npm run test:guard` | 3/3 pasan |
| `pl-vscode` | `smoke:server`, `smoke:cli`, `smoke:wrapper` | Los tres pasan |

También se comprobó manualmente el comportamiento ante un error semántico:

```placitum
print!("before")
let x = 1 + "a"
```

Salida: imprime `before` y luego falla con `E501_EVAL_TYPE_MISMATCH` (exit 1).
Es decir, un error semántico **no se detecta antes de ejecutar** el resto del
script; esto incumple la parte de “no deberá ejecutarse un proyecto con errores
semánticos” del requisito 14. Un error de sintaxis sí detiene la ejecución antes
de cualquier efecto.

No se abrió VS Code de forma interactiva; la extensión se validó con sus smokes
y con lectura del código. La defensa individual no es verificable desde el
repositorio.

## 5. Riesgo por rúbrica

| Rubro | Peso | Riesgo | Motivo |
|---|---:|---|---|
| Documentación | 8% | Alto | No hay PDF del proyecto y faltan secciones académicas. |
| Planteamiento del problema y solución | 12% | Alto | No hay planteamiento formal ni evidencias de investigación. |
| Diseño del lenguaje | 15% | Medio | Núcleo sólido; faltan tabla de palabras, tipos entero/flotante y documentación de identidad. |
| Funcionamiento del aplicativo | 35% | Medio-alto | Núcleo/IDE bien; imports, main y estado de compilación faltan. |
| Gestión de versiones | 5% | Medio | Historial bueno; tags/versión final incompletos y proyecto dividido en 3 repos. |
| Defensa individual | 25% | No verificable | Depende de preparación y dominio; no hay evidencia en el repo. |

## 6. Conclusión

Placitum no es un proyecto vacío: el lenguaje, la ejecución, la seguridad por
capabilities y la integración con VS Code están implementados y con una base de
pruebas considerable. La equivalencia IDE/extensión es razonable y no debería
penalizarse como ausencia de entorno gráfico.

Pero, con una lectura literal del enunciado, **todavía no está listo para la
entrega final**: faltan dos requisitos obligatorios completos (multiarchivo/
imports/archivo principal y documentación PDF) y varios parciales. Si se
resuelven los P0 y se documentan las pruebas y la versión final, la mayor parte
de los requisitos restantes quedaría cubierta.

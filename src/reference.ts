/** Static in-editor language reference. No scripts, no network, no outside assets. */
export function referenceHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
<title>Placitum — Referencia del lenguaje</title>
<style>
  body {
    font-family: var(--vscode-font-family);
    color: var(--vscode-editor-foreground);
    background: var(--vscode-editor-background);
    padding: 20px 24px 40px;
    line-height: 1.5;
    max-width: 980px;
  }
  h1 { font-size: 1.7em; margin: 0 0 6px; }
  h2 {
    font-size: 1.2em;
    margin: 26px 0 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--vscode-panel-border);
  }
  p { margin: 6px 0; }
  ul { margin: 6px 0; padding-left: 22px; }
  code {
    font-family: var(--vscode-editor-font-family);
    background: var(--vscode-textCodeBlock-background);
    border-radius: 3px;
    padding: 1px 4px;
  }
  pre {
    background: var(--vscode-textCodeBlock-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 5px;
    padding: 10px 12px;
    overflow-x: auto;
    line-height: 1.35;
  }
  pre code { background: none; padding: 0; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0 14px; font-size: 0.95em; }
  th, td { border: 1px solid var(--vscode-panel-border); padding: 4px 6px; vertical-align: top; text-align: left; }
  th { background: var(--vscode-keybindingTable-headerBackground); }
  .note {
    border-left: 3px solid var(--vscode-textLink-foreground);
    background: var(--vscode-textBlockQuote-background);
    padding: 8px 12px;
    margin: 10px 0;
  }
</style>
</head>
<body>
<h1>Placitum — Referencia del lenguaje</h1>
<p>Lenguaje de shell con <strong>capabilities</strong>. Cada script declara en <code>needs</code> lo que puede tocar; los usos literales se prueban antes de ejecutar y el resto se valida en runtime.</p>

<h2>Estructura de un script</h2>
<pre><code>#!strict
# comentario

needs fs.read("**/config.json"), net("api.example.com")

let x = 1
print!(x)</code></pre>
<ul>
  <li>Una sentencia por línea; <code>;</code> no existe.</li>
  <li>Los bloques usan <code>{ }</code>; la indentación no es obligatoria.</li>
  <li><code>#</code> inicia un comentario. <code>#!strict</code> solo en la línea 1.</li>
</ul>

<h2>Palabras reservadas</h2>
<table>
  <tr><th>Palabra</th><th>Propósito</th><th>Ejemplo</th></tr>
  <tr><td><code>needs</code></td><td>Declarar capabilities</td><td><code>needs fs.read("data/*.json")</code></td></tr>
  <tr><td><code>let</code></td><td>Declarar variable</td><td><code>let total = 0</code></td></tr>
  <tr><td><code>fn</code></td><td>Definir función</td><td><code>fn add(a, b) { return a + b }</code></td></tr>
  <tr><td><code>if</code> / <code>else</code></td><td>Condicionales</td><td><code>if x &gt; 0 { ... } else { ... }</code></td></tr>
  <tr><td><code>while</code></td><td>Ciclo mientras</td><td><code>while retries &gt; 0 { ... }</code></td></tr>
  <tr><td><code>for</code> / <code>in</code></td><td>Iterar arrays</td><td><code>for item in items { ... }</code></td></tr>
  <tr><td><code>return</code></td><td>Retornar o terminar</td><td><code>return total</code></td></tr>
  <tr><td><code>not</code></td><td>Negación lógica</td><td><code>if not ready { ... }</code></td></tr>
  <tr><td><code>only</code></td><td>Atenuar capabilities de una función</td><td><code>fn f() needs only(fs.read("**/x")) { ... }</code></td></tr>
  <tr><td><code>true</code> / <code>false</code> / <code>null</code></td><td>Literales</td><td><code>let ok = true</code></td></tr>
</table>

<h2>Variables, salida y control</h2>
<pre><code>let name = "valor"
name = "otro"

print!("resultado")
eprint!("diagnóstico")

if score &gt;= 5 {
    print!("healthy")
} else if score &gt; 0 {
    print!("degraded")
} else {
    print!("down")
}

while retries &gt; 0 {
    retries = retries - 1
}

for endpoint in config.endpoints {
    print!(endpoint)
}</code></pre>

<h2>Funciones</h2>
<pre><code>fn add(a, b) {
    return a + b
}

fn log(message) {
    print!(message)
    return
}</code></pre>
<ul>
  <li>Parámetros y argumentos posicionales; aridad exacta.</li>
  <li>Sin defaults, variádicos ni sobrecarga. Sin hoisting.</li>
  <li>Funciones de primera clase; closures y recursión.</li>
  <li>Atenuación con <code>needs only(...)</code>.</li>
</ul>

<h2>Tipos</h2>
<table>
  <tr><th>Tipo</th><th>Uso</th><th>Restricciones</th></tr>
  <tr><td><code>string</code></td><td><code>"texto"</code>, <code>f"hola {name}"</code></td><td>Una línea; sin métodos ni <code>.length</code></td></tr>
  <tr><td><code>number</code></td><td><code>42</code>, <code>3.14</code></td><td>IEEE double; no hay enteros separados; <code>/0</code> es E504</td></tr>
  <tr><td><code>boolean</code></td><td><code>true</code>, <code>false</code></td><td>Usar <code>not</code>, <code>&amp;&amp;</code>, <code>||</code></td></tr>
  <tr><td><code>null</code></td><td><code>null</code></td><td>Falsy; sin operaciones propias</td></tr>
  <tr><td><code>array</code></td><td><code>[1, "dos"]</code></td><td>Sin indexación; se recorre con <code>for..in</code></td></tr>
  <tr><td><code>object</code></td><td><code>{ name: "app" }</code></td><td>Claves identificador; miembro faltante lee <code>null</code></td></tr>
  <tr><td><code>function</code></td><td><code>fn</code>, <code>json.parse</code></td><td>Igualdad por identidad</td></tr>
</table>

<h2>Operadores</h2>
<table>
  <tr><th>Precedencia</th><th>Operadores</th><th>Notas</th></tr>
  <tr><td>postfix</td><td><code>.member</code>, <code>call(...)</code>, <code>target!(...)</code></td><td>Bang calls siempre con paréntesis</td></tr>
  <tr><td>unario</td><td><code>not</code>, <code>-</code></td><td><code>not</code> produce booleano</td></tr>
  <tr><td>multiplicativo</td><td><code>*</code>, <code>/</code></td><td>Números; <code>/0</code> es E504</td></tr>
  <tr><td>aditivo</td><td><code>+</code>, <code>-</code></td><td><code>+</code> no mezcla número y string</td></tr>
  <tr><td>relacional</td><td><code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code></td><td>Solo números</td></tr>
  <tr><td>igualdad</td><td><code>==</code>, <code>!=</code></td><td>Profunda en arrays/objetos</td></tr>
  <tr><td>lógico</td><td><code>&amp;&amp;</code>, <code>||</code></td><td>Cortocircuito</td></tr>
  <tr><td>pipe</td><td><code>|</code></td><td>Pasa el valor a la siguiente etapa</td></tr>
  <tr><td>asignación</td><td><code>=</code></td><td>Target identificador</td></tr>
</table>

<h2>Capabilities y efectos</h2>
<pre><code>needs fs.read("data/**/*.json"), fs.write("out/*.txt"), net("api.example.com"), env(API_KEY), env(DEBUG?)

fn read_config(path) needs only(fs.read("**/config.json")) {
    return fs.readFile!(path) | json.parse
}

let response = "https://api.example.com/health" | curl!({ method: "GET" })</code></pre>
<ul>
  <li>Los builtins con efecto se alcanzan solo con <code>!</code>: <code>fs.readFile!</code>, <code>fs.writeFile!</code>, <code>curl!</code>.</li>
  <li><code>print!</code> y <code>eprint!</code> son la salida del script.</li>
  <li><code>json.parse</code> es puro; JSON inválido es E501.</li>
  <li><code>placitum explain &lt;archivo&gt;</code> muestra el manifiesto sin ejecutar.</li>
</ul>

<h2>Comandos de la extensión</h2>
<ul>
  <li><strong>Placitum: Run file</strong> — guarda y ejecuta el archivo activo.</li>
  <li><strong>Placitum: Show capability manifest</strong> — abre el manifiesto del archivo.</li>
  <li><strong>Placitum: Reanalyze file</strong> — fuerza el análisis (el botón de análisis existente).</li>
  <li><strong>Placitum: Add missing needs</strong> — aplica el quick fix del servidor.</li>
  <li><strong>Placitum: Show analysis status</strong> — abre el resumen de errores/advertencias.</li>
  <li><strong>Placitum: Language reference</strong> — esta referencia.</li>
</ul>

<div class="note">
  <strong>Modelo de proyecto:</strong> cada archivo <code>.placitum</code> es una unidad de ejecución y un límite de capabilities. No hay <code>import</code> ni archivo principal; el proyecto se organiza como un workspace de VS Code y el archivo activo es el punto de entrada. Esta exclusión fue autorizada por el docente y se justifica en la documentación del proyecto.
</div>
</body>
</html>`;
}

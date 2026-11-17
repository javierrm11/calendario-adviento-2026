// Construye el programa que ejecuta el navegador (o el verificador local). Seguro para el cliente:
// no contiene resultados esperados ni contenido de tickets, solo une piezas que ya tiene el navegador.

export interface ProgramInput {
  /** Código del usuario (en TypeScript, ya sin tipos). */
  code: string;
  /** Expresión que llama a la función del usuario (de content/NP-XXX/<lenguaje>/call). */
  call: string;
  /** Token de la API del Polo Norte. */
  token: string;
}

/** Caso tal y como lo recibe el navegador: nombre visible y URL de la API para ese caso. */
export interface PlanCase {
  name: string;
  url: string;
}

/** Lo que devuelve el código del usuario para un caso: un valor o un error. */
export interface CaseOutput {
  name: string;
  value?: unknown;
  error?: string;
}

/**
 * Cuerpo de una función asíncrona con un parámetro `__np_cases`. Para cada caso apunta NP_API_URL a su URL,
 * llama a la función del usuario y guarda el valor devuelto o el error. Devuelve la lista de resultados.
 */
export function buildJsProgram({ code, call, token }: ProgramInput): string {
  return `let NP_API_URL = "";
const NP_TOKEN = ${JSON.stringify(token)};
${code}
;return await (async () => {
  const __np_results = [];
  for (const caso of __np_cases) {
    NP_API_URL = caso.url;
    try {
      const value = await (${call.trim()});
      __np_results.push({ name: caso.name, value: value === undefined ? null : JSON.parse(JSON.stringify(value)) });
    } catch (error) {
      __np_results.push({ name: caso.name, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return __np_results;
})();
`;
}

/** Programa de Python que define `__np_run(casos_json)` y devuelve los resultados como JSON. */
export function buildPythonProgram({ code, call, token }: ProgramInput): string {
  return `NP_API_URL = ""
NP_TOKEN = ${JSON.stringify(token)}

${code}


def __np_run(casos_json):
    import json as __np_json
    global NP_API_URL
    resultados = []
    for caso in __np_json.loads(casos_json):
        NP_API_URL = caso["url"]
        try:
            valor = ${call.trim()}
            resultados.append({"name": caso["name"], "value": valor})
        except Exception as error:
            resultados.append({"name": caso["name"], "error": f"{type(error).__name__}: {error}"})
    return __np_json.dumps(resultados, default=str, ensure_ascii=False)
`;
}

/**
 * En el navegador no hay sockets: sustituye urllib.request.urlopen por una petición XMLHttpRequest síncrona
 * (permitida dentro de un Web Worker). Así el código de Python es el mismo que funcionaría en un servidor.
 */
export const PYODIDE_URLLIB_SHIM = `
import email.message
import io
import urllib.error
import urllib.request
from js import XMLHttpRequest


class _NpResponse(io.BytesIO):
    def __init__(self, status, text, headers, url):
        super().__init__(text.encode("utf-8"))
        self.status = status
        self.headers = headers
        self.url = url

    def getcode(self):
        return self.status

    def getheader(self, name, default=None):
        return self.headers.get(name, default)


def _np_urlopen(request, data=None, timeout=None):
    if isinstance(request, str):
        request = urllib.request.Request(request, data=data)
    xhr = XMLHttpRequest.new()
    xhr.open(request.get_method(), request.full_url, False)
    for name, value in request.header_items():
        xhr.setRequestHeader(name, value)
    body = request.data
    xhr.send(body.decode("utf-8") if isinstance(body, bytes) else body)
    if xhr.status == 0:
        raise urllib.error.URLError("No se pudo conectar con la API del Polo Norte")
    headers = email.message.Message()
    for line in (xhr.getAllResponseHeaders() or "").strip().splitlines():
        name, _, value = line.partition(":")
        headers[name.strip()] = value.strip()
    response = _NpResponse(xhr.status, xhr.responseText, headers, request.full_url)
    if xhr.status >= 400:
        raise urllib.error.HTTPError(request.full_url, xhr.status, xhr.statusText, headers, response)
    return response


urllib.request.urlopen = _np_urlopen
`;

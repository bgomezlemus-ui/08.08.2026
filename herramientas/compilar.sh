#!/usr/bin/env bash
# Compila el documento de tesis en dos pasadas para que el índice lleve los
# números de página reales.
#
#   1. Construye el .docx con el índice en blanco. El número de renglones ya es
#      el definitivo, de modo que la paginación no cambiará en la segunda pasada.
#   2. Convierte a PDF y mide en qué página cae cada encabezado.
#   3. Reconstruye el .docx con los números medidos.
#   4. Vuelve a convertir y verifica que no queden títulos huérfanos al pie.
#
# Uso:  bash herramientas/compilar.sh
#
# Requiere: node con el paquete docx, libreoffice-writer y poppler-utils.
#   apt-get install -y --no-install-recommends libreoffice-writer poppler-utils
#   npm install docx

set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCX="$RAIZ/docs/Gómez,B-2026.08.08-Tesis.docx"
TRABAJO="$(mktemp -d)"
PERFIL="$TRABAJO/perfil"
trap 'rm -rf "$TRABAJO"' EXIT

render() {
  cp "$DOCX" "$TRABAJO/t.docx"
  soffice -env:UserInstallation="file://$PERFIL" --headless --norestore \
          --convert-to pdf --outdir "$TRABAJO" "$TRABAJO/t.docx" >/dev/null 2>&1
}

echo "Pasada 1: construir con el índice en blanco"
rm -f "$RAIZ/docs/.indice.json"
node "$RAIZ/herramientas/construir_tesis.js" >/dev/null
render

echo "Pasada 2: medir las páginas de cada encabezado"
python3 - "$TRABAJO/t.pdf" "$RAIZ/docs/.indice.json" <<'PY'
import json, re, subprocess, sys
pdf, salida = sys.argv[1], sys.argv[2]
paginas = {}
n = int(re.search(r"Pages:\s+(\d+)",
        subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout).group(1))
for i in range(1, n + 1):
    txt = subprocess.run(["pdftotext", "-f", str(i), "-l", str(i), pdf, "-"],
                         capture_output=True, text=True).stdout
    lineas = [l.strip() for l in txt.split("\n") if l.strip()]
    if not lineas:
        continue
    # El pie lleva el número impreso de la página; es el que va al índice.
    impresa = lineas[-1] if re.fullmatch(r"[ivxlcdm\d]+", lineas[-1]) else str(i)
    # Los preliminares se saltan: la propia página del índice enumera todos los
    # títulos y, al recorrerse primero, les asignaría su propio número romano.
    if re.fullmatch(r"[ivxlcdm]+", impresa):
        continue
    for l in lineas:
        m = re.match(r"^(\d+(?:\.\d+)+)\.\s", l)
        if m and m.group(1) + "." not in paginas:
            paginas[m.group(1) + "."] = impresa
        if l.startswith("Capítulo ") and re.fullmatch(r"Capítulo \d+", l):
            clave = "cap" + l.split()[1]
            paginas.setdefault(clave, impresa)
json.dump(paginas, open(salida, "w"), ensure_ascii=False, indent=1)
print(f"  {len(paginas)} encabezados localizados en {n} páginas")
PY

echo "Pasada 3: reconstruir con los números reales"
node "$RAIZ/herramientas/construir_tesis.js" >/dev/null
render

echo "Verificación"
python3 - "$TRABAJO/t.pdf" <<'PY'
import re, subprocess, sys
pdf = sys.argv[1]
n = int(re.search(r"Pages:\s+(\d+)",
        subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout).group(1))
huerfanos, vacias = [], []
for i in range(1, n + 1):
    txt = subprocess.run(["pdftotext", "-f", str(i), "-l", str(i), pdf, "-"],
                         capture_output=True, text=True).stdout
    ls = [l.strip() for l in txt.split("\n") if l.strip()]
    romana = bool(ls) and re.fullmatch(r"[ivxlcdm]+", ls[-1])
    if ls and re.fullmatch(r"[ivxlcdm\d]+", ls[-1]):
        ls = ls[:-1]
    if not ls:
        vacias.append(i)
        continue
    # Los preliminares llevan numeración romana; el índice cita numerales de
    # apartado en cada renglón y daría falsos positivos.
    if romana:
        continue
    corta = len(ls[-1]) < 80 and not ls[-1].endswith(".")
    if re.match(r"^\d+(\.\d+)+\.\s", ls[-1]) or \
       (len(ls) >= 2 and re.match(r"^\d+(\.\d+)+\.\s", ls[-2]) and corta):
        huerfanos.append(i)
print(f"  Páginas: {n}")
print(f"  Títulos huérfanos al pie: {len(huerfanos)} {huerfanos if huerfanos else ''}")
print(f"  Páginas en blanco: {len(vacias)} {vacias if vacias else ''}")
sys.exit(1 if huerfanos or vacias else 0)
PY

echo "Listo -> docs/$(basename "$DOCX")"

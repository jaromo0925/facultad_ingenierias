import os
import pandas as pd

# Obtiene la ruta absoluta del script en ejecución
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Ruta del archivo Excel
archivo_excel = os.path.join(base_dir, "Datos2.xlsx")

# Ruta de la carpeta de salida para los JSON
directorio_salida = os.path.join(base_dir, "public", "data")

# Verifica que el archivo Excel existe
if not os.path.exists(archivo_excel):
    print(f"❌ Error: No se encontró el archivo {archivo_excel}")
    exit(1)

# Crea el directorio de salida si no existe
os.makedirs(directorio_salida, exist_ok=True)

# Lee todas las hojas del archivo Excel en un diccionario de DataFrames
hojas = pd.read_excel(archivo_excel, sheet_name=None)

# Itera sobre cada hoja y guarda su contenido en un archivo JSON diferente
for nombre_hoja, df in hojas.items():
    # Convierte el DataFrame a JSON con caracteres UTF-8
    json_resultado = df.to_json(orient="records", indent=4, force_ascii=False)
    
    # Define el nombre del archivo JSON basado en el nombre de la hoja
    archivo_json = os.path.join(directorio_salida, f"{nombre_hoja}.json")
    
    # Guarda el JSON en un archivo
    with open(archivo_json, "w", encoding="utf-8") as archivo:
        archivo.write(json_resultado)
    
    print(f"✅ Archivo JSON guardado en: {archivo_json}")

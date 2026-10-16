# Inspección de frutas con Random Forest

> Clasifica la calidad de un jitomate en tres grados a partir de su color, sus manchas y su forma.

| | |
|---|---|
| **Tipo** | Software · Visión · Aprendizaje automático |
| **Mi rol** | Extracción de características y modelo |
| **Estado** | Prototipo entrenado con datos sintéticos |
| **Año** | 2025 |
| **Stack** | Python, OpenCV, scikit-learn, paho-mqtt |
| **Repositorio** | [flkochu/inspeccion-frutas-random-forest](https://github.com/flkochu/inspeccion-frutas-random-forest) |

## Qué hace

1. Segmenta la fruta en la foto (descarta el fondo por saturación y brillo).
2. Mide 8 características: color promedio RGB, tono (con media circular), saturación, variación de brillo, proporción de manchas oscuras y circularidad 4πA/P².
3. Un Random Forest de 200 árboles (criterio de Gini, clases balanceadas) decide entre **exportación grado A**, **madurez media grado B** o **rechazo por defecto o plaga**; la confianza es la fracción de votos.
4. Publica el dictamen en JSON por MQTT.

## Datos

Lo entrené con un **dataset sintético** de 900 muestras para probar el flujo completo. Su exactitud (100 %) no representa el desempeño con fruta real, porque las clases sintéticas están muy separadas. El siguiente paso es entrenarlo con fotos etiquetadas.

## Verificación

10 pruebas con imágenes generadas: el tono sigue al color, las manchas suben la proporción de defecto, una forma ovalada baja la circularidad, el entrenamiento con dataset sintético y con CSV funciona, y sin broker MQTT la inspección sigue.

## Corrección al revisarlo

El rojo del jitomate cae en ambos extremos del tono de OpenCV (0 y 179), y el promedio normal daba ~84, como si fuera verde-azul. Ahora el tono se promedia de forma circular.

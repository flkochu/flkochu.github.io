# Atlas · Guiado autónomo multi-robot

> Becario en el laboratorio de Mecatrónica de la Ibero con el Prof. Huber Girón. Sistema que guía a tres robots con visión ArUco, control en lazo cerrado y realidad mixta. Atlas, la plataforma omnidireccional, ya se maneja desde un visor Quest.

| | |
|---|---|
| **Tipo** | Becario · Software · Visión · Control |
| **Asesor** | Prof. Huber Girón |
| **Mi rol** | Detección ArUco, cinemática de Atlas (junto con Sebas) y bloque de control de navegación |
| **Estado** | Funcionando · Atlas se controla desde realidad mixta (MR-ATLAS) |
| **Año** | 2026 |
| **Stack** | Python, OpenCV / ArUco, MQTT sobre WebSocket, HTML/JS, three.js |
| **Documentación completa** | https://flkochu.github.io/atlas/ (con gemelo cinemático en 3D) |

> El código vive en el repositorio privado del equipo de becarios. Aquí documento mi parte sin publicar el código.

## Los robots

| Robot | ID en broker | Tracción | Control |
|---|---|---|---|
| **Atlas** | `robot3` | Omnidireccional, 4 ruedas mecanum en configuración O | Proporcional holonómico |
| **Apolo** | `robot1` | Diferencial | Linealización por retroalimentación |
| **Odiseo** | `robot2` | Diferencial con motores a pasos NEMA | Linealización por retroalimentación; verificado de punta a punta en hardware |

## Atlas

Dos módulos de tracción iguales, unidos por una cubierta de MDF y tirantes diagonales. En cada módulo, dos motores en línea mueven una caja de cadenas y de ahí salen flechas con juntas cardán a cada rueda. Suspensión independiente con amortiguadores coil-over.

| Parámetro | Valor |
|---|---|
| Ruedas | 4 mecanum, Ø 210 mm, configuración O |
| Vía / batalla | 840 mm / 510 mm (por confirmar con medición) |
| Electrónica de potencia | 4 tarjetas IBERO, una por rueda, con su propio microcontrolador |
| Alimentación | 2 fuentes S-360-24 (24 V, 15 A cada una) |
| Seguridad | Paro de emergencia tipo hongo |
| Localización | Marcador ArUco ID 1 (DICT_6X6_50) |
| Orden de ruedas / polaridad | `FL, FR, RR, RL` / −1 en las cuatro, medidos en el robot |

### Por qué la configuración O deja ~24 % del par de giro

Una rueda mecanum solo empuja a lo largo del eje del rodillo que toca el piso. En configuración X esas líneas de fuerza pasan a (a + b)/√2 del centro; en O pasan a |b − a|/√2. Con a = 255 mm y b = 420 mm la razón es 165/675 ≈ 0.24. Atlas gira con una cuarta parte del par que tendría en X, así que su orientación se cierra con una medición externa (ArUco hoy, IMU después).

## Qué hice

### Visión
- **Detección ArUco** (`DICT_6X6_50`) compatible con las dos APIs de OpenCV, con suavizado exponencial de la pose y corrección del salto de ángulo en ±π.
- **Homografía** con DLT normalizada y detección de configuraciones degeneradas para pasar de píxeles a metros; documenté la trampa de paralaje del marcador elevado. Falta integrarla a la cadena.
- **Publicación de la pose** a 15 Hz en su propio tópico para el equipo de realidad mixta.

### Cinemática de Atlas (con Sebas)
- Cinemática inversa y directa mecanum con el orden de ruedas y la polaridad medidos en el robot.
- **Escalado uniforme** del vector de las cuatro ruedas en lugar de recortar cada rueda en la zona muerta: el recorte congelaba al robot cerca del destino.
- Análisis de la configuración O y su autoridad de giro.

### Control de navegación
- Ley proporcional holonómica: el error de posición se rota al marco del robot y la orientación se corrige con su propia ganancia.
- **`piloto_atlas.py`**: lazo cerrado cámara → visión → control → MQTT → Atlas, con `--dry` para probar sin mover el robot. Reutiliza la función de control ya validada en el simulador del navegador.

### Documentación
- Página de Atlas con un **gemelo cinemático en 3D**: misma cinemática que el robot, modos manual e "ir a punto", comparación entre configuración O y X, y entre escalado uniforme y recorte por rueda.

## Arquitectura

```mermaid
flowchart LR
  Q[Visor Quest · MR-ATLAS] -- comandos --> B[Broker MQTT del laboratorio]
  CAM[Cámara cenital] -.en pausa.-> V[vision.py → calcular()<br/>piloto_atlas.py] -.-> B
  WEB[Sandbox en navegador] -- HTTP --> S[servidor_sandbox.py] -- MQTT --> B
  B -- cmd --> A[Agente a bordo] --> T[4 tarjetas IBERO] --> M[4 motores DC]
  A -- ack · estado · online --> B
```

## Lo que aprendí

- El orden canónico de ruedas es el que se **mide** en el robot (`FRAME_LAYOUT`), no el que dice el YAML.
- `holonomico()` regresa la componente lateral positiva a la izquierda y la cinemática la espera a la derecha: hay que negar en el punto de conexión.
- OpenCV entrega las esquinas como `numpy.float32` y `json.dumps` falla en silencio; la simulación parecía congelada aunque la cámara detectaba bien.
- La pose en píxeles basta para el control; la pose en metros es un requisito aparte de la realidad mixta.

## Siguientes pasos del equipo

- Pose en metros para la realidad mixta y un solo esquema de tópicos.
- Encoders, IMU, cuatro LiDAR y una cámara a bordo.
- Mando por voz: «Atlas, ve al punto central», «Atlas, detente».

## Equipo

| Integrante | Parte |
|---|---|
| Adán López Lozano | Detección ArUco, cinemática de Atlas y control de navegación |
| Sebas | Cinemática de Apolo y de Atlas, control de formación, encoders y puentes H |
| Adrián Bazaldúa | Servidor MQTT |
| Dani Fonseca | Conexión de potencia y fuentes de 24 V |
| Mario | Realidad mixta (MR-ATLAS en Quest) |
| Prof. Huber Girón | Dirige el proyecto; su repositorio [Robot-uniciclo-Ibero-2](https://github.com/HuberGiron/Robot-uniciclo-Ibero-2) es la referencia |

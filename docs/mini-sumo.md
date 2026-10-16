# Mini Sumo Autónomo Pro · RobotChallenge 2026

> Robot de mini sumo autónomo para la categoría Pro de RobotChallenge CGC World Cup México 2026 (13 y 14 de septiembre, CDMX).

| | |
|---|---|
| **Tipo** | Competencia · Hardware · CAD |
| **Equipo** | 4 estudiantes |
| **Mi rol** | Diseño mecánico y CAD |
| **Estado** | Compitió en septiembre de 2026 |
| **Herramientas** | Fusion 360, impresión 3D, colado de silicón |

## Decisiones de diseño que tomé

| Decisión | Por qué |
|---|---|
| Base de placa de acero A36/1018 | Hace de estructura y de lastre a la vez: baja el centro de masa y aprovecha el límite de peso |
| Teensy 4.1 como controlador | Velocidad de cómputo para leer los sensores y decidir rápido |
| Sensores ToF VL53L5CX | Detección del oponente con matriz de distancias |
| Driver de motores TB6612FNG | El que quedó en el robot armado (el DRV8874 se quedó solo en el diseño original) |
| Llantas de silicón coladas sobre rines impresos con insertos metálicos | Agarre en el dohyo con rines ligeros y resistentes |

## Problemas que resolví

- **Errores de referencias en cascada en Fusion 360**: el ensamble se rompía al editar piezas; lo resolví exportando a STEP y reconstruyendo las referencias.

<!-- TODO: resultado en la competencia y fotos del robot -->

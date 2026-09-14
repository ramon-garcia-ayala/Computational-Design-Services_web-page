# Monterra Prefabricados: análisis de diagnóstico

Elaborado por R²XTECH. Visitas a planta y a oficina técnica del 15 al 19 de septiembre de 2026.

## La empresa

- Fabricante de elementos prefabricados de concreto en Querétaro: paneles de fachada, vigas, trabes y losas alveolares para naves industriales y centros logísticos.
- Planta con unas 220 personas; oficina técnica de 14 personas.
- Herramientas: AutoCAD para planos de taller, Excel para despieces de acero, ERP Intelisis para compras y producción.
- Trabajan a partir de los planos DWG del arquitecto o del cliente.

## Con quién hablamos

- Ing. Ricardo Salinas, director general
- Ing. Laura Méndez, jefa de oficina técnica (22 años en la empresa)
- Gerente de planta, supervisor de colado y dos proyectistas

## Hallazgos

### H1. Cada proyecto se dibuja desde cero

No existe una biblioteca de piezas. Un proyecto típico tiene entre 30 y 45 tipos de panel, y cada tipo se dibuja en AutoCAD a partir del DWG del arquitecto, aunque muchas piezas se repiten de un proyecto a otro con cambios de medida.

### H2. El despiece de acero se captura dos veces

El proyectista cuenta varillas y placas en los planos y las escribe en Excel. Después, alguien de compras vuelve a capturar ese despiece en Intelisis. No hay vínculo entre el plano y el despiece.

### H3. Los errores aparecen en planta, no en la oficina

El gerente de planta nos contó que "a veces" se cuelan paneles con placas de anclaje en la posición equivocada o con acero que no coincide con el plano. Se detectan en el colado o en el montaje. No llevan un registro de estos casos, así que no sabemos con qué frecuencia ocurre.

### H4. El criterio técnico está en una sola persona

Los criterios para detallar conexiones y embebidos los define la Ing. Méndez, y los proyectistas le consultan casi todo. Ella misma dijo que es el cuello de botella en temporada alta.

## Lo que dijeron

- "Dibujamos lo mismo cada mes, con otras medidas." (proyectista)
- "Si Laura se va de vacaciones, la oficina se detiene." (Ing. Ricardo Salinas)

## Restricciones

- Los planos que se entregan al arquitecto deben seguir saliendo en AutoCAD.
- Intelisis solo acepta importación por archivo CSV; el proveedor no ofrece API.
- La planta no usa BIM y no está en sus planes cambiarlo este año.
- No tenemos datos de costo, de horas ni de frecuencia de errores.

## La idea de programa

Nombre de trabajo: Biblioteca de piezas paramétricas.

1. Convertir los tipos de panel que más se repiten en piezas paramétricas: se ajustan las medidas y el plano de taller se genera.
2. Generar el despiece de acero desde la misma pieza, sin recaptura.
3. Exportar el despiece al formato CSV que acepta Intelisis.
4. Plasmar los criterios de la Ing. Méndez como reglas revisables dentro de la biblioteca.

Piloto propuesto: un solo tipo de proyecto (paneles de fachada para naves industriales).

## Preguntas abiertas

- ¿Existe algún registro de errores de fabricación que podamos revisar?
- ¿Qué proyecto del próximo trimestre serviría como piloto?
- ¿Quién de la oficina técnica acompañaría la construcción de la biblioteca?

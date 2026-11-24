# Belenes para impresión 3D

Medidas en mm. Todas las piezas están en `stl/`, ya orientadas para imprimir.
Las vistas de montaje están en `preview/` (PNG y GLB en color).

## Qué imprimir para cada belén

| Pieza (color) | 1 Casa | 2 Establo | 3 Pueblo |
|---|---|---|---|
| maria_cuerpo (crema), maria_cabeza (madera) | 1 | 1 | 1 |
| jose_cuerpo (oscuro), jose_cabeza (madera), jose_baston (crema) | 1 | 1 | 1 |
| pesebre_cuenco (madera), nino_cuerpo (crema), nino_cabeza (madera) | 1 | 1 | 1 |
| arbol_grande / mediano / pequeno (crema) | grande, mediano | grande, pequeño | los tres |
| casa_grande_cuerpo (crema) + tejado (oscuro) | 1 | – | – |
| casa_pequena_cuerpo (crema) + tejado (oscuro) | – | 1 | 1 |
| establo + estrella_establo (crema) | – | 1 | – |
| iglesia_cuerpo (crema) + tejado_torre + tejado_nave (oscuro) | – | – | 1 |
| valla (oscuro) | – | – | 1 |
| estrella_con_palo (crema o amarillo translúcido) | 1 | – | 1 |
| base_con_agujero_estrella | 1 | – | 1 |
| base_lisa | – | 1 | – |

## Ajustes recomendados (FDM, PLA, boquilla 0,4)

- Capa 0,2 mm, 3 perímetros, relleno 10–15 %.
- Sin soportes en casi todo. Con soportes: `jose_cuerpo` (solo bajo el brazo) y los
  cuerpos de casas/iglesia si los puentes de ventanas te salen mal (normalmente no hace falta).
- Árboles y casas son huecos y abiertos por abajo (pared 2 mm) para meter una vela LED
  o una tira de luces. Una vela LED estándar (Ø38) cabe en el árbol grande, el mediano y las casas.
- La base mide 210 × 125 mm: necesita cama de 220 mm o más.
- Bastón, estrellas y valla se imprimen tumbados; son finos, despégalos con cuidado.

## Montaje

- Cabezas: se pegan en el hueco de la capucha (parte plana hacia dentro).
- Bastón: se mete desde arriba por el agujero de la mano de José.
- Tejados: van apoyados sobre el cuerpo; una gota de pegamento si quieres fijarlos.
- Estrella con palo: encaja en el agujero rectangular de la base.
- Estrella del establo: encaja en la ranura de la cumbrera.
- Valla y figuras: sueltas o pegadas a la base, a tu gusto.

Los encajes llevan 0,25 mm de holgura. Si quedan duros u holgados, cambia `HOLG`
en `generar_belen.py` y vuelve a generar (`pip install manifold3d trimesh numpy`).

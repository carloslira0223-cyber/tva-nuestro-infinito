# TVA — La anomalía de nuestro infinito

Regalo de mesesario para el **20 de octubre de 2026**. Proyecto independiente del sitio Minecraft: HTML, CSS y JavaScript, sin instalaciones, compilación, base de datos ni contraseñas.

## Abrir la página

Abre `index.html` con Chrome, Edge, Firefox o Safari. Funciona directamente como archivo local. El progreso de las gemas se guarda en ese navegador cuando permite almacenamiento local; si no lo permite, la experiencia funciona durante la visita.

La experiencia tiene nueve escenas: terminal, identificación, anomalía, recuerdos, seis gemas, revelación, carta, misión física y poscréditos. El índice está en el botón superior derecho. La revelación y las escenas posteriores se abren después de explorar las seis gemas. La misión física es una continuación opcional, sin fecha límite ni bloqueo de medianoche.

## Estructura

```text
proyecto-infinito/
  index.html
  css/styles.css
  js/config.js
  js/script.js
  js/vendor/lucide.min.js
  js/vendor/LUCIDE-LICENSE.txt
  assets/images/carina.webp
  assets/images/ring.webp
  assets/images/insignia.svg
  assets/images/gauntlet.svg
  assets/images/temporal-signal.svg
  assets/images/tva-logo.jpg
  assets/audio/README.md
  CREDITS.md
  README.md
  .nojekyll
```

## Poner sus fotografías

1. Añade las fotos a `assets/images/`. Se sugieren estos nombres:

   `pareja_principal.jpg`, `recuerdo_01.jpg`, `recuerdo_02.jpg`, `recuerdo_03.jpg`, `recuerdo_04.jpg`, `recuerdo_05.jpg`, `recuerdo_06.jpg`.

2. Abre **`js/config.js`**. En `photos`, cambia cada `null` por la ruta entre comillas:

```js
photos: {
  main: "assets/images/pareja_principal.jpg",
  recuerdo_01: "assets/images/recuerdo_01.jpg",
  recuerdo_02: "assets/images/recuerdo_02.jpg",
  recuerdo_03: "assets/images/recuerdo_03.jpg",
  recuerdo_04: "assets/images/recuerdo_04.jpg",
  recuerdo_05: "assets/images/recuerdo_05.jpg",
  recuerdo_06: "assets/images/recuerdo_06.jpg"
},
```

JPG, PNG y WebP funcionan. Es mejor usar archivos de aproximadamente 1200–1600 píxeles y menos de 500 KB. Los nombres distinguen mayúsculas/minúsculas en GitHub. Las fotografías usan `object-fit: contain`, por lo que se muestran completas aunque sobre espacio alrededor. Si no hay foto o la ruta está mal, aparece “ARCHIVO PENDIENTE”; no se inventan fotos de otras parejas.

La foto principal se reutiliza en la anomalía, la revelación y la carta. Cada gema también admite `photo: "assets/images/otra-foto.jpg"` y un `photoAlt` opcional, dentro del mismo archivo de configuración.

## Personalizar el regalo

Todo el contenido personal está en `js/config.js`:

- `name`, `nicknames`, `specialDate` y `dateCode`: nombre, apodos y fecha.
- `mainQuote` y `anomalyNarrative`: frase central e introducción romántica.
- `memories`: título, dedicatoria, fecha opcional y texto alternativo de cada recuerdo. Puedes dejar 4, 5 o 6 entradas. Las fechas están vacías salvo el mesesario indicado.
- `gems`: nombres, colores, significados y dedicatorias.
- `letter`: saludo, párrafos, firma y cierre de la carta. Mantén cada párrafo entre comillas, separado del siguiente por una coma.
- `missionSteps` y `postcredits`: continuación física y despedida.
- `audio`: música opcional y volumen.

La carta incluida es un borrador romántico editable. No afirma una duración de la relación ni anécdotas específicas. En la carta y las dedicatorias de las gemas puedes escribir `{name}`, `{wife}` y `{playful}` para insertar automáticamente el nombre y los apodos de la configuración. También puedes escribirlos directamente.

## Sonido

El sonido siempre comienza **apagado**. El botón superior activa efectos electrónicos originales y suaves. No se incluyen canciones de Marvel ni otras pistas protegidas.

Para añadir una pista tuya o con autorización, colócala en `assets/audio/` y cambia:

```js
audio: { src: "assets/audio/nuestra-musica.mp3", volume: 0.24, effects: true }
```

Con `src: null` la experiencia no necesita ningún audio. Con `effects: false` desactivas los tonos. La música se pausa cuando la página pasa a segundo plano. La reproducción necesita una pulsación explícita en el botón de sonido.

## Publicar gratis en GitHub Pages

El repositorio de este proyecto debe ser independiente del de Minecraft.

1. Crea un repositorio público y sube **el contenido** de `proyecto-infinito`, de modo que `index.html` quede en la raíz.
2. En GitHub, abre **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona la rama `main` y la carpeta `/ (root)` y guarda.
5. Espera a que GitHub muestre la URL publicada. El enlace tendrá la forma `https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`.

Para actualizar fotos o textos, sube los cambios a la misma rama. No necesitas instalar dependencias. En Netlify puedes publicar esta carpeta mediante arrastrar y soltar; en Vercel usa el preset **Other**, sin comando de build y con directorio de salida `.`.

## Revisar desde el teléfono

La forma más sencilla es abrir el enlace HTTPS de GitHub Pages desde el teléfono y enviártelo por WhatsApp antes de compartirlo. Recuerda que `localhost` en el teléfono apunta al teléfono, no a tu computadora.

Comprueba el inicio, abre un recuerdo, visita las seis gemas, lee la carta y abre las instrucciones. Prueba cerrar y volver a abrir el índice y los expedientes. Para repetir el desbloqueo desde cero, usa una ventana privada o borra los datos de **este sitio** en el navegador; no hay que borrar todo el historial.

La aplicación respeta “Reducir movimiento”, permite navegar con Tab y cerrar expedientes con Escape, y admite volver/avanzar con el navegador. Las imágenes y los iconos están incluidos localmente.

## Recursos y créditos

Consulta `CREDITS.md` para fuentes y atribuciones. La cabecera usa el logo TVA que aportaste. El monitor está recreado con CSS a partir de tu referencia; las gemas, el favicon, las líneas temporales y el guantelete son ilustraciones originales. No se incluyen capturas de la serie ni bandas sonoras de Marvel. La frase de poscréditos es parte de la ficción del regalo, sin afiliación oficial.

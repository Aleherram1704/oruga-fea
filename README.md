# El Oráculo de Mamá

Una pequeña experiencia mágica, cálida y juguetona para abrir desde una tarjeta NFC. Es una página estática: no envía datos, no pide cuentas y no necesita servidor.

## Ejecutarla localmente

No requiere instalación ni compilación. Puedes abrir `index.html` directamente en el navegador. Para probarla de una forma más parecida a GitHub Pages, desde esta carpeta usa uno de estos comandos si ya los tienes disponibles:

```powershell
py -m http.server 8000
# o
npx serve .
```

Después abre `http://localhost:8000`.

## Editar o agregar mensajes

Todo el contenido está en [`data.js`](data.js). Las tres listas son `luck`, `surprise` y `challenge`; agrega un nuevo objeto con este formato dentro de `messages`:

```js
{ text: "Tu nuevo mensaje aquí." }
```

En Sorpresa se puede añadir también `type: "joke"`, `"fact"`, `"prize"`, `"question"` o `"compliment"` para documentar su tipo. El juego de estrellas usa `game: "star-pick"`.

La lógica crea una bolsa aleatoria por categoría y la guarda localmente. Así se recorren todos los mensajes antes de volver a empezar, incluso tras cerrar el navegador cuando el almacenamiento local está disponible. Los mensajes especiales aparecen de forma poco frecuente.

## Publicar gratis en GitHub Pages

1. Crea un repositorio público llamado `oruga-fea` en GitHub, sin añadir archivos iniciales.
2. Desde esta carpeta, inicializa y sube el proyecto:

   ```powershell
   git init
   git add .
   git commit -m "Publicar El Oráculo de Mamá"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/oruga-fea.git
   git push -u origin main
   ```

3. En el repositorio abre **Settings** → **Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Elige la rama **main**, la carpeta **/(root)** y pulsa **Save**.
6. Espera a que GitHub termine el despliegue. La dirección será:

   ```text
   https://TU_USUARIO.github.io/oruga-fea/
   ```

7. Abre esa URL en un teléfono antes de grabarla para confirmar que carga correctamente. El archivo `.nojekyll` ya evita el procesamiento Jekyll y todas las rutas son relativas.

## Grabar la tarjeta NTAG215 con NFC Tools

1. Instala **NFC Tools** en el teléfono.
2. Entra a **Write** → **Add a record** → **URL / URI**.
3. Pega la URL pública real de GitHub Pages, por ejemplo `https://TU_USUARIO.github.io/oruga-fea/`.
4. Pulsa **Write** y acerca la tarjeta NTAG215 cuando la app lo pida.
5. Escanea la tarjeta con el teléfono y revisa que abra el navegador y el oráculo.

La tarjeta solo almacena la URL HTTPS. No hace falta dar permisos NFC al sitio ni instalar ninguna app adicional para quien la reciba.

## Archivos principales

- `index.html`: estructura accesible y pantallas de bienvenida, menú y revelación.
- `styles.css`: diseño mobile-first, ilustración CSS, efectos y modo de movimiento reducido.
- `data.js`: mensajes, sorpresas, retos y secretos fáciles de editar.
- `app.js`: navegación, selección sin repeticiones inmediatas, animaciones y easter eggs.

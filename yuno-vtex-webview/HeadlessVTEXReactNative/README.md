# HeadlessVTEXReactNative — PoC Wallets (Google Pay / Apple Pay) vía WebView

App de ejemplo en **React Native (Expo SDK 56)** que abre un **WebView** apuntando a la
página de `sdk-web-demo` desplegada en staging, donde se monta el **SDK Headless de VTEX**
para procesar un pago con wallet. Tiene **dos botones** (Google Pay y Apple Pay), cada uno
con su propio payload. Cuando el pago termina, la página web envía el resultado a esta app
y la app cierra el WebView y muestra el resultado.

```
[Botón "Pagar con VTEX"] → la app construye la URL con el payload como query param
        → WebView(https://demo.staging.y.uno/vtex-webview?payload=<JSON urlencoded>)
        → SDK Headless de VTEX monta botón Google Pay → procesa pago
        → window.ReactNativeWebView.postMessage(resultado)
        → onMessage() → cierra WebView + Alert con el resultado
```

- Pantalla y lógica: [`App.tsx`](./App.tsx)
- URL base + builder (`buildWebViewUrl`): [`config.ts`](./config.ts)
- Payload del SDK (editable): [`payload.ts`](./payload.ts)

> La app envía el payload por el query param `?payload=`. Para cambiar el caso de prueba,
> edita `payload.ts` (no necesitas tocar el repo de la página web). El idioma se controla
> con `LANGUAGE` en `config.ts`. La URL resultante pesa ~7 KB.

---

## 1. Prerrequisitos

| Requisito | Notas |
|---|---|
| **Node 18+** | Ya instalado (probado con v24). |
| **Android Studio** | Con el **SDK de Android** y un **AVD (emulador)** creado. |
| **Imagen del emulador con Google Play** | ⚠️ Importante para Google Pay: al crear el AVD elige una system image que diga **"Google Play"** (no solo "Google APIs"). Google Pay necesita Play Services. |
| **Cuenta de Google + tarjeta de prueba** | En el emulador, inicia sesión con una cuenta Google y agrega una tarjeta de prueba en la app de Google Wallet/Pay. |
| **`ANDROID_HOME` / `adb` en el PATH** | Android Studio lo instala; puede requerir exportar variables (ver Errores comunes). |

> No necesitas Xcode ni Mac para esta PoC: el alcance es **Google Pay / Android**.

---

## 2. Paso previo: la página debe estar en staging

El WebView apunta a `https://demo.staging.y.uno/vtex-webview` (definido en `config.ts`).
Esa ruta vive en el repo **`sdk-web-demo`** y **debe estar desplegada en staging** antes de
probar. (El despliegue lo hace el equipo/tú por el pipeline de `sdk-web-demo`.)

Para confirmar que está arriba, abre en un navegador:
`https://demo.staging.y.uno/vtex-webview` → debe mostrar el botón de **Google Pay**.

---

## 3. Correr la app en el emulador

Desde esta carpeta (`HeadlessVTEXReactNative/`):

```bash
npm install        # ya ejecutado al crear el proyecto; correr de nuevo si hace falta
npx expo start     # abre el dev server (Metro) con un menú interactivo
# luego presiona la tecla  a   para abrir en Android
```

Hay dos formas de que la app corra en Android:

### Opción A — Expo Go (más simple, recomendada para empezar)
1. Inicia el emulador desde Android Studio (Device Manager ▶).
2. `npx expo start` y presiona **`a`**.
3. La primera vez instalará/abrirá la app **Expo Go** en el emulador y cargará tu app.
   `react-native-webview` viene incluido en Expo Go, así que no se requiere build nativo.

### Opción B — Build nativo de desarrollo
Si Expo Go diera problemas con el WebView:
```bash
npx expo run:android   # compila e instala una app nativa en el emulador
```
Requiere el SDK de Android bien configurado (Android Studio).

---

## 4. Probar el flujo

La app tiene **dos botones**: **"Pagar con Google Pay"** y **"Pagar con Apple Pay"**. Cada uno
abre el WebView con su propio payload (`paymentType` `GOOGLE_PAY` / `APPLE_PAY`).

1. En la app, presiona **"Pagar con Google Pay"** (o Apple Pay).
2. Se abre el WebView y carga la página de staging; el SDK monta el botón del wallet.
3. Presiona el botón del wallet y completa el flujo (con la tarjeta de prueba del emulador).
4. Al finalizar, la app **cierra el WebView** y muestra un **Alert** + un cuadro con el resultado
   (`success` y los `payments`), o el error si algo falla.

> ⚠️ **Apple Pay no procesa en Android.** El botón existe para ejercitar el payload `APPLE_PAY`
> de extremo a extremo, pero Apple Pay requiere iOS (WKWebView + puente nativo PassKit), fuera del
> alcance de esta PoC en Android. En Android es esperable que el SDK no ofrezca Apple Pay.

---

## 5. Errores comunes y solución

| Síntoma | Causa / Solución |
|---|---|
| `adb: command not found` / no abre en Android | `ANDROID_HOME` no está en el PATH. Añade a `~/.zshrc`: `export ANDROID_HOME=$HOME/Library/Android/sdk` y `export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator`. |
| El emulador no aparece al presionar `a` | Asegúrate de iniciarlo primero en Android Studio (Device Manager). |
| WebView en blanco | La ruta no está desplegada en staging, o no hay red. Verifica `https://demo.staging.y.uno/vtex-webview` en un navegador. |
| Sale el botón Google Pay pero al tocarlo no pasa nada o dice "no disponible" | Limitación conocida de Google Pay dentro de WebView, y/o el emulador no tiene **Google Play Services** / cuenta / tarjeta. Usa una imagen **Google Play** y prueba en **dispositivo físico** si persiste. |
| `Expo Go` dice que la versión del SDK no coincide | Instala la versión de Expo Go correspondiente a **SDK 56** (o usa la Opción B `expo run:android`). |
| Metro: "Unable to load script" | Recarga con la tecla `r` en la terminal de Expo, o reinicia `npx expo start -c` (limpia caché). |
| No recibe el resultado del pago | El puente Web→App usa `window.ReactNativeWebView.postMessage`. Verifica que el WebView tenga `onMessage` (ya configurado en `App.tsx`) y revisa la consola del SDK. |

---

## 6. Notas / limitaciones

- **Apple Pay no está cubierto** en esta PoC (no es viable dentro de un WKWebView sin puente
  nativo PassKit). Alcance: Google Pay / Android.
- La página `/vtex-webview` acepta la configuración por **query params** (`?payload=<JSON urlencoded>`),
  así puedes cambiar los datos sin redesplegar. Si no envías `payload`, usa el payload por defecto de
  `sdk-web-demo/src/app/vtex-webview/payload.config.ts`. Ver `config.ts` para construir la URL.
- Los tokens del payload (`sessions`, `checkoutSessions`, `paymentIds`, `publicApiKeys`) son de
  **staging** y **expiran**. Si el SDK reporta sesión inválida, regenera el payload.
- Google Pay normalmente requiere **dispositivo/emulador con Google Play Services**; el emulador
  estándar sin Play Store no podrá completar el pago.

# EA-CORE-GPI-PI

## Descripción
Este modulo contiene la aplicación de consola para los usuarios del sistema, su función es obtener comentarios de redes sociales, filtrar y analizarlos para luego enviarlos al servidor.

## Instalación
Para ejecutar el programa es necesario tener instalado y actualizado [`NodeJS`](https://nodejs.org/) y [`NPM`](https://www.npmjs.com/) a sus ultimas versiones en el equipo.
Luego se debe ejecutar el siguiente comando para instalar las librerías necesarias.

```
npm install
```

Para compilar el programa se necesita instalar [pkg](https://www.npmjs.com/package/pkg) de forma global

```
npm install -g pkg
```

Para la ejecución del programa se debe realizar el siguiente paso según el sistema operativo donde se ejecutará el programa.

### Windows 
```
npm run build-windows
```

### Linux 
```
npm run build-linux
```

### MacOS 
```
npm run build-macos
```

una vez compilado el programa se genera el archivo ejecutable dentro de la carpeta del proyecto.

## Documentación de usuario
La documentación sobre el uso del software así como la configuración necesaria para autenticar los servicios y el uso de correo institucional para validar las subidas al servidor estan en el siguiente [link](https://drive.google.com/drive/folders/18O3AtQscOQQIA-hfEOIOVjL6ZVswGVTA) en el archivo Extracción de Datos el cual está en formato PDF.

En cuanto a la configuración se debe ingresar el correo institucional del usuario, su numero de telefono, el tamaño máximo de muestra (por defecto 1000), el token de autenticación de Twitter y el api-key de Youtube para hacer uso de todas las funcionalidades del programa.
En el caso de Twitter y Youtube el programa ya cuenta con la autenticación necesaria, en el caso de que el token o api-key esté saturada o haya sido cancelada se debe ingresar nuevas credenciales.

## Funcionamiento
El programa se puede ejecutar de dos maneras, tanto de forma manual como automática, en el caso de la forma manual se deben ingresar manualmente los datos de cada extractor para fuente de comentarios tanto links como hashtags para el caso de twitter.
En el caso de la modalidad automática se debe incluir un archivo `.gpi` con el nombre del usuario el cual contiene un batch de todas las extracciones a realizar, si se provee este archivo en la misma carpeta del ejecutable se pueden realizar todas las extracciones incluidas en dicho archivo sin tener que requerir intervensión del usuario.

## Envío de resultados
El programa esta configurado para exportar los datos extraídos y analizados al servidor contenidos en una base de datos local (SQLite) llamada `LocalStore.db`, en sistemas Linux y MacOS una vez se realiza la subida de datos al servidor la base de datos se borra automáticamente. En el caso de ejecutar el programa en Windows este archivo se debe borrar manualmente luego de terminar la subida de datos, de otra forma se enviarán registros ya ingresados al servidor.

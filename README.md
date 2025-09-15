Frontend de ImageDetect

📝 Descripción
El frontend de ImageDetect es una aplicación web interactiva diseñada para ser una herramienta simple y directa. Su propósito es ofrecer una interfaz de usuario intuitiva para interactuar con la ImageDetect API, ocultando la complejidad del Deep Learning. La experiencia se centra en un flujo claro: el usuario sube una imagen y obtiene un veredicto confiable sobre su autenticidad.

La aplicación está construida con React, TypeScript y Tailwind CSS v4 para garantizar un rendimiento moderno, un código robusto y un diseño estilizado.

🎨 Filosofía de Diseño y Experiencia de Usuario
El diseño de la aplicación es moderno, minimalista y profesional. El objetivo es transmitir la seriedad y precisión de la tecnología subyacente, generando confianza en el usuario desde el primer momento. La interfaz es limpia y se enfoca en guiar al usuario a través de un proceso sin fricciones.

✨ Características Principales
Carga de Imágenes Interactiva: Un componente central permite al usuario arrastrar y soltar (drag-and-drop) o seleccionar un archivo de imagen.

Veredicto Claro y Visual: Los resultados se muestran de manera inequívoca, con animaciones suaves y un diseño que facilita la comprensión inmediata.

Flujo Guiado: La interfaz se adapta en cada paso (carga, procesamiento, resultado) para informar al usuario sobre el estado del análisis.

Diseño Responsivo: Experiencia de usuario consistente en dispositivos de escritorio y móviles.

Página Informativa: Una sección "Sobre el Proyecto" que explica la misión y la tecnología para generar confianza y transparencia.

💻 Tecnologías Utilizadas
Framework: React + TypeScript

Estilos: Tailwind CSS v4

Gestor de Paquetes: npm / yarn

Comunicación con API: Axios / Fetch API

Bundler: Vite / Create React App

📂 Estructura del Proyecto
La estructura del proyecto está organizada de la siguiente manera para separar responsabilidades:

src/
 ├── components/         # Componentes reutilizables de React
 ├── guidelines/         # Guías de estilo o componentes de UI Storybook
 ├── styles/             # Archivos de estilos globales (CSS, SCSS)
 ├── supabase/           # Configuración y servicios de Supabase (si aplica)
 ├── utils/              # Funciones de utilidad y helpers
 ├── App.tsx             # Componente raíz de la aplicación
 ├── Attributions.md     # Archivo de atribuciones y créditos
 ├── index.css           # Estilos CSS principales
 └── main.tsx            # Punto de entrada de la aplicación React
index.html               # Plantilla HTML principal
package.json             # Dependencias y scripts del proyecto
README.md                # Documentación principal del proyecto
vite.config.ts           # Archivo de configuración de Vite

⚙️ Instalación y Configuración
Clonar el repositorio:

Bash

git clone [URL-de-tu-repositorio-frontend]
cd [nombre-del-repositorio]
Instalar dependencias:

Bash

npm install
Configurar variables de entorno:
Crea un archivo .env en la raíz del proyecto y añade la URL del backend.

REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api

▶️ Ejecución
Iniciar el servidor de desarrollo:

Bash

npm run dev
Abrir en el navegador:
La aplicación estará disponible en http://localhost:3000.

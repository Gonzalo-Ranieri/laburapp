
# LaburAPP – README Técnico Privado

⚠️ **Este proyecto es confidencial. Su acceso está restringido exclusivamente a los programadores reclutados por Gonzalo Lucas Ranieri. Está prohibido compartir, divulgar o reutilizar este código fuera del desarrollo interno.**

---

## 🧠 Descripción General

LaburAPP es una plataforma que conecta a clientes con profesionales de servicios a domicilio. Inspirada en la experiencia de usuario de apps como UberEats o PedidosYa, pero orientada al mercado informal en LATAM, permite contratar plomeros, gasistas, electricistas, constructores, y más, de forma segura, rápida y eficiente.

---

## 🎯 Objetivo

Desarrollar un MVP funcional, sólido y seguro, que permita testear el flujo de contratación, reputación y pagos. El proyecto busca sentar una base firme antes del lanzamiento, anticipándose a posibles competidores.

---

## 🔧 Funcionalidades Principales

### 1. Registro de Usuarios
- Tipos de cuenta:
  - Cliente
  - Prestador de servicios
- Validación por email

### 2. Gestión de Perfiles
- Profesionales eligen una categoría (o pueden sugerir una nueva)
- Configuración de disponibilidad, precios y descripción

### 3. Búsqueda y Filtros
- Por categoría, precio, reputación, distancia y disponibilidad

### 4. Contratación de Servicios
- El cliente solicita un servicio viendo reputación, tarifa y ETA
- Flujo similar a apps de delivery

### 5. Pagos
- Integración con MercadoPago
- Pago por adelantado con retención hasta confirmación
- Opción de pagar en efectivo (con cargo extra al prestador)

### 6. Geolocalización y Seguridad
- Seguimiento en tiempo real
- Botón de pánico (llamada automática al 911)
- Identificación verificable de todas las partes

### 7. Reputación
- Calificaciones (1.0 a 5.0)
- Comentarios públicos
- Sistema de revisión post-servicio

---

## ⚙️ Tecnologías Propuestas

- **Frontend:** React Native + Expo *(por confirmar)*
- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL (con Sequelize ORM)
- **Autenticación:** JWT + verificación por correo
- **Pagos:** MercadoPago SDK
- **Geolocalización:** Google Maps API o Mapbox
- **Panel Admin:** Panel web para gestión interna

---

## 🛠 Estructura del Proyecto (Propuesta)

```
/backend
  /controllers
  /models
  /routes
  /middlewares
  /config

/frontend
  /components
  /screens
  /services
  /assets

/docs
README.md
.env.example
```

---

## 📈 Roadmap Técnico

### MVP Inicial
- Registro/Login
- Creación de perfiles
- Contratación de servicios
- Geolocalización
- Sistema de calificaciones

### Fase 2
- Botón de pánico
- Validación de matrículas para oficios sensibles
- Soporte para pagos en efectivo
- Panel de administración

### Fase 3
- Sistema de referidos
- Recompensas y fidelización
- Notificaciones push

---

## 🧪 Testing y Usuarios

Para testeo del MVP, se generarán:
- **1 usuario prestador:** Electricista con matrícula verificada
- **1 usuario cliente:** Requiere servicio urgente en zona cercana

---

## 👤 Autor y Contacto

**Gonzalo Lucas Ranieri**  
Fundador único de LaburAPP  
Estudiante avanzado de Ingeniería en Sistemas de Información – UTN  
Buenos Aires, Argentina  
📧 gonzalolucasranieri@gmail.com  
📱 +54 9 11 4402-2527  
📸 Instagram: [@gonzaaranieri](https://instagram.com/gonzaaranieri)

---

> “Contratá a personas más inteligentes que vos.” – Filosofía de liderazgo adoptada en LaburAPP, inspirada en Elon Musk y Mark Zuckerberg.

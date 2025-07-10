import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de privacidad | LaburApp",
  description: "Política de privacidad de LaburApp.",
}

export default function PrivacyPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Política de privacidad</h1>
      <p className="text-muted-foreground mb-6">Última actualización: 1 de junio de 2023</p>

      <div className="prose prose-emerald max-w-none">
        <h2>1. Introducción</h2>
        <p>
          En LaburApp ("nosotros", "nuestro" o "la Compañía"), valoramos su privacidad y nos comprometemos a proteger
          sus datos personales. Esta Política de Privacidad describe cómo recopilamos, usamos y compartimos su
          información cuando utiliza nuestra plataforma, sitio web y servicios (colectivamente, los "Servicios").
        </p>
        <p>
          Al utilizar nuestros Servicios, usted acepta las prácticas descritas en esta Política de Privacidad. Si no
          está de acuerdo con esta Política, por favor no utilice nuestros Servicios.
        </p>

        <h2>2. Información que recopilamos</h2>
        <p>Recopilamos varios tipos de información para proporcionar y mejorar nuestros Servicios:</p>
        <h3>2.1. Información que usted nos proporciona</h3>
        <ul>
          <li>
            Información de registro: nombre, dirección de correo electrónico, número de teléfono, dirección postal.
          </li>
          <li>
            Información de perfil: fotografía, descripción profesional, habilidades, experiencia (para Proveedores).
          </li>
          <li>Información de pago: datos de tarjetas de crédito/débito, información de cuenta bancaria.</li>
          <li>
            Comunicaciones: mensajes, reseñas, calificaciones y otra información que comparte con nosotros o con otros
            usuarios.
          </li>
        </ul>

        <h3>2.2. Información recopilada automáticamente</h3>
        <ul>
          <li>Datos de uso: cómo interactúa con nuestros Servicios, páginas visitadas, tiempo de permanencia.</li>
          <li>Información del dispositivo: tipo de dispositivo, sistema operativo, identificadores únicos.</li>
          <li>Datos de ubicación: ubicación geográfica precisa (con su consentimiento) o aproximada.</li>
          <li>
            Cookies y tecnologías similares: utilizamos cookies y otras tecnologías para recopilar información sobre su
            actividad en línea.
          </li>
        </ul>

        <h2>3. Cómo utilizamos su información</h2>
        <p>Utilizamos la información recopilada para:</p>
        <ul>
          <li>Proporcionar, mantener y mejorar nuestros Servicios.</li>
          <li>Procesar transacciones y enviar notificaciones relacionadas.</li>
          <li>Conectar a Clientes con Proveedores de servicios adecuados.</li>
          <li>Verificar la identidad de los usuarios y prevenir fraudes.</li>
          <li>Personalizar su experiencia y mostrar contenido relevante.</li>
          <li>Comunicarnos con usted sobre actualizaciones, promociones y noticias.</li>
          <li>Analizar tendencias y mejorar la funcionalidad de la plataforma.</li>
          <li>Cumplir con obligaciones legales y resolver disputas.</li>
        </ul>

        <h2>4. Compartir información</h2>
        <p>Podemos compartir su información en las siguientes circunstancias:</p>
        <ul>
          <li>
            Entre usuarios: compartimos información entre Clientes y Proveedores para facilitar la prestación de
            servicios.
          </li>
          <li>
            Proveedores de servicios: compartimos información con terceros que nos ayudan a operar nuestros Servicios
            (procesamiento de pagos, análisis de datos, servicio al cliente).
          </li>
          <li>
            Cumplimiento legal: podemos divulgar información cuando sea necesario para cumplir con la ley o proteger
            nuestros derechos.
          </li>
          <li>
            Transacciones comerciales: en caso de fusión, adquisición o venta de activos, su información puede ser
            transferida como parte de esa transacción.
          </li>
          <li>
            Con su consentimiento: podemos compartir información con terceros cuando usted nos dé su consentimiento para
            hacerlo.
          </li>
        </ul>

        <h2>5. Sus derechos y opciones</h2>
        <p>Dependiendo de su ubicación, puede tener ciertos derechos con respecto a sus datos personales:</p>
        <ul>
          <li>Acceso y portabilidad: solicitar una copia de su información personal.</li>
          <li>Corrección: solicitar la corrección de información inexacta.</li>
          <li>Eliminación: solicitar la eliminación de su información personal.</li>
          <li>Restricción y objeción: limitar el procesamiento de su información u oponerse a ciertos usos.</li>
          <li>Configuración de comunicaciones: optar por no recibir comunicaciones promocionales.</li>
          <li>Configuración de cookies: gestionar sus preferencias de cookies a través de su navegador.</li>
        </ul>
        <p>Para ejercer estos derechos, contáctenos a través de privacidad@laburapp.com.</p>

        <h2>6. Seguridad de datos</h2>
        <p>
          Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra
          acceso no autorizado, pérdida o alteración. Sin embargo, ningún sistema es completamente seguro, y no podemos
          garantizar la seguridad absoluta de su información.
        </p>

        <h2>7. Retención de datos</h2>
        <p>
          Conservamos su información personal mientras sea necesario para proporcionar nuestros Servicios, cumplir con
          obligaciones legales, resolver disputas y hacer cumplir nuestros acuerdos. Cuando ya no necesitemos su
          información personal, la eliminaremos o anonimizaremos.
        </p>

        <h2>8. Transferencias internacionales</h2>
        <p>
          Podemos transferir su información a países distintos del suyo. Cuando lo hagamos, nos aseguraremos de que
          existan protecciones adecuadas para salvaguardar su información de acuerdo con esta Política de Privacidad y
          las leyes aplicables.
        </p>

        <h2>9. Privacidad de menores</h2>
        <p>
          Nuestros Servicios no están dirigidos a personas menores de 18 años. No recopilamos intencionalmente
          información personal de menores. Si descubrimos que hemos recopilado información personal de un menor,
          tomaremos medidas para eliminarla.
        </p>

        <h2>10. Cambios a esta política</h2>
        <p>
          Podemos actualizar esta Política de Privacidad periódicamente. La versión actualizada se indicará con una
          fecha de "Última actualización" revisada. Le recomendamos revisar esta Política regularmente. Su uso
          continuado de nuestros Servicios después de la publicación de cambios constituye su aceptación de dichos
          cambios.
        </p>

        <h2>11. Contacto</h2>
        <p>
          Si tiene preguntas o inquietudes sobre esta Política de Privacidad o nuestras prácticas de privacidad,
          contáctenos en:
        </p>
        <p>
          LaburApp S.A.
          <br />
          Av. Corrientes 1234, CABA, Argentina
          <br />
          privacidad@laburapp.com
          <br />
          +54 11 1234-5678
        </p>
      </div>
    </div>
  )
}

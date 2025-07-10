import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Términos y condiciones | LaburApp",
  description: "Términos y condiciones de uso de LaburApp.",
}

export default function TermsPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Términos y condiciones</h1>
      <p className="text-muted-foreground mb-6">Última actualización: 1 de junio de 2023</p>

      <div className="prose prose-emerald max-w-none">
        <h2>1. Introducción</h2>
        <p>
          Estos Términos y Condiciones ("Términos") rigen el uso de la plataforma LaburApp (la "Plataforma"), operada
          por LaburApp S.A. ("nosotros", "nuestro" o "LaburApp"). Al acceder o utilizar la Plataforma, usted acepta
          estar sujeto a estos Términos. Si no está de acuerdo con estos Términos, no debe acceder ni utilizar la
          Plataforma.
        </p>

        <h2>2. Definiciones</h2>
        <p>
          <strong>"Usuario"</strong>: cualquier persona que acceda o utilice la Plataforma.
        </p>
        <p>
          <strong>"Cliente"</strong>: Usuario que solicita servicios a través de la Plataforma.
        </p>
        <p>
          <strong>"Proveedor"</strong>: Usuario que ofrece servicios profesionales a través de la Plataforma.
        </p>
        <p>
          <strong>"Servicios"</strong>: trabajos o tareas profesionales ofrecidos por los Proveedores a través de la
          Plataforma.
        </p>

        <h2>3. Registro y cuentas</h2>
        <p>3.1. Para utilizar ciertas funciones de la Plataforma, debe registrarse y crear una cuenta.</p>
        <p>
          3.2. Al registrarse, usted acepta proporcionar información precisa, actual y completa, y mantener dicha
          información actualizada.
        </p>
        <p>
          3.3. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que
          ocurran bajo su cuenta.
        </p>
        <p>
          3.4. Nos reservamos el derecho de suspender o terminar su cuenta si determinamos, a nuestra discreción, que ha
          violado estos Términos.
        </p>

        <h2>4. Uso de la Plataforma</h2>
        <p>4.1. La Plataforma sirve como un mercado que conecta a Clientes con Proveedores de servicios.</p>
        <p>
          4.2. LaburApp no es proveedor de los Servicios ofrecidos en la Plataforma y no es parte en ningún contrato
          entre Clientes y Proveedores.
        </p>
        <p>
          4.3. Los Usuarios acuerdan utilizar la Plataforma de manera responsable y de acuerdo con todas las leyes y
          regulaciones aplicables.
        </p>

        <h2>5. Servicios y pagos</h2>
        <p>
          5.1. Los Proveedores son responsables de establecer sus propias tarifas y términos para los Servicios
          ofrecidos.
        </p>
        <p>
          5.2. Los pagos por los Servicios se procesan a través de la Plataforma utilizando los métodos de pago
          disponibles.
        </p>
        <p>5.3. LaburApp cobra una comisión por cada transacción completada a través de la Plataforma.</p>
        <p>
          5.4. Los reembolsos están sujetos a la política de reembolsos de LaburApp y a los términos establecidos por
          los Proveedores.
        </p>

        <h2>6. Responsabilidades de los Proveedores</h2>
        <p>6.1. Los Proveedores son responsables de la calidad y ejecución de los Servicios ofrecidos.</p>
        <p>
          6.2. Los Proveedores deben cumplir con todas las leyes, regulaciones y requisitos profesionales aplicables.
        </p>
        <p>6.3. Los Proveedores deben mantener información precisa y actualizada en sus perfiles.</p>

        <h2>7. Responsabilidades de los Clientes</h2>
        <p>7.1. Los Clientes son responsables de proporcionar información precisa sobre los Servicios solicitados.</p>
        <p>7.2. Los Clientes deben pagar por los Servicios completados de acuerdo con los términos acordados.</p>
        <p>7.3. Los Clientes deben tratar a los Proveedores con respeto y profesionalismo.</p>

        <h2>8. Propiedad intelectual</h2>
        <p>
          8.1. Todos los derechos de propiedad intelectual relacionados con la Plataforma son propiedad de LaburApp o
          sus licenciantes.
        </p>
        <p>
          8.2. Los Usuarios no pueden copiar, modificar, distribuir, vender o arrendar ninguna parte de la Plataforma
          sin nuestro consentimiento previo por escrito.
        </p>

        <h2>9. Privacidad</h2>
        <p>
          9.1. Nuestra Política de Privacidad describe cómo recopilamos, usamos y compartimos su información personal.
        </p>
        <p>
          9.2. Al utilizar la Plataforma, usted acepta nuestras prácticas de privacidad como se describe en nuestra
          Política de Privacidad.
        </p>

        <h2>10. Limitación de responsabilidad</h2>
        <p>
          10.1. LaburApp no garantiza la calidad, seguridad o legalidad de los Servicios ofrecidos por los Proveedores.
        </p>
        <p>
          10.2. LaburApp no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos.
        </p>
        <p>
          10.3. Nuestra responsabilidad total hacia usted por cualquier reclamo relacionado con estos Términos o la
          Plataforma no excederá el monto que usted nos haya pagado durante los seis meses anteriores.
        </p>

        <h2>11. Modificaciones</h2>
        <p>11.1. Nos reservamos el derecho de modificar estos Términos en cualquier momento.</p>
        <p>11.2. Las modificaciones entrarán en vigor inmediatamente después de su publicación en la Plataforma.</p>
        <p>
          11.3. Su uso continuado de la Plataforma después de la publicación de las modificaciones constituye su
          aceptación de los Términos modificados.
        </p>

        <h2>12. Ley aplicable</h2>
        <p>
          Estos Términos se regirán e interpretarán de acuerdo con las leyes de la República Argentina, sin tener en
          cuenta sus disposiciones sobre conflictos de leyes.
        </p>

        <h2>13. Contacto</h2>
        <p>Si tiene alguna pregunta sobre estos Términos, contáctenos en legal@laburapp.com.</p>
      </div>
    </div>
  )
}

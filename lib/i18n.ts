export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_COOKIE = "locale";

export function isLocale(value: string | undefined): value is Locale {
  return value === "es" || value === "en";
}

function defineMessages<T>(messages: { es: T; en: T }) {
  return messages;
}

export const messages = defineMessages({
  es: {
    meta: {
      title: "Facundo Krens · CSA Challenge · Complif",
      description:
        "Challenge de Customer Success Analyst de Complif: SQL, APIs, pedido a TECH y procesos.",
    },
    nav: {
      challenge: "El desafío",
      sql: "SQL",
      apis: "APIs",
      tech: "TECH",
      processes: "Procesos",
      contact: "Contacto",
      language: "Idioma",
      print: "Imprimir",
    },
    hero: {
      kicker: "Customer Success Analyst · Complif",
      title: "¡Hola, soy Facu!",
      body: "Desde Complif me invitaron a resolver este desafío para mostrar mis habilidades, desde los datos hasta la comunicación.",
      closer: "¡Te cuento cómo lo hice!",
    },
    challenge: {
      kicker: "El desafío",
      title: "Primero el objetivo. Después, cómo resolverlo.",
      body: "Arranco por qué tiene que funcionar en el uso cotidiano, para quién, y qué no se puede inventar. Miro el caso real, no el recorte del ejercicio: si los datos entran todo el tiempo, un índice alcanza y materializar sobra; si hay un contrato, lo leo entero —incluso los huecos—; si hay un flujo, busco dónde se traba y quién queda esperando. SQL, APIs, el pedido a TECH y los procesos salen de esa misma lógica.",
      items: [
        {
          k: "01",
          t: "SQL",
          d: "Serie MEP implícito al vuelo: índice, WHERE y LIMIT; sin materializar.",
          href: "#sql",
        },
        {
          k: "02",
          t: "APIs",
          d: "Flujos sobre el Swagger de Petstore, y para qué serviría en Complif.",
          href: "#apis",
        },
        {
          k: "03",
          t: "Pedido TECH",
          d: "Ticket para persistir el cierre diario del dólar MEP de Ámbito.",
          href: "#tech",
        },
        {
          k: "04",
          t: "Procesos",
          d: "Camunda del cliente: el flujo de compliance, pregunta por pregunta.",
          href: "#procesos-1",
        },
        {
          k: "05",
          t: "Procesos",
          d: "Apertura de Persona Jurídica, con carriles por equipo.",
          href: "#procesos-2",
        },
      ],
    },
    pending: {
      label: "Razonamiento",
      flow: "Flujo",
      body: "Lo completo yo.",
    },
    sql: {
      kicker: "Ejercicio 1 · SQL",
      title: "Tipo de cambio MEP implícito, tick a tick.",
      intro:
        "El fiddle trae ticks estáticos de 2022. El caso real es cotidiano: entran cotizaciones MEP todo el tiempo. Por eso no materializo la serie: cada insert invalidaría el cache. El gráfico lee la vista mep_implicito, con índice y un SELECT paginado.",
      blocks: [
        {
          k: "El caso no es el fiddle",
          body: "La base del ejercicio es un recorte de 2022. En el uso diario llegan ticks de forma continua. Diseñar sobre un snapshot estático lleva a cachear de más: una vista materializada sirve para un conjunto que casi no cambia.",
        },
        {
          k: "Índice, no materializar",
          body: "En precios, índice por (datetime, moneda, id), ordenado por instante. Fecha y moneda son las claves de acceso; id desempata porque el par no es único. El motor busca el rango sin barrer la tabla ni pagar un REFRESH en cada carga.",
        },
        {
          k: "Consulta",
          body: "Pido datetime, venta y compra, filtro el rango en el WHERE y corto con LIMIT para paginar. Se puede en la query porque es SQL nativo, no un modelo de entidades tipo Hibernate.",
        },
      ],
      queryLabel: "Consulta",
      index: "Índice (datetime, moneda)",
      changes: "cambios",
      lastSell: "Última venta",
      lastBuy: "Última compra",
      spread: "Spread",
      sellRange: "Rango venta",
      errorTitle: "No se pudo leer la base de datos",
      errorMissingCredentials:
        "Falta configurar la conexión. Revisá las variables de entorno y recargá la página.",
      errorUnavailable:
        "No pudimos cargar la serie de cotizaciones. Comprobá que la vista mep_implicito esté creada y visible para la API.",
      emptyTitle: "La vista no tiene filas",
      emptyDescription:
        "Comprobá que el seed de precios esté cargado. La serie se calcula al vuelo; no hay que refrescar una materializada.",
    },
    chart: {
      title: "Tipo de cambio MEP implícito",
      sell: "Venta",
      buy: "Compra",
    },
    apis: {
      kicker: "Ejercicio 2 · APIs",
      title: "Leer el contrato, armar el flujo, detectar el hueco.",
      intro:
        "Un Swagger no es el producto: es el contrato. El ejercicio pide dos flujos sobre Petstore y para qué usaría APIs en Complif. En cada paso miro el código de respuesta: si el contrato no lo declara, el flujo se corta igual.",
      source: "Abrir Petstore Swagger",
      legendOk: "Continúa",
      legendError: "Corta el flujo",
      items: [
        {
          k: "01",
          t: "Alta y compra de Buho",
          q: "Si quisiera darme de alta como usuario, y luego comprar un perro llamado Buho. ¿Cuál sería el flujo de ejecución de endpoints?",
          a: "",
        },
        {
          k: "02",
          t: "Buho → Mono, sin usuario",
          q: "Ahora quiero que ese mismo perro se llame Mono, pero me olvidé mi usuario, ¿cómo puedo hacer?",
          a: "La API no asocia las compras a usuarios. Eso permite renombrar si olvidé el username, pero es una pérdida de información. Tampoco menciona credenciales: un riesgo. Y no filtra en el servidor: para buscar a Buho hay que traer todo el listado available y filtrar tipo y nombre en el cliente.",
        },
        {
          k: "03",
          t: "APIs en Complif",
          q: "¿Para qué pensás que podríamos usar APIs en Complif?",
          a: "Una empresa como Complif sería prácticamente imposible sin APIs: exponen servicios bajo contrato, y en un SaaS con varios clientes y proveedores eso es clave. Sin ellas, habría que completar formularios con automatización web o scrapear; no escala. Con APIs, Complif puede conectar un formulario del home banking de Banco Boquita con un servicio propio.",
        },
      ],
      buy: {
        nodes: {
          user: {
            t: "Alta de usuario",
            d: "POST /user con un id. Reviso el código de respuesta antes de seguir.",
          },
          userFail: {
            t: "Alta sin código de error",
            d: "El Swagger solo declara default. Si falla, el contrato no dice con qué 4xx parar.",
          },
          find: {
            t: "Mascotas available",
            d: "GET /pet/findByStatus?status=available. Trae el listado completo.",
          },
          findFail: {
            t: "Status inválido",
            d: "400: el query no es available, pending o sold. No hay listado ni petId.",
          },
          filter: {
            t: "¿Hay un perro Buho?",
            d: "El servidor no filtra por nombre ni tipo: lo hago yo en el cliente.",
          },
          filterMiss: {
            t: "Buho no está",
            d: "Sin match no hay petId. No puedo armar la orden.",
          },
          order: {
            t: "Comprar a Buho",
            d: "POST /store/order con el petId. El body no lleva usuario.",
          },
          orderFail: {
            t: "Orden inválida",
            d: "400: el pedido no cumple el modelo Order. La compra no se registra.",
          },
          bought: {
            t: "Compra hecha",
            d: "200 y el Order. No queda ligado al usuario que di de alta.",
          },
        },
        edges: {
          "user-ok": "default",
          "user-err": "sin 4xx",
          "find-ok": "200",
          "find-err": "400",
          "filter-yes": "sí",
          "filter-no": "no está",
          "order-ok": "200",
          "order-err": "400",
        },
      },
      rename: {
        nodes: {
          rename: {
            t: "Renombrar a Mono",
            d: "POST /pet/{petId} con name=Mono. No hace falta el username.",
          },
          renameFail: {
            t: "Input inválido",
            d: "405: el único error que documenta este endpoint. El nombre no cambia.",
          },
          renamed: {
            t: "Ahora se llama Mono",
            d: "El 200 no figura en el Swagger: el éxito tampoco está en el contrato.",
          },
        },
        edges: {
          "rename-ok": "sin 200",
          "rename-err": "405",
        },
      },
    },
    tech: {
      kicker: "Ejercicio 3 · Pedido a TECH",
      title: "Histórico de dólar MEP al cierre, para Banco Boquita.",
      intro:
        "Armé el pedido como un ticket de Customer Success: el detalle que TECH necesita para desarrollarlo, sin redescubrir el contrato en el Network.",
      source: "Histórico MEP · Ámbito",
      brief: [
        {
          k: "Problema",
          body: "Para el monitoreo transaccional de Banco Boquita hace falta el histórico de dólar MEP valuado al cierre de cada día hábil. Hoy no hay tabla ni integración con el proveedor.",
        },
        {
          k: "Objetivo",
          body: "Extraer la valuación de cierre todos los días hábiles y persistirla. Re-correr un día no debería duplicar ni pisar mal un cierre ya validado.",
        },
        {
          k: "Contexto",
          body: "Proveedor: Ámbito. No hay docs oficiales del API: el contrato se descubre en el Network de la página de histórico al filtrar desde / hasta.",
        },
      ],
      ticketLabel: "Pedido a TECH",
      ticket: {
        id: "TECH-03",
        status: "Abierto",
        fromLabel: "De",
        from: "Facundo Krens",
        fromTeam: "Customer Success",
        toLabel: "Para",
        to: "TECH",
        clientLabel: "Cliente",
        client: "Banco Boquita",
        subjectLabel: "Asunto",
        subject:
          "Persistir el cierre diario del dólar MEP (Ámbito) para Banco Boquita",
        letterBefore: [
          "Estimado equipo de Tech,",
          "Buen día. Espero que se encuentren bien.",
          "Me comunico con ustedes para levantar un pedido por parte del equipo de Customer Success, en relación con el cliente Banco Boquita.",
          "Para el monitoreo transaccional del banco se precisa de los valores del dólar MEP tomados al cierre de cada día. Como fuente se seleccionó el registro histórico del diario Ámbito. Se requiere persistir dichos valores en una tabla, con unicidad por fecha, para su posterior consulta día a día. Al ser cierres diarios, se sugiere opcionalmente una vista materializada de consulta, refrescada a partir de esa tabla una única vez por día. La tabla es la fuente de verdad.",
          "Los datos pueden ser obtenidos mediante una petición HTTPS, sin autenticación, a\n{endpoint}\nconcatenando en la URL el rango deseado, con el formato fechaInicio/fechaFin, yyyy-mm-dd. La fechaFin no incluye ese día. Por ejemplo, para obtener los cierres del 01 al 07 de julio de 2026 inclusive, el GET es\n{exampleUrl}\nLa respuesta es un vector; la primera fila es el encabezado. Las fechas vienen en dd/mm/yyyy y el valor como texto con coma decimal, del más reciente al más antiguo:",
        ].join("\n\n"),
        letterAfter: [
          "La persistencia debe ser idempotente: si se vuelve a correr el mismo rango o el mismo día, no deben duplicarse filas ni pisarse un cierre ya validado.",
          "Resulta imprescindible destacar que Ámbito puede no retornar valores para algunos días, en particular si el mercado no operó. En el ejemplo adjuntado, no se retornan valores para los días 04 y 05 de julio de 2026. Esos días no deben completarse con un valor inventado.",
          "La implementación sugerida conllevaría una carga histórica inicial, persistiendo los valores del dólar MEP desde el primer cierre que Ámbito publique (en este endpoint, el 20/03/2020) hasta el cierre más reciente respecto a la fecha de implementación. Luego, una carga diaria, si es que Ámbito publica un valor para dicha fecha. Si se adopta la vista materializada, se refresca en base a los cambios en la tabla.",
          "Se solicita aviso cuando la serie histórica y la carga diaria estén disponibles para su consulta.",
          "Desde ya muchas gracias. Me mantengo atento ante cualquier consulta que pueda surgir.",
          "Saludos cordiales,\nFacundo Krens.",
        ].join("\n\n"),
      },
    },
    processesI: {
      kicker: "Ejercicio 4 · Procesos (I)",
      title: "El flujo de compliance del cliente, paso a paso.",
      intro:
        "Cinco preguntas sobre el diagrama de Camunda. Abajo, el glosario del PDF para no perder el vocabulario.",
      source: "Diagrama en Camunda",
      glossary: [
        {
          k: "Perfil transaccional",
          d: "Límite operativo estimado. Si fondea más de lo previsto, hay riesgo de lavado. Sale de comprobantes de origen de fondos, ponderados por cliente.",
        },
        {
          k: "NSE",
          d: "Nivel socioeconómico: poder adquisitivo estimado, vía bureau.",
        },
        {
          k: "Requerimiento",
          d: "Mail al usuario para pedirle información.",
        },
        {
          k: "OCR",
          d: "Lee documentos y dispara acciones según el contenido.",
        },
      ],
      items: [
        {
          k: "01",
          q: "¿Por qué pensás que se crea un caso y luego se busca información del NSE? ¿No convendría buscarlo antes de que se genere el caso?",
          a: [
            "Pienso que se hace así porque el NSE viene de una entidad externa, lo cual muy probablemente implique costos por consulta, y además cierto tiempo pues se debe aprobar el acceso a dichos datos personales. No tiene sentido consultarlo si ya se encuentra dicha información vigente almacenada en la base de datos propia.",
            "La alerta se dispara cuando un usuario opera por encima de su perfil. Ahí se arma el caso, y el NSE es una consulta que se cuelga de ese expediente, no al revés.",
            "Crear el caso primero también permite ver si ya hay un NSE reciente de esa persona y reutilizarlo, en vez de volver a pagarlo. El caso es el lugar donde quedan asentadas la alerta, las consultas y, después de revisar, si se trata o no de lavado de dinero. Esto permite persistir un seguimiento documentado.",
          ].join("\n\n"),
        },
        {
          k: "02",
          q: "¿Creés que el proceso se pueda trabar por alguna razón?",
          a: [
            "Sí, en varios puntos. Por ejemplo en la consulta al organismo encargado del NSE (si no responde o se cae), en la carga de documentación que tiene que hacer el usuario, en la aprobación del requerimiento, y en el análisis o revisión por parte del cliente B.",
            "Particularmente, el requerimiento al usuario final es el que considero que representa un riesgo mayor de trabar el flujo, por múltiples razones (la persona no revisa su casilla de mail, no cuenta con la documentación, cree que si lo ignora no va a pasar nada, etc). Distinto es que un servicio falle (el organismo del NSE, el OCR) a que una tarea humana no se tome nunca. El proceso junta varias partes, cada una con sus tiempos y responsabilidades. Si no hay un vencimiento o un recordatorio, queda trabado.",
          ].join("\n\n"),
        },
        {
          k: "03",
          q: "En el requerimiento enviado al cliente… ¿qué documentación le estás pidiendo?",
          a: "Por lo que entiendo, el requerimiento va al usuario (el consumer), no al banco. Entiendo que se le está pidiendo una declaración jurada sobre sus bienes, y comprobantes que permitan determinar el origen de sus fondos.",
        },
        {
          k: "04",
          q: "¿Por qué hay una clasificación de OCR? ¿Qué evaluarías en un documento para determinar si se aprueba o rechaza?",
          a: [
            "La clasificación está porque el OCR no solo lee el archivo: tiene que decir de qué tipo es, y según eso se sigue un camino u otro. Si es un recibo, se puede extraer monto y fecha. Si no es un comprobante de origen de fondos, se rechaza y se vuelve a pedir.",
            "Para aprobar o rechazar miraría el tipo de documento, que el titular coincida con la persona del caso, la fecha de vigencia (un recibo de hace tres años no sirve para una operación actual), que el monto se pueda leer, que el archivo sea legible, y que lo que aporta coincida con lo pedido. También habría que revisar cuestiones de validez: firmas, entidad que lo emite, coherencia del contenido con el marco regulatorio, entre otros.",
          ].join("\n\n"),
        },
        {
          k: "05",
          q: "Si vos fueras analista de Compliance… ¿qué investigarías de un cliente que opera más de lo que tiene permitido?",
          a: [
            "Investigaría primero hace cuánto viene operando de esta manera. No es lo mismo una transacción extraordinaria que la repetición de movimientos fuera de lo permitido, que ya pediría una indagación en el origen de los fondos. También las cuentas involucradas. Trazar las operaciones permite ver si son movimientos entre familiares (por ejemplo, un estudiante que recibe dinero de sus padres para estudios, alquiler y gastos del mes), o si la situación es más compleja: apuestas ilegales, estafas, lavado de dinero, entre otros.",
            "Miraría los montos. Gran parte de la economía argentina se mueve por el empleo informal. Muchas personas cobran fuera de recibo, y eso, si bien es irregular, no es lo mismo que una organización ilícita. Igualmente, que se trate de un caso de empleo informal no implica el cierre automático del caso: desde mi punto de vista, reduce la gravedad y urgencia con la cual se conlleva el proceso.",
          ].join("\n\n"),
        },
      ],
    },
    processesII: {
      kicker: "Ejercicio 5 · Procesos (II)",
      title: "Apertura de cuenta de Persona Jurídica en Banco Boquita.",
      intro:
        "El PDF pide un flujo con condiciones de entrada y salida claras, a partir del video del Líder de Onboarding. Abajo está el modelo de Camunda: mismas formas (tareas, pasarelas, eventos) y el mismo lienzo. Arrastrá para recorrer el flujo.",
      pool: "Banco Boquita · Persona Jurídica",
      hint: "Arrastrá el lienzo · rueda o botones para zoom.",
      zoomIn: "Acercar",
      zoomOut: "Alejar",
      fit: "Ajustar al recuadro",
      loadError: "No se pudo cargar el diagrama de Camunda.",
      legend: {
        start: "Inicio",
        user: "Tarea de usuario",
        service: "Tarea de servicio",
        send: "Requerimiento o transmisión",
        gateway: "Pasarela exclusiva",
        end: "Fin",
        yes: "Sí",
        no: "No",
      },
      glossary: [
        {
          k: "Asesor comercial",
          d: "Abre el caso, arma el formulario, dispara los requerimientos y calcula la matriz de riesgo. Si el cliente no sigue, cierra con un agradecimiento.",
        },
        {
          k: "Representante cliente",
          d: "Completa el formulario, acepta los términos y entrega la documentación societaria cuando el banco se la pide.",
        },
        {
          k: "Legales",
          d: "Riesgo bajo o medio va a analistas; si no, al líder. Revisan vigencia de estatutos, balances, constitución y poderes, y calculan el perfil transaccional.",
        },
        {
          k: "Equipos de clientes",
          d: "Si el perfil supera 20.000 UVAs, entra Institucionales. Si no, PYMEs. El equipo que corresponda aprueba o rechaza.",
        },
        {
          k: "Data entry",
          d: "Revisa el expediente y carga a mano en el CORE, el registro único de clientes. Si hay un error, vuelve al equipo comercial.",
        },
        {
          k: "Entrada y salida",
          d: "Entra con el contacto del asesor. Sale por rechazo (sin intención, sin T&C o sin aprobación) o por la carga en el CORE.",
        },
      ],
      lanes: {
        advisor: "Asesor comercial",
        consumer: "Representante cliente",
        legal: "Legales",
        institutional: "Clientes institucionales",
        pyme: "Clientes PYMEs",
        "data-entry": "Data entry",
      },
      nodes: {
        start: {
          t: "Contacto comercial iniciado",
          d: "Un asesor comercial se acerca a la empresa. Ahí arranca el caso.",
        },
        intent: {
          t: "¿Hay intención comercial?",
          d: "Si no hay interés, no se abre expediente. Si hay, se empieza el alta.",
        },
        close: {
          t: "Agradecer y cerrar el caso",
          d: "Se agradece al representante y el proceso termina, sin cuenta.",
        },
        closeEnd: {
          t: "Caso cerrado",
          d: "Salida por rechazo: sin intención, sin términos o sin aprobación.",
        },
        formPartial: {
          t: "Completar formulario parcialmente",
          d: "El asesor carga lo que ya tiene. El resto lo tiene que completar el cliente.",
        },
        requireFields: {
          t: "Requerir campos restantes",
          d: "Mail al representante para que complete lo que falta del formulario.",
        },
        formComplete: {
          t: "Completar el formulario",
          d: "El representante revisa lo cargado y termina de llenar sus datos.",
        },
        termsReview: {
          t: "Revisar términos y condiciones",
          d: "El representante lee los T&C antes de seguir con la documentación.",
        },
        acceptTerms: {
          t: "¿Acepta los términos y condiciones?",
          d: "Sin aceptación no hay relación comercial. No se abre una negociación.",
        },
        requireDocs: {
          t: "Requerir documentación societaria",
          d: "Se piden estatutos, balances, constitución de la sociedad, poderes y demás.",
        },
        provideDocs: {
          t: "Entregar documentación societaria",
          d: "El representante adjunta estatutos, balances, constitución y poderes.",
        },
        riskMatrix: {
          t: "Calcular matriz de riesgo",
          d: "Con los datos del formulario se estima el riesgo de la empresa.",
        },
        riskLevel: {
          t: "¿El riesgo es bajo o medio?",
          d: "Eso decide quién en legales toma el caso: analistas o el líder.",
        },
        toAnalysts: {
          t: "Transmitir a analistas de legales",
          d: "Riesgo bajo o medio: el caso entra al equipo de analistas.",
        },
        toLegalLead: {
          t: "Transmitir al líder de legales",
          d: "Si el riesgo no es bajo ni medio, lo toma el líder del equipo.",
        },
        missingDocs: {
          t: "¿Falta documentación?",
          d: "Antes de validar, legales mira si el expediente está completo.",
        },
        requireMissing: {
          t: "Requerir documentación faltante",
          d: "Se vuelve a pedir al representante lo que no está o no alcanza.",
        },
        provideMissing: {
          t: "Entregar documentación faltante",
          d: "El representante adjunta lo que legales volvió a pedir.",
        },
        reviewDocs: {
          t: "Revisar validez y vigencia",
          d: "Se controla que cada documento sea auténtico y esté vigente.",
        },
        docsValid: {
          t: "¿Toda la documentación es válida?",
          d: "Si algo no cierra, se pide de nuevo. Si cierra, se arma el perfil.",
        },
        txProfile: {
          t: "Calcular perfil transaccional",
          d: "Se estima el límite operativo de la empresa, en UVAs.",
        },
        uvaLimit: {
          t: "¿Supera las 20.000 UVAs?",
          d: "Ese umbral separa clientes institucionales de PYMEs.",
        },
        toInstitutional: {
          t: "Transmitir a institucionales",
          d: "Perfil alto: el caso lo evalúa el equipo de institucionales.",
        },
        toPyme: {
          t: "Transmitir a clientes PYMEs",
          d: "Si no supera el umbral, lo toma el equipo de PYMEs.",
        },
        approve: {
          t: "¿Se aprueba al cliente?",
          d: "Institucionales o PYMEs dan el sí o el no. Sin aprobación, se cierra.",
        },
        welcome: {
          t: "Comunicar cuenta y productos",
          d: "Se comunica el número de cuenta y los productos otorgados.",
        },
        toDataEntry: {
          t: "Transmitir a data entry",
          d: "El expediente pasa a quien carga los datos en el sistema CORE.",
        },
        reviewInfo: {
          t: "Revisar información del cliente",
          d: "Data entry controla que lo aprobado coincida con lo documentado.",
        },
        infoCorrect: {
          t: "¿Toda la información es correcta?",
          d: "Si hay un desvío, vuelve al equipo de clientes. Si no, se carga.",
        },
        requireRevision: {
          t: "Requerir revisión al equipo",
          d: "Se pide corregir el expediente y se reingresa a data entry.",
        },
        loadCore: {
          t: "Cargar datos en el CORE",
          d: "El CORE es el registro único de clientes. La carga es a mano.",
        },
        coreEnd: {
          t: "Cuenta abierta",
          d: "El cliente quedó dado de alta en el sistema de la entidad.",
        },
      },
      edges: {
        "intent-yes": "Sí",
        "intent-no": "No",
        "accept-yes": "Sí",
        "accept-no": "No",
        "risk-yes": "Sí · analistas",
        "risk-no": "No · líder",
        "missing-yes": "Sí",
        "missing-no": "No",
        "valid-yes": "Sí",
        "valid-no": "No · vuelve a pedir",
        "uva-yes": "Sí · institucionales",
        "uva-no": "No · PYMEs",
        "approve-yes": "Sí",
        "approve-no": "No",
        "correct-yes": "Sí",
        "correct-no": "No · vuelve a revisar",
      },
      notes: {
        termsNote:
          "Asumo que los términos y condiciones no son negociables.",
      },
    },
    contact: {
      kicker: "Contacto",
      body: "¡Hablemos!",
      role: "Customer Success Analyst",
      city: "Buenos Aires, Argentina",
      cta: "Escribime",
      email: "Mail",
      phone: "Teléfono",
      linkedin: "LinkedIn",
      deck: "Mazo de tarjetas de contacto",
    },
    footer: {
      tagline: "CSA Challenge",
      sources: "Fuentes",
      sql: "db-fiddle",
      swagger: "Swagger",
      ambito: "Ámbito",
      camunda: "Camunda",
      site: "Complif",
    },
  },
  en: {
    meta: {
      title: "Facundo Krens · CSA Challenge · Complif",
      description:
        "Complif Customer Success Analyst challenge: SQL, APIs, a TECH ticket, and processes.",
    },
    nav: {
      challenge: "The challenge",
      sql: "SQL",
      apis: "APIs",
      tech: "TECH",
      processes: "Processes",
      contact: "Contact",
      language: "Language",
      print: "Print",
    },
    hero: {
      kicker: "Customer Success Analyst · Complif",
      title: "Hi, I'm Facu!",
      body: "Complif's team invited me to solve this challenge to show my skills, from data to communication.",
      closer: "I'll tell you how I did it!",
    },
    challenge: {
      kicker: "The challenge",
      title: "The objective first. Then how to solve it.",
      body: "I start with what has to work in everyday use, for whom, and what I must not invent. I look at the real case, not the exercise snapshot: if data keeps arriving, an index is enough and materializing is waste; if there is a contract, I read all of it — gaps included; if there is a flow, I look for where it stalls and who is left waiting. SQL, APIs, the TECH ticket and the processes all come from that same logic.",
      items: [
        {
          k: "01",
          t: "SQL",
          d: "Live implied MEP series: index, WHERE, and LIMIT; no materialized cache.",
          href: "#sql",
        },
        {
          k: "02",
          t: "APIs",
          d: "Petstore Swagger flows, and where APIs would matter at Complif.",
          href: "#apis",
        },
        {
          k: "03",
          t: "TECH request",
          d: "A ticket to persist Ámbito’s daily MEP close.",
          href: "#tech",
        },
        {
          k: "04",
          t: "Processes",
          d: "The client Camunda flow: compliance, question by question.",
          href: "#procesos-1",
        },
        {
          k: "05",
          t: "Processes",
          d: "Legal-entity account opening, with a lane per team.",
          href: "#procesos-2",
        },
      ],
    },
    pending: {
      label: "Reasoning",
      flow: "Flow",
      body: "I'll fill this in.",
    },
    sql: {
      kicker: "Exercise 1 · SQL",
      title: "Implied MEP FX rate, tick by tick.",
      intro:
        "The fiddle has static 2022 ticks. The real case is everyday use: MEP quotes keep arriving. So I do not materialize the series: every insert would invalidate the cache. The chart reads the mep_implicito view, with an index and a paged SELECT.",
      blocks: [
        {
          k: "The case is not the fiddle",
          body: "The exercise database is a 2022 snapshot. In daily use, ticks arrive continuously. Designing around a static dump over-caches: a materialized view fits a set that barely changes.",
        },
        {
          k: "Index, do not materialize",
          body: "On precios, an index on (datetime, moneda, id), ordered by instant. Time and currency are the access keys; id breaks ties because the pair is not unique. The engine seeks the range without scanning the table or paying a REFRESH on every load.",
        },
        {
          k: "Query",
          body: "I select datetime, venta, and compra, filter the range in the WHERE, and page with LIMIT. That belongs in the query because this is native SQL, not an entity model like Hibernate.",
        },
      ],
      queryLabel: "Query",
      index: "Index (datetime, moneda)",
      changes: "changes",
      lastSell: "Last sell",
      lastBuy: "Last buy",
      spread: "Spread",
      sellRange: "Sell range",
      errorTitle: "Could not read the database",
      errorMissingCredentials:
        "The database connection is not configured. Set the environment variables and reload.",
      errorUnavailable:
        "We could not load the quote series. Check that the mep_implicito view exists and is exposed by the API.",
      emptyTitle: "The view has no rows",
      emptyDescription:
        "Check that the precios seed is loaded. The series is computed live; there is no materialized view to refresh.",
    },
    chart: {
      title: "Implied MEP FX rate",
      sell: "Sell",
      buy: "Buy",
    },
    apis: {
      kicker: "Exercise 2 · APIs",
      title: "Read the contract, sketch the flow, spot the gap.",
      intro:
        "A Swagger is not the product: it is the contract. The exercise asks for two Petstore flows and where APIs would help at Complif. At each step I read the status code: if the contract does not declare it, the flow still stops.",
      source: "Open Petstore Swagger",
      legendOk: "Continue",
      legendError: "Stop the flow",
      items: [
        {
          k: "01",
          t: "Sign up and buy Buho",
          q: "If I wanted to sign up as a user, then buy a dog named Buho, what would the endpoint flow be?",
          a: "",
        },
        {
          k: "02",
          t: "Buho → Mono, no username",
          q: "Now I want that same dog to be named Mono, but I forgot my username. How can I do it?",
          a: "The API does not tie purchases to users. That lets me rename the pet without a username, but it drops attribution. It also never mentions credentials: a security gap. And it does not filter server-side: to find Buho I must pull every available pet and filter species and name on the client.",
        },
        {
          k: "03",
          t: "APIs at Complif",
          q: "What do you think we could use APIs for at Complif?",
          a: "A company like Complif would be nearly impossible without APIs: they expose services under a contract, which a multi-client, multi-vendor SaaS needs. Without them, we would fill forms via web automation or scrape; that does not scale. With APIs, Complif can connect a Banco Boquita home-banking form to a Complif service.",
        },
      ],
      buy: {
        nodes: {
          user: {
            t: "Create user",
            d: "POST /user with an id. I check the response code before moving on.",
          },
          userFail: {
            t: "Sign-up has no error code",
            d: "Swagger only declares default. If it fails, the contract does not say which 4xx to stop on.",
          },
          find: {
            t: "Available pets",
            d: "GET /pet/findByStatus?status=available. It returns the full list.",
          },
          findFail: {
            t: "Invalid status",
            d: "400: the query is not available, pending, or sold. No list, no petId.",
          },
          filter: {
            t: "Is there a dog named Buho?",
            d: "The server does not filter by name or species: I do that on the client.",
          },
          filterMiss: {
            t: "Buho is missing",
            d: "No match means no petId. I cannot place the order.",
          },
          order: {
            t: "Buy Buho",
            d: "POST /store/order with the petId. The body has no user.",
          },
          orderFail: {
            t: "Invalid order",
            d: "400: the payload does not match the Order model. The purchase is not stored.",
          },
          bought: {
            t: "Purchase placed",
            d: "200 and the Order. It is not linked to the user I just created.",
          },
        },
        edges: {
          "user-ok": "default",
          "user-err": "no 4xx",
          "find-ok": "200",
          "find-err": "400",
          "filter-yes": "yes",
          "filter-no": "missing",
          "order-ok": "200",
          "order-err": "400",
        },
      },
      rename: {
        nodes: {
          rename: {
            t: "Rename to Mono",
            d: "POST /pet/{petId} with name=Mono. The username is not required.",
          },
          renameFail: {
            t: "Invalid input",
            d: "405: the only error this endpoint documents. The name does not change.",
          },
          renamed: {
            t: "Now named Mono",
            d: "200 is missing from the Swagger: success is not in the contract either.",
          },
        },
        edges: {
          "rename-ok": "no 200",
          "rename-err": "405",
        },
      },
    },
    tech: {
      kicker: "Exercise 3 · TECH request",
      title: "Daily MEP close history, for Banco Boquita.",
      intro:
        "I wrote the request as a Customer Success ticket: the detail TECH needs to build it, without rediscovering the contract in the Network tab.",
      source: "MEP history · Ámbito",
      brief: [
        {
          k: "Problem",
          body: "Banco Boquita’s transactional monitoring needs the implied MEP history valued at each business-day close. There is no table and no vendor integration today.",
        },
        {
          k: "Goal",
          body: "Extract the close valuation every business day and persist it. Re-running a day must not duplicate or overwrite a validated close.",
        },
        {
          k: "Context",
          body: "Vendor: Ámbito. There are no official API docs: the contract is discovered in the Network tab of the history page when filtering from / to.",
        },
      ],
      ticketLabel: "TECH request",
      ticket: {
        id: "TECH-03",
        status: "Open",
        fromLabel: "From",
        from: "Facundo Krens",
        fromTeam: "Customer Success",
        toLabel: "To",
        to: "TECH",
        clientLabel: "Client",
        client: "Banco Boquita",
        subjectLabel: "Subject",
        subject:
          "Persist Ámbito’s daily MEP close for Banco Boquita",
        letterBefore: [
          "Dear Tech team,",
          "Good morning. I hope you are well.",
          "I am writing on behalf of the Customer Success team to raise a request for Banco Boquita.",
          "Transactional monitoring at the bank needs the MEP dollar valued at each day’s close. The source is Ámbito’s historical record. Those values should be persisted in a table, unique by date, for day-to-day lookup. Because they are daily closes, an optional query materialized view may be refreshed from that table once a day. The table is the source of truth.",
          "The data can be obtained with an unauthenticated HTTPS GET to\n{endpoint}\nappending the desired range as fechaInicio/fechaFin in yyyy-mm-dd. fechaFin does not include that day. For example, to get closes from 1 through 7 July 2026 inclusive, the GET is\n{exampleUrl}\nThe response is an array; the first row is the header. Dates come as dd/mm/yyyy and the value as text with a decimal comma, newest first:",
        ].join("\n\n"),
        letterAfter: [
          "Persistence must be idempotent: re-running the same range or the same day must not duplicate rows or overwrite a validated close.",
          "Ámbito may omit some days, in particular when the market did not trade. In the attached example there are no values for 4 and 5 July 2026. Those days must not be filled in with an invented value.",
          "The suggested rollout is an initial historical load, persisting MEP closes from the first close Ámbito publishes (on this endpoint, 20/03/2020) through the most recent close at implementation time. Then a daily load, if Ámbito publishes a value for that date. If the materialized view is adopted, it is refreshed from changes to the table.",
          "Please notify us when the historical series and the daily load are available to query.",
          "Thank you in advance. I remain available for any questions.",
          "Kind regards,\nFacundo Krens.",
        ].join("\n\n"),
      },
    },
    processesI: {
      kicker: "Exercise 4 · Processes (I)",
      title: "The client compliance flow, step by step.",
      intro:
        "Five questions on the Camunda diagram. Below, the PDF glossary so the vocabulary stays in view.",
      source: "Camunda diagram",
      glossary: [
        {
          k: "Transactional profile",
          d: "Estimated operating limit. Funding above it is a money-laundering risk. It comes from source-of-funds documents, weighted per client.",
        },
        {
          k: "NSE",
          d: "Socioeconomic level: estimated purchasing power, via a bureau.",
        },
        {
          k: "Requirement",
          d: "An email to the user asking for information.",
        },
        {
          k: "OCR",
          d: "Reads documents and triggers actions from their content.",
        },
      ],
      items: [
        {
          k: "01",
          q: "Why do you think a case is created and then NSE is fetched? Wouldn’t it be better to fetch it before the case exists?",
          a: [
            "I think it’s done this way because NSE comes from an external entity, which very likely means a cost per query, plus some time because access to that personal data has to be approved. There’s no point querying it if we already have current information stored in our own database.",
            "The alert fires when a user operates above their profile. That’s when the case is created, and NSE is a query that hangs off that file, not the other way around.",
            "Creating the case first also lets us see if there’s already a recent NSE for that person and reuse it, instead of paying again. The case is where the alert, the queries, and, after review, whether it’s money laundering or not, get recorded. That gives us a documented trail.",
          ].join("\n\n"),
        },
        {
          k: "02",
          q: "Do you think the process can get stuck for some reason?",
          a: [
            "Yes, at several points. For example in the query to the NSE agency (if it doesn’t respond or goes down), in the document upload the user has to do, in the approval of the requirement, and in the analysis or review by client B.",
            "In particular, the requirement to the end user is the one I think is most likely to stall the flow, for several reasons (they don’t check their inbox, they don’t have the documents, they think nothing will happen if they ignore it, etc.). It’s different if a service fails (the NSE agency, OCR) than if a human task is never picked up. The process brings together several parties, each with their own timelines and responsibilities. Without a deadline or a reminder, it gets stuck.",
          ].join("\n\n"),
        },
        {
          k: "03",
          q: "In the requirement sent to the client… what documentation are you asking for?",
          a: "As I understand it, the requirement goes to the user (the consumer), not the bank. I understand they’re being asked for a sworn statement of their assets, and documents that make it possible to determine the origin of their funds.",
        },
        {
          k: "04",
          q: "Why is there an OCR classification? What would you evaluate in a document to approve or reject it?",
          a: [
            "The classification is there because OCR doesn’t just read the file: it has to say what type it is, and that decides the next path. If it’s a pay stub, you can extract amount and date. If it isn’t a source-of-funds document, it’s rejected and requested again.",
            "To approve or reject I’d look at the document type, that the holder matches the person on the case, the validity date (a pay stub from three years ago doesn’t help with a current operation), that the amount is readable, that the file is legible, and that what’s in it matches what was requested. I’d also check validity: signatures, issuing entity, whether the content fits the current regulatory framework, among other things.",
          ].join("\n\n"),
        },
        {
          k: "05",
          q: "If you were a Compliance analyst… what would you investigate about a client operating above their limit?",
          a: [
            "I’d start by looking at how long they’ve been operating this way. A one-off extraordinary transaction is not the same as repeated movements above the limit, which would already call for looking into the origin of the funds. Also the accounts involved. Tracing the operations shows whether they’re transfers between family members (for example, a student getting money from their parents for studies, rent and monthly expenses), or whether the situation is more complex: illegal gambling, scams, money laundering, among others.",
            "I’d look at the amounts. A large part of the Argentine economy runs on informal employment. Many people are paid off the books, and while that’s irregular, it isn’t the same as an illicit organization. That said, informal employment doesn’t mean the case closes automatically: from my point of view, it just lowers the severity and urgency of the process.",
          ].join("\n\n"),
        },
      ],
    },
    processesII: {
      kicker: "Exercise 5 · Processes (II)",
      title: "Legal-entity account opening at Banco Boquita.",
      intro:
        "The PDF asks for a flow with clear entry and exit conditions, based on the Onboarding Lead’s video. Below is the Camunda model: the same shapes (tasks, gateways, events) and the same canvas. Drag to follow the flow.",
      pool: "Banco Boquita · Legal entity",
      hint: "Drag the canvas · scroll or use the buttons to zoom.",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      fit: "Fit to view",
      loadError: "The Camunda diagram could not be loaded.",
      legend: {
        start: "Start",
        user: "User task",
        service: "Service task",
        send: "Request or handoff",
        gateway: "Exclusive gateway",
        end: "End",
        yes: "Yes",
        no: "No",
      },
      glossary: [
        {
          k: "Commercial advisor",
          d: "Opens the case, starts the form, sends the requests, and runs the risk matrix. If the client does not continue, they close with a thank-you.",
        },
        {
          k: "Client representative",
          d: "Completes the form, accepts the terms, and uploads corporate documents when the bank asks for them.",
        },
        {
          k: "Legal",
          d: "Low or medium risk goes to analysts; otherwise to the lead. They check statutes, financials, incorporation and powers of attorney, then compute the transactional profile.",
        },
        {
          k: "Client teams",
          d: "If the profile is above 20,000 UVAs, Institutional takes it. If not, SMEs. The matching team approves or rejects.",
        },
        {
          k: "Data entry",
          d: "Reviews the file and types it into CORE, the single client record. If something is off, it goes back to the commercial team.",
        },
        {
          k: "Entry and exit",
          d: "It starts with the advisor’s outreach. It ends in a rejection (no intent, no terms, or no approval) or with the load into CORE.",
        },
      ],
      lanes: {
        advisor: "Commercial advisor",
        consumer: "Client representative",
        legal: "Legal",
        institutional: "Institutional clients",
        pyme: "SME clients",
        "data-entry": "Data entry",
      },
      nodes: {
        start: {
          t: "Commercial outreach started",
          d: "A commercial advisor approaches the company. That is where the case starts.",
        },
        intent: {
          t: "Is there commercial intent?",
          d: "If there is no interest, no file is opened. If there is, onboarding begins.",
        },
        close: {
          t: "Thank and close the case",
          d: "The client representative is thanked and the process ends, with no account.",
        },
        closeEnd: {
          t: "Case closed",
          d: "Exit by rejection: no intent, no terms, or no approval.",
        },
        formPartial: {
          t: "Complete form partially",
          d: "The advisor fills in what they already have. The client must complete the rest.",
        },
        requireFields: {
          t: "Request remaining fields",
          d: "An email to the client representative to complete what is missing on the form.",
        },
        formComplete: {
          t: "Complete the form",
          d: "The client representative checks what was loaded and finishes their data.",
        },
        termsReview: {
          t: "Review terms and conditions",
          d: "The client representative reads the T&Cs before documentation continues.",
        },
        acceptTerms: {
          t: "Do they accept the terms and conditions?",
          d: "Without acceptance there is no commercial relationship. There is no negotiation.",
        },
        requireDocs: {
          t: "Request corporate documents",
          d: "Statutes, financials, articles of incorporation, powers of attorney, and the rest.",
        },
        provideDocs: {
          t: "Submit corporate documents",
          d: "The client representative attaches statutes, financials, incorporation papers and powers of attorney.",
        },
        riskMatrix: {
          t: "Calculate risk matrix",
          d: "The form data is used to estimate the company’s risk.",
        },
        riskLevel: {
          t: "Is the risk low or medium?",
          d: "That decides who in Legal takes the case: analysts or the lead.",
        },
        toAnalysts: {
          t: "Hand off to legal analysts",
          d: "Low or medium risk: the case goes to the analyst team.",
        },
        toLegalLead: {
          t: "Hand off to the legal lead",
          d: "If the risk is neither low nor medium, the team lead takes it.",
        },
        missingDocs: {
          t: "Is any documentation missing?",
          d: "Before validating, Legal checks whether the file is complete.",
        },
        requireMissing: {
          t: "Request missing documents",
          d: "The client representative is asked again for what is missing or insufficient.",
        },
        provideMissing: {
          t: "Submit missing documents",
          d: "The client representative attaches what Legal asked for again.",
        },
        reviewDocs: {
          t: "Review validity and currency",
          d: "Each document is checked to be authentic and still in force.",
        },
        docsValid: {
          t: "Is all documentation valid?",
          d: "If something does not hold, it is requested again. If it does, the profile is built.",
        },
        txProfile: {
          t: "Calculate transactional profile",
          d: "The company’s operating limit is estimated, in UVAs.",
        },
        uvaLimit: {
          t: "Is it above 20,000 UVAs?",
          d: "That threshold splits institutional clients from SMEs.",
        },
        toInstitutional: {
          t: "Hand off to institutional",
          d: "High profile: the institutional team evaluates the case.",
        },
        toPyme: {
          t: "Hand off to SME clients",
          d: "If it does not clear the threshold, the SME team takes it.",
        },
        approve: {
          t: "Is the client approved?",
          d: "Institutional or SMEs say yes or no. Without approval, the case closes.",
        },
        welcome: {
          t: "Communicate account and products",
          d: "The account number and granted products are communicated.",
        },
        toDataEntry: {
          t: "Hand off to data entry",
          d: "The file goes to whoever loads the data into the CORE system.",
        },
        reviewInfo: {
          t: "Review client information",
          d: "Data entry checks that what was approved matches the documents.",
        },
        infoCorrect: {
          t: "Is all the information correct?",
          d: "If something is off, it goes back to the client team. If not, it is loaded.",
        },
        requireRevision: {
          t: "Request a team review",
          d: "The file is sent back for correction and re-enters data entry.",
        },
        loadCore: {
          t: "Load data into CORE",
          d: "CORE is the single client record. The load is done by hand.",
        },
        coreEnd: {
          t: "Account opened",
          d: "The client is now onboarded in the bank’s system.",
        },
      },
      edges: {
        "intent-yes": "Yes",
        "intent-no": "No",
        "accept-yes": "Yes",
        "accept-no": "No",
        "risk-yes": "Yes · analysts",
        "risk-no": "No · lead",
        "missing-yes": "Yes",
        "missing-no": "No",
        "valid-yes": "Yes",
        "valid-no": "No · request again",
        "uva-yes": "Yes · institutional",
        "uva-no": "No · SMEs",
        "approve-yes": "Yes",
        "approve-no": "No",
        "correct-yes": "Yes",
        "correct-no": "No · send back",
      },
      notes: {
        termsNote: "I assume the terms and conditions are not negotiable.",
      },
    },
    contact: {
      kicker: "Contact",
      body: "Let's talk!",
      role: "Customer Success Analyst",
      city: "Buenos Aires, Argentina",
      cta: "Email me",
      email: "Email",
      phone: "Phone",
      linkedin: "LinkedIn",
      deck: "Deck of contact cards",
    },
    footer: {
      tagline: "CSA Challenge",
      sources: "Sources",
      sql: "db-fiddle",
      swagger: "Swagger",
      ambito: "Ámbito",
      camunda: "Camunda",
      site: "Complif",
    },
  },
});

export function copy(locale: Locale) {
  return messages[locale];
}

export function numberLocale(locale: Locale) {
  return locale === "es" ? "es-AR" : "en-US";
}

import React from 'react';

const faqs = [
  {
    question: "¿Cómo puedo participar en una rifa?",
    answer: "Es muy sencillo. Solo tienes que seleccionar la rifa de tu interés, elegir tus números favoritos, completar el formulario con tus datos y realizar el pago correspondiente."
  },
  {
    question: "¿Cuáles son los métodos de pago aceptados?",
    answer: "Aceptamos transferencias bancarias y depósitos en tiendas de conveniencia. Una vez realizado el pago, deberás subir tu comprobante en la sección correspondiente para validar tus boletos."
  },
  {
    question: "¿Cuánto tiempo tengo para pagar mis boletos apartados?",
    answer: "El tiempo límite para realizar el pago es de 24 horas. Si no recibimos el comprobante en ese lapso, los números volverán a estar disponibles para otros participantes."
  },
  {
    question: "¿Cómo se eligen a los ganadores?",
    answer: "Todas nuestras rifas se basan en los resultados de la Lotería Nacional o mediante una selección electrónica transparente el día indicado en cada rifa."
  },
  {
    question: "¿Cómo recibo mi premio si resulto ganador?",
    answer: "Nos pondremos en contacto contigo de inmediato a través del número de WhatsApp o correo electrónico que proporcionaste al registrarte para coordinar la entrega de tu premio."
  },
  {
    question: "¿Es seguro participar en interRIFAS?",
    answer: "Absolutamente. Contamos con un sistema transparente de gestión de boletos y un soporte directo vía WhatsApp para resolver cualquier duda en tiempo real."
  }
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#f4f7f1] dark:bg-[#071710] pb-20">
      <div className="bg-[#052d20] text-white py-16 px-4 relative overflow-hidden border-b border-gold-500/30">
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(45deg,transparent_25%,#f8c94a_25%,#f8c94a_26%,transparent_26%,transparent_50%,#f8c94a_50%,#f8c94a_51%,transparent_51%,transparent_75%,#f8c94a_75%,#f8c94a_76%,transparent_76%)] bg-size-[32px_32px]"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Preguntas <span className="text-gold-300">Frecuentes</span>
          </h1>
          <p className="text-lg text-brand-100 max-w-2xl mx-auto font-light">
            Todo lo que necesitas saber para participar y ganar con total confianza.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-20">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-[#0b2419] rounded-2xl shadow-sm border border-gold-500/10 overflow-hidden hover:border-gold-500/30 transition-all duration-300 group"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-brand-900 dark:text-gold-100 mb-3 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                  {faq.question}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-gold-500/10 border border-gold-500/20 rounded-3xl text-center">
          <h2 className="text-xl font-bold text-brand-900 dark:text-gold-100 mb-2">¿Aún tienes dudas?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Estamos aquí para ayudarte en todo momento.</p>
          <a 
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '521'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-green-500/20"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.67-1.625-.918-2.219-.242-.58-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}

import { SectionNumber } from '@/components/SectionNumber';

export type FaqItem = { question: string; answer: string };

export function Faq({
  eyebrow,
  title,
  items,
  id,
}: {
  eyebrow: string;
  title: string;
  items: FaqItem[];
  id?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <section className="bg-surface-tint py-section" id={id}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="site-shell grid grid-cols-1 gap-[clamp(55px,9vw,130px)] min-[900px]:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div>
          <SectionNumber>{eyebrow}</SectionNumber>
          <h2 className="m-0 text-display-4 leading-[0.93] tracking-[-0.072em] [overflow-wrap:break-word] sm:[overflow-wrap:normal]">
            {title}
          </h2>
        </div>
        <div className="border-t border-border-default">
          {items.map((item) => (
            <details key={item.question} className="group border-b border-border-default">
              <summary className="flex list-none items-center justify-between py-l text-lead font-control [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="ml-ml h-0 w-0 flex-none border-x-[6px] border-t-[7px] border-x-transparent border-t-action-primary transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="-mt-1 mb-l text-body leading-[1.72] text-text-muted sm:mr-2xl">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

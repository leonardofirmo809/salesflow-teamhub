import { useEffect, useMemo } from "react";

// Exportador de código em PDF via impressão do navegador
// Reúne automaticamente arquivos do projeto usando import.meta.glob com as: 'raw'
const ExportCode = () => {
  // Coleta de arquivos (texto bruto)
  const files = useMemo(() => {
    const modules = {
      ...import.meta.glob('/src/**/*.{ts,tsx,css}', { as: 'raw', eager: true }),
      ...import.meta.glob('/index.html', { as: 'raw', eager: true }),
      ...import.meta.glob('/vite.config.ts', { as: 'raw', eager: true }),
      ...import.meta.glob('/tailwind.config.ts', { as: 'raw', eager: true }),
      ...import.meta.glob('/README.md', { as: 'raw', eager: true }),
      ...import.meta.glob('/supabase/**/*.toml', { as: 'raw', eager: true }),
      ...import.meta.glob('/public/robots.txt', { as: 'raw', eager: true }),
    } as Record<string, string>;

    const entries = Object.entries(modules)
      .map(([path, content]) => ({ path, content }))
      .sort((a, b) => a.path.localeCompare(b.path));

    // Agrupamento por categoria amigável
    const getGroup = (path: string) => {
      if (path.startsWith('/src/pages/')) return 'Páginas';
      if (path.startsWith('/src/components/ui/')) return 'UI Components';
      if (path.startsWith('/src/components/')) return 'Components';
      if (path.startsWith('/src/contexts/')) return 'Contexts';
      if (path.startsWith('/src/hooks/')) return 'Hooks';
      if (path.startsWith('/src/integrations/')) return 'Integrations';
      if (path.startsWith('/src/')) return 'Outros (src)';
      if (path.startsWith('/public/')) return 'Public';
      if (path.startsWith('/supabase/')) return 'Supabase';
      return 'Configs de Raiz';
    };

    const grouped = entries.reduce<Record<string, { path: string; content: string }[]>>((acc, file) => {
      const group = getGroup(file.path);
      acc[group] = acc[group] || [];
      acc[group].push(file);
      return acc;
    }, {});

    return grouped;
  }, []);

  // SEO básico e canônico
  useEffect(() => {
    document.title = 'Exportação de Código | PDF do Projeto';

    const metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    metaDesc.content = 'Exporte todos os códigos do projeto em PDF, organizados por pastas.';
    document.head.appendChild(metaDesc);

    const linkCanonical = document.createElement('link');
    linkCanonical.rel = 'canonical';
    linkCanonical.href = window.location.origin + '/export';
    document.head.appendChild(linkCanonical);

    return () => {
      document.head.removeChild(metaDesc);
      document.head.removeChild(linkCanonical);
    };
  }, []);

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Barra fixa de ações (oculta na impressão) */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Código do Projeto — Exportação PDF</h1>
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="inline-flex items-center px-3 py-2 rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
              Salvar como PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <section className="mb-6">
          <p className="text-sm text-muted-foreground">
            Dica: Clique em “Salvar como PDF” para gerar o PDF com quebras de página entre arquivos.
          </p>
        </section>

        {/* Estilos de impressão e quebras de página */}
        <style>{`
          @media print {
            .file-block { break-inside: avoid; page-break-inside: avoid; }
            .file-sep { break-after: page; page-break-after: always; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          }
        `}</style>

        {/* Renderização por grupos */}
        {Object.entries(files).map(([group, groupFiles]) => (
          <section key={group} className="mb-10">
            <h2 className="text-lg font-bold mb-4 border-b border-border pb-2">{group}</h2>
            {groupFiles.map((f, idx) => (
              <article key={f.path} className="file-block mb-8">
                <h3 className="font-mono text-sm text-muted-foreground mb-2">{f.path}</h3>
                <div className="rounded-md border border-border bg-card">
                  <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
{`// Caminho: ${f.path}\n${f.content}`}
                  </pre>
                </div>
                {/* Separador de página entre arquivos (evita no último) */}
                {idx < groupFiles.length - 1 && <div className="file-sep h-0" />}
              </article>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
};

export default ExportCode;

/* Component registry: freetheplatform/frontend/registry/src/components/seo/StructuredDataScript.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
interface StructuredDataScriptProps {
  structuredData?: object | object[] | null;
}

/**
 * `JSON.stringify` escapes what JSON needs — quotes, backslashes, control
 * characters — but not `<`, because that is a perfectly legal character inside
 * a JSON string. This output is not going into a JSON file though: it goes
 * inside `<script>…</script>`, and the HTML parser does not parse JSON. It
 * scans for the literal characters `</script` and ends the element there.
 *
 * Everything that reaches this component is admin- or API-authored free text —
 * a bike description, a product name, an FAQ answer. A `</script>` anywhere in
 * one of those would close the tag early and hand whatever followed to the
 * browser as markup. `\u003c` is valid JSON, parses back to `<`, and can never
 * form that sequence.
 */
function toJsonLd(structuredData: object | object[]): string {
  return JSON.stringify(structuredData).replace(/</g, '\u003c');
}

const StructuredDataScript = ({ structuredData }: StructuredDataScriptProps) => {
  if (!structuredData || (Array.isArray(structuredData) && structuredData.length === 0)) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toJsonLd(structuredData) }}
    />
  );
};

export default StructuredDataScript;

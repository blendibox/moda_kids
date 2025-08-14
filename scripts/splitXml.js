// scripts/splitXmlProd.js
import fs from 'fs';
import path from 'path';

const inputFile = process.argv[2];
const maxSize = 90 * 1024 * 1024; // 90 MB

if (!inputFile) {
  console.error('❌ Uso: node scripts/splitXmlProd.js caminho/arquivo.xml');
  process.exit(1);
}

const inputPath = path.resolve(inputFile);
const output = path.join(process.cwd(), 'data', 'awin');

if (!fs.existsSync(inputPath)) {
  console.error(`❌ Arquivo não encontrado: ${inputPath}`);
  process.exit(1);
}

console.log(`📂 Lendo: ${inputPath}`);

const xml = fs.readFileSync(inputPath, 'utf8');

// Captura tudo até antes do primeiro <prod>
const prodOpenTag = '<prod';
const firstProdIndex = xml.indexOf(prodOpenTag);
if (firstProdIndex === -1) {
  console.error('❌ Nenhuma tag <prod> encontrada.');
  process.exit(1);
}
const header = xml.substring(0, firstProdIndex);

// Captura fechamento da tag raiz
const footerMatch = xml.match(/<\/datafeed>\s*<\/cafProductFeed>\s*$/);
if (!footerMatch) {
  console.error('❌ Não foi possível encontrar o fechamento </datafeed></cafProductFeed>.');
  process.exit(1);
}
const footer = footerMatch[0];

// Extrai todos os <prod>...</prod>
const prodRegex = /<prod[\s\S]*?<\/prod>/g;
const products = xml.match(prodRegex);

if (!products || products.length === 0) {
  console.error('❌ Nenhum produto encontrado.');
  process.exit(1);
}

console.log(`📦 Encontrados ${products.length} produtos.`);

let part = 1;
let currentSize = Buffer.byteLength(header + footer);
let currentContent = header;

for (const prod of products) {
  const prodSize = Buffer.byteLength(prod);

  if (currentSize + prodSize + Buffer.byteLength(footer) > maxSize && currentContent !== header) {
    // Fecha e salva o arquivo atual
    currentContent += footer;
    const outputPath = path.join(
      output,
      `${path.basename(inputPath, '.xml')}${part}.xml`
    );
    fs.writeFileSync(outputPath, currentContent, 'utf8');
    console.log(`✅ Criado: ${outputPath} (${(Buffer.byteLength(currentContent) / 1024 / 1024).toFixed(2)} MB)`);

    // Inicia próxima parte
    part++;
    currentContent = header;
    currentSize = Buffer.byteLength(header + footer);
  }

  currentContent += prod;
  currentSize += prodSize;
}

// Salva última parte
if (currentContent !== header) {
  currentContent += footer;
  const outputPath = path.join(
    output,
    `${path.basename(inputPath, '.xml')}${part}.xml`
  );
  fs.writeFileSync(outputPath, currentContent, 'utf8');
  console.log(`✅ Criado: ${outputPath} (${(Buffer.byteLength(currentContent) / 1024 / 1024).toFixed(2)} MB)`);
}

console.log('🏁 Finalizado!');

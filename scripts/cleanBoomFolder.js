import fs from 'fs';
import path from 'path';

const folder = process.argv[2]; // pasta com os arquivos 

if (!folder) {
  console.error('❌ Uso: node scripts/cleanXmlFolder.js caminho/da/pasta');
  process.exit(1);
}

const folderPath = path.resolve(folder);
if (!fs.existsSync(folderPath)) {
  console.error(`❌ Pasta não encontrada: ${folderPath}`);
  process.exit(1);
}

const files = fs.readdirSync(folderPath);
//.filter(f => f.toLowerCase().endsWith('.xml'));

if (files.length === 0) {
  console.warn('⚠️ Nenhum arquivo  encontrado.');
  process.exit(0);
}

console.log(`📂 Limpando ${files.length} arquivos  em ${folderPath}`);

for (const file of files) {
  const filePath = path.join(folderPath, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove BOM no início, se existir
  content = content.replace(/^\uFEFF/, '');

  // Remove espaços, tabs e quebras de linha antes da primeira tag "<"
  content = content.replace(/^[^\S\r\n]*/, '').replace(/^\s*\n/, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Limpou: ${file}`);
}

console.log('🏁 Limpeza concluída!');

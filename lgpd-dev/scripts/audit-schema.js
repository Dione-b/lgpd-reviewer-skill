#!/usr/bin/env node
/*
 * audit-schema.js — scanner determinístico LGPD para schema.prisma
 *
 * Uso:  node audit-schema.js caminho/para/schema.prisma [--json]
 *
 * Para cada model/campo: detecta se o nome do campo casa com padrão de dado
 * pessoal comum ou sensível e se o campo possui anotação /// @lgpd:.
 * Reporta pendências (campo pessoal SEM anotação) e divergências
 * (campo anotado como comum mas com nome de padrão sensível).
 *
 * Não substitui análise jurídica — é um detector por heurística de nome
 * para garantir que nenhum campo pessoal passe sem classificação explícita.
 */
'use strict';
const fs = require('fs');

const SENSITIVE = [
  /\b(saude|sa[uú]de|diagnostico|cid\d*|prontuario|medicamento|alergia|deficiencia|tiposanguineo|gravidez|planosaude|exame?lab|cirurgia|saudemental)\b/i,
  /\b(biometr|digital|impressaodigital|facial|faceembedding|reconhecimentofacial|iris|voiceprint|template)\b/i,
  /\b(dna|genoma|genetic|ancestralidade)\b/i,
  /\b(raca|ra[çc]a|corpele|etnia|povoindigena|quilombola)\b/i,
  /\b(religi|credo|conviccao)\b/i,
  /\b(partido|opiniaopolitica|filiacaopartidaria|politica)\b/i,
  /\b(sindicat|filiacaosindical)\b/i,
  /\b(orientacaosexual|vidasexual|identidadegenero|sexualidade)\b/i,
];
const COMMON = [
  /\b(nome|nomecompleto|nomesocial|nomemae|firstname|lastname|fullname)\b/i,
  /\b(cpf|cnpj|rg|cnh|tituloeleitor|pis|nis|passaporte|matricula|ssn)\b/i,
  /\b(email|e-?mail|telefone|celular|whatsapp|phone)\b/i,
  /\b(endereco|address|logradouro|cep|zipcode|complemento|bairro)\b/i,
  /\b(datanascimento|nascimento|birth|idade|sexo|genero|estadocivil|nacionalidade)\b/i,
  /\b(ip|ipaddress|useragent|deviceid|cookieid|fingerprint)\b/i,
  /\b(geoloc|latitude|longitude|location|coordenada)\b/i,
  /\b(foto|avatar|selfie|imagem|picture)\b/i,
  /\b(salario|renda|scorecredito|credito|dadosbancarios|cartao|conta|agencia|iban|pix)\b/i,
  /\b(placa|chassi|renavam)\b/i,
];
// nomes técnicos que casariam por engano e quase nunca são PII isolados
const IGNORE = /^(id|uuid|[A-Za-z]+Id|[a-z]+_id|createdAt|updatedAt|deletedAt|version|status|type|tipo|ativo|enabled)$/;

function classify(field) {
  if (SENSITIVE.some(r => r.test(field))) return 'sensivel';
  if (COMMON.some(r => r.test(field))) return 'comum';
  return null;
}

function parse(src) {
  const models = [];
  const modelRe = /model\s+(\w+)\s*\{([\s\S]*?)\}/g;
  let m;
  while ((m = modelRe.exec(src))) {
    const name = m[1];
    const fields = [];
    for (let raw of m[2].split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('//') || line.startsWith('@@')) continue;
      const fm = line.match(/^(\w+)\s+([\w\[\]?.]+)(.*)$/);
      if (!fm) continue;
      const annotated = /\/\/\/\s*@lgpd:(\w+)/.exec(line);
      fields.push({
        name: fm[1],
        type: fm[2],
        annotated: annotated ? annotated[1] : null,
      });
    }
    models.push({ name, fields });
  }
  return models;
}

function main() {
  const path = process.argv[2];
  const asJson = process.argv.includes('--json');
  if (!path) { console.error('uso: node audit-schema.js schema.prisma [--json]'); process.exit(2); }
  let src;
  try { src = fs.readFileSync(path, 'utf8'); }
  catch (e) { console.error('erro ao ler ' + path + ': ' + e.message); process.exit(2); }

  const findings = [];
  for (const model of parse(src)) {
    for (const f of model.fields) {
      if (IGNORE.test(f.name)) continue;
      const cat = classify(f.name);
      if (!cat) continue;
      let severity = null, note = '';
      if (!f.annotated) {
        severity = cat === 'sensivel' ? 'PENDENTE-SENSIVEL' : 'PENDENTE';
        note = 'campo pessoal sem anotação /// @lgpd:';
      } else if (cat === 'sensivel' && f.annotated !== 'sensivel') {
        severity = 'DIVERGENCIA';
        note = `padrão sensível mas anotado como "${f.annotated}"`;
      }
      if (severity) findings.push({ model: model.name, field: f.name, categoriaDetectada: cat, anotacao: f.annotated, severity, note });
    }
  }

  if (asJson) { console.log(JSON.stringify({ total: findings.length, findings }, null, 2)); }
  else {
    if (findings.length === 0) { console.log('OK — nenhum campo pessoal sem classificação detectado.'); }
    else {
      console.log(`\nLGPD audit: ${findings.length} ponto(s) de atenção em ${path}\n`);
      const w = (s, n) => String(s).padEnd(n).slice(0, n);
      console.log(w('SEVERIDADE', 20) + w('MODEL.CAMPO', 32) + w('DETECTADO', 12) + 'OBS');
      console.log('-'.repeat(96));
      for (const x of findings.sort((a, b) => a.severity.localeCompare(b.severity)))
        console.log(w(x.severity, 20) + w(x.model + '.' + x.field, 32) + w(x.categoriaDetectada, 12) + x.note);
      console.log('\nPENDENTE-SENSIVEL exige base do art. 11 (sem legítimo interesse).');
      console.log('Resolva anotando no schema: /// @lgpd:<comum|sensivel> base=<...> ret=<...>\n');
    }
  }
  // exit 1 se houver pendência sensível — útil em CI
  process.exit(findings.some(f => f.severity === 'PENDENTE-SENSIVEL') ? 1 : 0);
}

main();

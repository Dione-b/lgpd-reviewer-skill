# Taxonomia de campos — classificação LGPD

Carregue ao classificar campos de entidade, schema, DTO ou formulário. Objetivo: para CADA campo, decidir regime — **não-pessoal**, **pessoal comum (art. 7º)**, **pessoal sensível (art. 11)** — e marcar requisitos derivados (minimização, retenção, base legal, direitos).

## Regra de decisão

```
O campo, sozinho OU combinado com outros do registro,
permite identificar/identificável uma pessoa natural?
  não  → não-pessoal (fora da LGPD)
  sim  → revela saúde, biometria, genético, raça/etnia,
         religião, opinião política, filiação sindical,
         vida/orientação sexual?
           sim → PESSOAL SENSÍVEL (art. 11)
           não → PESSOAL COMUM (art. 7º)
```

Princípios chave (art. 5º, art. 6º):
- **Identificável** inclui identificação *indireta* por combinação. `cep + data_nascimento + sexo` pode reidentificar — trate o conjunto como pessoal.
- **Anonimizado** (art. 5º-III/XI): só sai da LGPD se a reidentificação não for razoável com meios técnicos disponíveis. Hash reversível ou com baixa cardinalidade NÃO é anonimização.
- **Pseudonimizado** (art. 13 §4º): continua sendo dado pessoal.
- Ter acesso a dado pessoal sem realizar operação ainda é tratamento.

## Pessoal comum (art. 7º)

| Campo / padrão de nome | Notas LGPD |
|---|---|
| `nome`, `nomeCompleto`, `nomeSocial`, `nomeMae` | nomeMãe é vetor de fraude — minimizar |
| `cpf`, `cnpjMei`, `rg`, `cnh`, `tituloEleitor`, `pis`, `nis`, `passaporte` | identificadores governamentais — alto risco, mascarar em logs/UI |
| `email`, `telefone`, `celular`, `whatsapp` | contato — comum |
| `endereco`, `logradouro`, `cep`, `numero`, `complemento` | endereço completo identifica |
| `dataNascimento`, `idade`, `sexo`, `genero`, `estadoCivil`, `nacionalidade` | sexo/gênero ≠ orientação sexual (esta é sensível) |
| `ip`, `ipAddress`, `userAgent`, `deviceId`, `cookieId`, `fingerprint` | identificadores online = dado pessoal |
| `geolocalizacao`, `latitude`, `longitude`, `lastKnownLocation` | localização vinculável a pessoa |
| `fotoPerfil`, `avatarUrl`, `selfie` | imagem facial → ver nota biometria abaixo |
| `matricula`, `prontuarioId`, `clienteId`, `usuarioId` quando ligado a pessoa | pseudônimo → ainda pessoal |
| `salario`, `renda`, `scoreCredito`, `dadosBancarios`, `cartao` | financeiro — comum, mas alto impacto; base proteção ao crédito pode aplicar |
| `placaVeiculo`, `chassi` quando vinculado a proprietário | pessoal por vínculo |

## Pessoal sensível (art. 11) — regime restrito

Qualquer um destes ⇒ art. 11, **sem hipótese de legítimo interesse**:

| Categoria | Campos / padrões |
|---|---|
| Saúde | `diagnostico`, `cid`, `prontuario`, `medicamento`, `alergia`, `deficiencia`, `tipoSanguineo`, `gravidez`, `planoSaude`, `examLab`, `cirurgia`, `saudeMental` |
| Biométrico | `digital`, `impressaoDigital`, `templateBiometrico`, `faceEmbedding`, `reconhecimentoFacial`, `iris`, `voiceprint`, foto usada para *identificação biométrica* |
| Genético | `dna`, `genoma`, `examGenetico`, `ancestralidade` |
| Raça/etnia | `raca`, `corPele`, `etnia`, `povoIndigena`, `quilombola` |
| Religião | `religiao`, `credo`, `conviccaoReligiosa` |
| Opinião política | `partido`, `opiniaoPolitica`, `filiacaoPartidaria` |
| Filiação sindical | `sindicato`, `filiacaoSindical` |
| Vida/orientação sexual | `orientacaoSexual`, `identidadeGenero` (quando revela), `vidaSexual` |

**Foto / imagem facial:** comum se uso é só avatar/exibição; vira **sensível (biométrico)** se usada para identificação/autenticação facial. Classifique pelo USO, não pelo tipo do campo.

## Dados de criança e adolescente (art. 14)

Não é categoria sensível formal, mas tem regime próprio: tratamento no **melhor interesse**, consentimento **específico de um dos pais/responsável**. Marque qualquer entidade com `dataNascimento`/idade que possa indicar < 18 (esp. < 12) para revisão de consentimento parental.

## Saída esperada da classificação

Use a tabela da **seção 2** em `references/report-format.md` (não invente colunas adicionais sem necessidade).

- **Minimizar?** = necessário para a finalidade? Se não, recomende remover (art. 6º-III).
- **Em logs?** = aparece em log/trace/analytics? PII/sensível em log ⇒ vazamento.

## Pontos de atenção recorrentes

- Campos `JSON`/`metadata`/`payload`/`extra` podem esconder PII — inspecione conteúdo, não só o nome.
- `observacao`, `descricao`, `comentario` em texto livre frequentemente contêm dado pessoal/sensível não estruturado.
- Tabelas de auditoria/histórico (`*_log`, `*_audit`, `*_history`) replicam PII e herdam o mesmo regime + retenção.
- Backups e réplicas também são tratamento — retenção e eliminação aplicam-se a eles.
- Integrações externas (`partnerId`, `externalRef`) podem caracterizar compartilhamento → exige base legal própria.

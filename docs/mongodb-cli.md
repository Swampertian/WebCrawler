# MongoDB CLI na imagem `mongo:7`

Este projeto usa o servico `mongo` definido em `docker-compose.yml` com a imagem `mongo:7`.
Nessa imagem, o shell interativo disponivel e o `mongosh`.

## Acessar o MongoDB

Subir o container:

```bash
docker compose up -d mongo
```

Abrir o shell no banco configurado para o projeto:

```bash
docker compose exec mongo mongosh webcrawler
```

Abrir o shell sem selecionar banco:

```bash
docker compose exec mongo mongosh
```

Executar um comando direto sem entrar no modo interativo:

```bash
docker compose exec mongo mongosh webcrawler --eval 'db.runCommand({ ping: 1 })'
```

## Comandos basicos dentro do `mongosh`

Ver o banco atual:

```javascript
db
```

Listar bancos:

```javascript
show dbs
```

Selecionar ou criar um banco:

```javascript
use webcrawler
```

Listar collections:

```javascript
show collections
```

Ver estatisticas do banco:

```javascript
db.stats()
```

Sair do shell:

```javascript
exit
```

## Consultar documentos

Listar documentos de uma collection:

```javascript
db.results.find()
```

Listar documentos formatados:

```javascript
db.results.find().pretty()
```

Buscar um documento por filtro:

```javascript
db.results.findOne({ status: "done" })
```

Buscar com limite:

```javascript
db.results.find({ status: "done" }).limit(10)
```

Ordenar resultados:

```javascript
db.results.find().sort({ createdAt: -1 }).limit(10)
```

Selecionar apenas alguns campos:

```javascript
db.results.find({}, { url: 1, status: 1, _id: 0 })
```

Contar documentos:

```javascript
db.results.countDocuments()
```

Contar documentos com filtro:

```javascript
db.results.countDocuments({ status: "done" })
```

## Inserir, atualizar e remover

Inserir um documento:

```javascript
db.results.insertOne({
  url: "https://example.com",
  status: "pending",
  createdAt: new Date()
})
```

Inserir varios documentos:

```javascript
db.results.insertMany([
  { url: "https://example.com/a", status: "pending", createdAt: new Date() },
  { url: "https://example.com/b", status: "pending", createdAt: new Date() }
])
```

Atualizar o primeiro documento encontrado:

```javascript
db.results.updateOne(
  { url: "https://example.com" },
  { $set: { status: "done", updatedAt: new Date() } }
)
```

Atualizar varios documentos:

```javascript
db.results.updateMany(
  { status: "pending" },
  { $set: { status: "queued", updatedAt: new Date() } }
)
```

Remover um documento:

```javascript
db.results.deleteOne({ url: "https://example.com" })
```

Remover varios documentos:

```javascript
db.results.deleteMany({ status: "queued" })
```

## Indices

Listar indices de uma collection:

```javascript
db.results.getIndexes()
```

Criar indice simples:

```javascript
db.results.createIndex({ url: 1 })
```

Criar indice unico:

```javascript
db.results.createIndex({ url: 1 }, { unique: true })
```

Criar indice composto:

```javascript
db.results.createIndex({ status: 1, createdAt: -1 })
```

Remover indice:

```javascript
db.results.dropIndex("url_1")
```

## Diagnostico

Testar se o MongoDB responde:

```javascript
db.runCommand({ ping: 1 })
```

Ver informacoes do servidor:

```javascript
db.version()
```

Ver conexoes e status geral:

```javascript
db.serverStatus()
```

Ver plano de execucao de uma consulta:

```javascript
db.results.find({ status: "done" }).explain("executionStats")
```

## Backup e restore usando a imagem `mongo:7`

Gerar dump dentro do container:

```bash
docker compose exec mongo mongodump --db webcrawler --out /tmp/mongo-dump
```

Copiar dump para a maquina local:

```bash
docker compose cp mongo:/tmp/mongo-dump ./mongo-dump
```

Restaurar dump:

```bash
docker compose cp ./mongo-dump mongo:/tmp/mongo-dump
docker compose exec mongo mongorestore --drop --db webcrawler /tmp/mongo-dump/webcrawler
```

Exportar uma collection para JSON:

```bash
docker compose exec mongo mongoexport --db webcrawler --collection results --out /tmp/results.json
docker compose cp mongo:/tmp/results.json ./results.json
```

Importar uma collection de JSON:

```bash
docker compose cp ./results.json mongo:/tmp/results.json
docker compose exec mongo mongoimport --db webcrawler --collection results --file /tmp/results.json
```

## Dicas rapidas

- Troque `results` pelo nome real da collection que voce quer consultar.
- `use webcrawler` nao cria o banco imediatamente; ele aparece em `show dbs` depois que algum dado for inserido.
- Use `deleteMany` e `drop` com cuidado, porque removem dados de forma definitiva dentro do volume Docker.
- Para apagar todo o banco do projeto dentro do `mongosh`, use `db.dropDatabase()` somente quando tiver certeza.

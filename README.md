# AgroGestao

## Como instalar e rodar ambiente de desenvolvimento

### 1. Clone o repositório em sua máquina

```bash
git clone https://github.com/Laricarvalho1/AgroGestao
```

Então acesse o diretório:

```bash
cd AgroGestao
```

### 2. Configure banco de dados

Copie o template de varáveis de ambiente

```bash
cp .env.example .env
```

Agora, com o editor de texto de sua preferência, abra o `.env` e configure a connection string do Postgres seguindo o modelo indicado no arquivo, algo como:

```
DATABASE_URL=postgres://[usuário]:[senha]@[ip]:[port]/[nome_do_banco]
```

Para as tabelas serem aplicadas no banco de dados rode:

```bash
npm run push:db
```

### 3. Instale as dependências

```bash
npm i
```

### 4. Inicie servidor de desenvolvimento

```bash
npm run dev
```

Agora basta abrir navegador em `http://localhost:3000` e lá estará a aplicação com hot reloading para cada modificação que fizer.

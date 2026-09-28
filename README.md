# Próximo Passo

Site gratuito que ajuda mulheres a montar um currículo em poucos minutos, com perguntas simples, pelo celular. No final, a pessoa baixa um PDF de uma página, organizado do jeito que recrutadores leem, ou copia o texto para colar em sites de vagas.

O app foi pensado para mulheres em situação de vulnerabilidade, inclusive as que passaram por violência. Por isso a tela tem um nome neutro e não fala de violência: se outra pessoa olhar o celular, vê só um app de currículo.

## Como o app protege quem usa

| Proteção | Como funciona |
|---|---|
| Nada sai do aparelho | Não existe servidor, banco de dados nem formulário que envia dados. O PDF é criado dentro do próprio navegador. A regra de segurança (`connect-src 'none'`) proíbe o site de fazer qualquer envio pela internet. |
| Nada fica guardado | As respostas ficam só na memória da página. Não há cookies, `localStorage` nem cadastro. Fechar ou recarregar a página apaga tudo. |
| Saída rápida | O botão **Sair rápido** apaga tudo e troca a página pelo Google, sem deixar o site no botão "voltar". No computador, **Esc** duas vezes faz o mesmo. |
| Sem rastreamento | Nenhum script de terceiros, nenhuma fonte ou imagem de fora, nenhum analytics. |
| Mínimo de dados | O app pede só nome, telefone e cidade. Ele orienta a não colocar CPF, RG, idade, estado civil, endereço completo nem foto. |
| Discrição | O nome, as cores e os textos não fazem referência a violência. O telefone 180 aparece só dentro de "Como este site protege você". |

**Limites que vale conhecer:**
- Como em qualquer site, o endereço pode ficar no histórico do navegador. O próprio app sugere usar aba anônima.
- O PDF baixado fica na pasta Downloads até a pessoa apagar. O app lembra disso no final.
- A Vercel, como toda hospedagem, registra dados técnicos de acesso (como o IP) por pouco tempo. O conteúdo do currículo nunca chega até ela.
- **Não ative** o "Web Analytics" nem o "Speed Insights" da Vercel neste projeto.

## Publicar no GitHub e na Vercel (sem programar)

### 1. Colocar os arquivos no GitHub
1. Entre em [github.com](https://github.com) (crie uma conta, se não tiver).
2. Clique em **+** (canto superior direito) > **New repository**.
3. Nome: `proximo-passo`. Deixe **Public** ou **Private** (os dois funcionam com a Vercel). Não marque nenhuma opção de README. Clique em **Create repository**.
4. Na página seguinte, clique no link **uploading an existing file**.
5. Descompacte o arquivo `proximo-passo.zip` no computador, abra a pasta e **arraste todo o conteúdo dela** (as pastas `css`, `js`, `icons` e os arquivos soltos) para a página do GitHub.
6. Clique em **Commit changes**.

### 2. Publicar na Vercel
1. Entre em [vercel.com](https://vercel.com) e clique em **Sign Up** > **Continue with GitHub** (usa a mesma conta).
2. Clique em **Add New…** > **Project**.
3. Na lista, encontre `proximo-passo` e clique em **Import**. Se ele não aparecer, clique em **Adjust GitHub App Permissions** e libere o repositório.
4. Em **Framework Preset**, deixe **Other**. Não precisa mudar mais nada.
5. Clique em **Deploy**. Em cerca de 1 minuto, o site fica no ar num endereço como `proximo-passo.vercel.app`.

Pronto: qualquer pessoa com o link pode usar. Cada vez que um arquivo for alterado no GitHub, a Vercel publica a nova versão sozinha.

### 3. (Opcional) Endereço próprio
Na Vercel, abra o projeto > **Settings** > **Domains** e adicione um domínio, por exemplo `curriculo.suaorganizacao.org.br`. A Vercel mostra o que configurar no provedor do domínio.

## Como mudar perguntas e textos

Quase tudo o que aparece no app está em **`js/perguntas.js`**, com comentários em português:

- `AREAS`: vagas que a pessoa pode escolher e o título que vai para o objetivo.
- `EXPERIENCIAS`: funções (caixa, repositora, diarista, revenda etc.) e as frases prontas que viram tópicos do currículo.
- `FORCAS` e `FERRAMENTAS`: pontos fortes e habilidades.
- `ESCOLARIDADE` e `CURSOS_SUGERIDOS`.
- `EXEMPLO`: o currículo de exemplo, com dados inventados.

Em **`js/config.js`** ficam o endereço do botão "Sair rápido" e a opção de mostrar o telefone 180.

Dá para editar direto no GitHub: abra o arquivo, clique no lápis (**Edit**), faça a mudança e clique em **Commit changes**. A Vercel publica sozinha em seguida.

## Testar no computador

Abra a pasta num terminal e rode:

```
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`. Também funciona abrindo o `index.html` direto no navegador.

## Estrutura

```
index.html              página única do app
css/estilo.css          visual (cores e fontes nas variáveis do topo)
js/config.js            configurações gerais
js/perguntas.js         perguntas, opções e frases (edite aqui)
js/curriculo.js         transforma as respostas no currículo
js/pdf.js               cria o PDF dentro do navegador, sem bibliotecas
js/pdf-metricas.js      larguras das letras usadas no PDF
js/app.js               telas, navegação e botões
icons/                  ícones do app
manifest.webmanifest    permite "Adicionar à tela inicial" no celular
vercel.json             regras de segurança da hospedagem
```

Não há dependências, instalação nem etapa de build: são só arquivos estáticos.

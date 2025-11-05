# ❓ FAQ - Perguntas Frequentes

Respostas para as perguntas mais comuns sobre o MVP Estetoscópio.

---

## 📋 Índice

- [Geral](#geral)
- [Conta e Login](#conta-e-login)
- [Baralhos e Cards](#baralhos-e-cards)
- [Modo de Estudo](#modo-de-estudo)
- [Upload de Arquivos](#upload-de-arquivos)
- [Técnico](#técnico)
- [Segurança e Privacidade](#segurança-e-privacidade)

---

## 🌐 Geral

### O que é o MVP Estetoscópio?

É um sistema de flashcards online inspirado no Anki, projetado para estudos com repetição espaçada. Permite criar baralhos personalizados com texto, imagens e áudio.

### É gratuito?

Sim! O projeto é open source e totalmente gratuito para uso pessoal.

### Preciso instalar algo?

Não! É uma aplicação web que funciona direto no navegador. Basta acessar a URL e criar sua conta.

### Funciona offline?

Atualmente não. A aplicação requer conexão com internet. O suporte offline está planejado para versões futuras (PWA).

### Em quais dispositivos funciona?

Funciona em qualquer dispositivo com navegador moderno:

- 💻 Desktop (Windows, Mac, Linux)
- 📱 Smartphones (Android, iOS)
- 📲 Tablets

### Quais navegadores são suportados?

Recomendamos navegadores modernos:

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 🔐 Conta e Login

### Como criar uma conta?

1. Acesse `/signup`
2. Preencha nome, email e senha
3. Clique em "Criar Conta"
4. Pronto! Você será redirecionado ao dashboard

### Esqueci minha senha, o que faço?

⚠️ Atualmente não há sistema de recuperação de senha. Entre em contato com o administrador ou crie uma nova conta.

**Planejado para v1.1**: Sistema de recuperação de senha via email.

### Posso alterar meu email?

⚠️ Atualmente não é possível alterar o email. Essa funcionalidade está planejada para v1.1.

### Como excluir minha conta?

⚠️ Atualmente não há opção de auto-exclusão de conta. Entre em contato com o administrador.

**Planejado para v1.1**: Opção de exclusão de conta na página de perfil.

### Por quanto tempo fico logado?

Sua sessão dura **24 horas**. Após esse período, você precisará fazer login novamente.

### Posso usar a mesma conta em vários dispositivos?

✅ Sim! Basta fazer login com o mesmo email e senha. Seus dados são sincronizados automaticamente.

---

## 📚 Baralhos e Cards

### Quantos baralhos posso criar?

Não há limite! Crie quantos baralhos precisar.

### Quantos cards posso ter em um baralho?

Não há limite técnico. Recomendamos 15-30 cards por baralho para melhor organização.

### Posso criar cards com imagens?

✅ Sim! Suportamos JPEG, PNG e GIF até 5MB.

### Posso criar cards com áudio?

✅ Sim! Suportamos MP3, WAV e OGG até 10MB.

### Como editar um card existente?

1. Acesse `/baralhos`
2. Clique em "Editar" no baralho
3. Modifique o card desejado
4. Clique em "Salvar Alterações"

### Posso reordenar os cards?

⚠️ Atualmente não. Os cards aparecem na ordem em que foram criados.

**Planejado para v1.1**: Funcionalidade de drag-and-drop para reordenar.

### Como duplicar um baralho?

⚠️ Atualmente não há opção de duplicar. Você precisa recriar manualmente.

**Planejado para v1.1**: Opção de duplicar baralho.

### Posso exportar meus baralhos?

⚠️ Atualmente não. Funcionalidade de exportação está planejada para v2.0 (JSON, CSV, formato Anki).

### Como importar baralhos do Anki?

⚠️ Atualmente não há suporte a importação. Está planejado para v2.0.

---

## 📖 Modo de Estudo

### Como funciona o sistema de repetição espaçada?

O sistema ajusta os intervalos de revisão baseado na sua avaliação:

- **Novamente**: Revisa em breve
- **Difícil**: Intervalo curto
- **Bom**: Intervalo médio
- **Fácil**: Intervalo longo

⚠️ Nota: A implementação completa do algoritmo está em desenvolvimento. Atualmente os botões são visuais.

### Posso pular um card?

Atualmente não há botão de "pular". Você pode avaliar como "Fácil" para ver menos vezes.

### Os cards aparecem em ordem aleatória?

⚠️ Atualmente aparecem na ordem criada. Ordem aleatória está planejada para v1.1.

### Posso ver quantos cards já estudei?

Sim! O contador de progresso mostra "Card X de Y".

### Posso voltar para o card anterior?

⚠️ Atualmente não. Navegação bidirecional está planejada para v1.1.

### Posso marcar cards como favoritos?

⚠️ Funcionalidade não disponível. Planejada para v2.0.

### Como pausar uma sessão de estudo?

Basta fechar ou sair da página. Você pode retomar a qualquer momento (começará do início).

---

## 📤 Upload de Arquivos

### Quais formatos de imagem são aceitos?

- JPEG/JPG
- PNG
- GIF

Tamanho máximo: **5MB**

### Quais formatos de áudio são aceitos?

- MP3
- WAV
- OGG

Tamanho máximo: **10MB**

### Como reduzir o tamanho de uma imagem?

Use ferramentas online gratuitas:

- [TinyPNG](https://tinypng.com/) - Para PNG
- [CompressJPEG](https://compressjpeg.com/) - Para JPEG
- [Squoosh](https://squoosh.app/) - Universal

### Como reduzir o tamanho de um áudio?

Use ferramentas online:

- [Online Audio Converter](https://online-audio-converter.com/)
- [MP3 Smaller](https://www.mp3smaller.com/)

Dica: Converta para MP3 com 128kbps - qualidade suficiente para flashcards.

### O que acontece se eu deletar um card com imagem?

A imagem permanece no servidor. Atualmente não há limpeza automática de arquivos não utilizados.

### Onde os arquivos são salvos?

Em produção local: `/public/uploads/`

Para produção, recomendamos usar serviços como:

- AWS S3
- Cloudinary
- DigitalOcean Spaces

### Posso fazer upload de vídeos?

⚠️ Não. Atualmente apenas imagens e áudios. Suporte a vídeo está em análise para v2.0.

---

## 🔧 Técnico

### Posso usar em um servidor próprio?

✅ Sim! O código é open source. Veja as instruções no [README](../../README.md#instalação).

### Qual banco de dados é usado?

**Desenvolvimento**: SQLite (embutido)
**Produção recomendada**: PostgreSQL ou MySQL

### Como fazer backup dos dados?

**SQLite**: Copie o arquivo `database.db`
**PostgreSQL/MySQL**: Use ferramentas de backup do banco

### Posso contribuir com código?

✅ Sim! Veja o guia de contribuição no [README](../../README.md#contribuindo).

### Onde reporto bugs?

Abra uma issue no [GitHub](https://github.com/bernardopg/mvp-estetoscopio/issues) com:

- Descrição do problema
- Passos para reproduzir
- Screenshots
- Navegador e SO

### Como sugiro novas features?

Abra uma issue no GitHub com a tag "enhancement" descrevendo:

- O que você quer
- Por que seria útil
- Como você imagina funcionando

### Qual a licença do projeto?

MIT License - Você pode usar livremente, inclusive comercialmente.

---

## 🔒 Segurança e Privacidade

### Meus dados estão seguros?

Sim! Implementamos várias medidas:

- ✅ Senhas hasheadas com bcrypt
- ✅ Autenticação JWT
- ✅ Cookies HTTP-only
- ✅ Validação de entrada

### Vocês vendem meus dados?

❌ Não! O projeto é open source e sem fins lucrativos. Seus dados são apenas seus.

### Onde meus dados são armazenados?

Em produção local: No servidor onde você hospedar.
Se usar serviço de hospedagem: Verifique a localização do provedor.

### Posso ver meus dados armazenados?

✅ Sim! Todo o conteúdo é acessível através da interface. Para dados técnicos (banco de dados), você precisa de acesso ao servidor.

### Como excluir todos os meus dados?

⚠️ Atualmente, entre em contato com o administrador.

**Planejado para v1.1**: Opção de exclusão completa de conta e dados.

### A comunicação é criptografada?

✅ Sim, se usar HTTPS (recomendado para produção).
⚠️ Em desenvolvimento local (HTTP), não há criptografia.

### Há coleta de analytics?

⚠️ Depende da implementação. O código base não inclui analytics.
Se desejar, pode adicionar Google Analytics, Plausible, etc.

---

## 🆘 Problemas Comuns

### "Erro ao carregar baralhos"

**Soluções**:

1. Recarregue a página (F5)
2. Limpe o cache do navegador
3. Verifique se está logado
4. Tente fazer logout e login novamente

### "Token inválido" ou "Não autorizado"

**Solução**: Faça logout e login novamente. Sua sessão pode ter expirado.

### "Erro ao fazer upload"

**Possíveis causas**:

- Arquivo muito grande (> 5MB para imagem, > 10MB para áudio)
- Formato não suportado
- Problema de conexão

**Soluções**:

1. Verifique o tamanho do arquivo
2. Converta para formato suportado
3. Tente novamente com conexão estável

### Card não vira ao pressionar Espaço

**Soluções**:

1. Clique no card primeiro (para dar foco)
2. Tente clicar no botão manualmente
3. Recarregue a página

### Áudio não toca

**Soluções**:

1. Verifique se o navegador permite autoplay
2. Clique manualmente no botão play
3. Verifique se o arquivo não está corrompido
4. Teste em outro navegador

---

## 💡 Dicas Rápidas

### Para Estudar Melhor

- 📅 Estude todos os dias (consistência > duração)
- 🎯 Sessões curtas de 15-20 minutos
- 🔄 Seja honesto nas avaliações
- 📝 Crie cards específicos (1 conceito = 1 card)
- 🖼️ Use imagens sempre que possível

### Para Criar Cards Eficazes

- ✅ Perguntas claras e objetivas
- ✅ Respostas curtas e diretas
- ✅ Use contexto na frente
- ✅ Inclua exemplos visuais
- ✅ Teste o card antes de adicionar mais

### Para Organizar Baralhos

- 📚 Um tema por baralho
- 📊 15-30 cards por baralho (ideal)
- 🏷️ Nomes descritivos
- 📈 Do básico ao avançado
- 🔍 Revise e atualize regularmente

---

## 📞 Ainda tem dúvidas?

Consulte a documentação completa:

- 📘 [Guia do Usuário](./user-guide.md)
- 🔧 [Arquitetura Técnica](../developer/architecture.md)
- 💡 [Exemplos de Código](./examples.md)
- 📝 [README Principal](../../README.md)

Ou entre em contato:

- 💬 [GitHub Discussions](https://github.com/bernardopg/mvp-estetoscopio/discussions)
- 🐛 [GitHub Issues](https://github.com/bernardopg/mvp-estetoscopio/issues)
- 📧 Email: <seu-email@example.com>

---

**Última atualização**: 04 de novembro de 2025

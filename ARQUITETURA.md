# KOF 2002 — Move Database
## Documentação de Arquitetura

---

## 1. ESTRUTURA DE DADOS

### Database (`DB`)
A estrutura principal reside em `DB.characters` (array):

```javascript
{
  id: 'athena',              // ID único para referência
  name: 'Athena',            // Nome do personagem (exibido)
  fullName: 'Athena Asamiya', // Nome completo
  team: 'Psycho Soldiers',   // Time/Organização
  style: 'Psycho Power',     // Estilo de luta
  tier: 'S',                 // Tier competitivo (S/A/B/C...)
  image: 'imagens/Athena.png', // Caminho da imagem (opcional)
  avatarGradient: ['#8b1a6b', '#5a1080'], // Fallback: gradiente
  avatarText: 'A',           // Fallback: letra/símbolo
  tags: ['PSYCHO POWER', 'PROJECTILE', 'OVERHEAD'], // Características
  categories: [...]          // Categorias de movimentos
}
```

### Categories
Cada personagem tem 3 categorias padrão:

```javascript
{
  id: 'combos',          // ID único
  name: 'Combos e Combos com Especiais',
  type: 'combo',         // 'combo' | 'secret' | 'special'
  description: '...',    // Descrição para usuário
  moves: [               // Array de movimentos
    {
      id: 'c1',                    // ID único
      name: 'BnB Básico',         // Nome personalizado
      inputs: ['⬇️ ↘️ ➡️ + A'],  // Comando
      description: 'Meia lua...',  // Descrição opcional
      notes: 'Funciona no canto'   // Observações opcionais
    }
  ]
}
```

---

## 2. ADICIONANDO NOVOS PERSONAGENS

### Passo 1: Preparar a imagem
- Adicionar arquivo em `Imagens/NomePersonagem.png`
- Dimensões recomendadas: quadrado (ex: 256x256, 512x512)
- Enquadramento: rosto/busto centralizado
- Formato: PNG com transparência (recomendado)

### Passo 2: Adicionar ao DB
Em `app.js`, descomentar e preencher template em `DB.characters`:

```javascript
{
  id: 'kyo',
  name: 'Kyo',
  fullName: 'Kyo Kusanagi',
  team: 'Japan Team',
  style: 'Flame Mastery',
  tier: 'S',
  image: 'Imagens/Kyo.png',      // Opcional
  avatarGradient: ['#d4641e', '#8b3f00'],
  avatarText: 'K',
  tags: ['FIRE', 'RUSHDOWN'],
  categories: [
    { id: 'combos', ... },
    { id: 'secrets', ... },
    { id: 'specials', ... }
  ]
}
```

### Passo 3: Sem mais mudanças!
- UI se adapta automaticamente
- Sidebar mostra contador correto
- Todas as funcionalidades funcionam

---

## 3. IMAGENS

### Uso Atual
- **Athena**: `imagens/Athena.png` — usado em cards de lista e detalhe
- **Fallback**: se `image` não existir, usa `avatarGradient` + `avatarText`

### CSS (style.css)
```css
.char-avatar img {
  object-fit: cover;         /* Mantém proporção, preenche container */
  object-position: center;   /* Centraliza */
}
```

### Em renderCharacterList() e renderCharacterDetail()
Verifica `char.image` — se existir, usa `<img>`, senão usa placeholder com gradiente.

---

## 4. PWA (Progressive Web App)

### Arquivos de Configuração
- **manifest.json**: Metadados do app (nome, ícones, tema)
- **service-worker.js**: Offline capability e caching

### Como Funciona
1. Usuário acessa o app
2. Service Worker registra em background
3. Assets essenciais são cacheados
4. Offline: serve do cache; Online: rede primeiro, depois cache
5. App pode ser instalado em Android/iOS/Desktop

### Assets Cacheados
- `index.html`, `app.js`, `style.css`, `manifest.json`
- Imagens são cacheadas dinamicamente on-demand

### Instalação do Usuário
- **Android Chrome**: Menu > "Instalar app" ou ícone de instalação
- **iOS**: Safari > Compartilhar > "Adicionar à tela inicial"
- **Desktop**: Menu > "Instalar"

---

## 5. PERSISTÊNCIA (Local Storage)

### Dados Salvos
```javascript
Storage.key = 'kof2002_app_data'
```

Salva estrutura completa de `DB` com todos os movimentos criados pelo usuário.

### Fluxo
1. Dados carregados de `localStorage` ao iniciar (loadAppData)
2. Quando usuário salva um movimento → `Storage.save(DB)`
3. Fecha e reabre → dados restaurados automaticamente

---

## 6. ESTRUTURA DE PASTAS

```
App KOF 2002/
├── index.html              # HTML principal
├── app.js                  # Lógica + banco de dados
├── style.css               # Estilos
├── manifest.json           # PWA manifest
├── service-worker.js       # SW para offline
├── ARQUITETURA.md          # Este arquivo
└── Imagens/
    ├── Athena.png          # Imagem da Athena
    └── [Novos chars aqui]
```

---

## 7. FLUXO DE NAVEGAÇÃO

```
Intro Screen
    ↓
Characters List (view-characters)
    ↓
Character Detail (view-character-detail)
    ↓
Category Detail (view-category-detail)
    ↓
[Adicionar/Editar Movimentos]
```

- Back buttons navegam para trás
- Sidebar permite pular para qualquer seção

---

## 8. EXPANSÃO FUTURA

### Próximos Passos Sugeridos (SEM FAZER AGORA)
- [ ] Adicionar mais personagens (basta seguir Passo 1-2 acima)
- [ ] Implementar filtros por tier/estilo
- [ ] Exportar/importar dados (JSON)
- [ ] Tema claro/escuro (toggle)
- [ ] Sincronizar com cloud (Firebase, etc)
- [ ] Compartilhar combos favoritos

### Pontos de Extensão
- `state.currentCharacter` e `state.currentCategory` já existem para múltiplos personagens
- UI é 100% data-driven — muda automaticamente com DB
- Local Storage já suporta múltiplos personagens

---

## 9. NOTES TÉCNICAS

### Gradientes de Avatar (Fallback)
Cores para novos personagens:
- **Psycho Power** (Athena): `['#8b1a6b', '#5a1080']`
- **Flame** (Kyo): `['#d4641e', '#8b3f00']`
- **Ice** (Kula): `['#1e9dd4', '#005a8b']`
- **Dark Power** (Rugal): `['#1a1a3e', '#3e0000']`

### IDs de Categoria (Padrão)
- `combos` — Combos e combos com especiais
- `secrets` — Técnicas secretas/avançadas
- `specials` — Golpes especiais/DMs/SDMs

Não mude estes IDs — eles são usados em `localStorage` e UI.

---

## 10. SUPORTE

Para dúvidas sobre:
- **Adicionar personagem**: Ver Seção 2
- **Alterar layout**: Estudar `style.css` + classes no HTML
- **Adicionar funcionalidade**: Estender funções em `app.js`
- **PWA/Offline**: Revisar `service-worker.js`

**Importante**: Qualquer mudança que altere `DB.characters[].id` quebra `localStorage` de usuários antigos — sempre preserve IDs existentes!

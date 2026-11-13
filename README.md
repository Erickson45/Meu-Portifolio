# Portfólio — Erickson Queiroz

[![Qualidade do site](https://github.com/Erickson45/Meu-Portifolio/actions/workflows/qualidade.yml/badge.svg)](https://github.com/Erickson45/Meu-Portifolio/actions/workflows/qualidade.yml)

Site pessoal para apresentar minha trajetória, projetos e foco profissional em **DevOps, SRE, Automação e AIOps**.

🔗 **Live:** https://erickson45.github.io/Meu-Portifolio/

## O que tem aqui

Uma single-page em HTML, CSS e JavaScript puros, sem build e sem framework, cheia de coisa interativa:

- **Terminal de verdade** no topo: `help`, `whoami`, `projetos`, `neofetch`, `curriculo`, `plantao`… e alguns comandos escondidos.
- **Mini-Erickson**: um mascote em pixel art com sotaque potiguar, desenhado 100% por código. Anda pelo rodapé conforme a rolagem, fala em balões que saem da cabeça dele (com efeito de digitação), comenta os cards em que o mouse passa, segue o cursor com os olhos, pula no clique, dança forró no duplo clique, pode ser arrastado e cochila se a página fica parada.
- **Navegação lateral** por seções (telas largas) e seções numeradas com o mesmo padrão visual.
- **Carreira em modo RPG**: cada emprego é um nível, com barra de XP que enche na rolagem e LEVEL UP no cargo atual.
- **Diagrama interativo do Atlas**: alertas correndo do Zabbix até o NOC; clicando em cada componente aparece como ele funciona por dentro, incluindo a pipeline RAG da A.I.D.A. (sinônimos → busca vetorial → re-ranking → LLM local).
- **Minigame "Plantão no NOC"**: 30 segundos para tratar alertas antes que estourem o SLA, com MTTR, ranking e recorde.
- **Certificações como conquistas** que desbloqueiam ao aparecer na tela.
- Easter egg: o código Konami (↑↑↓↓←→←→BA).

### Projetos em destaque

- **Atlas** — plataforma interna de AIOps para centralizar alertas do Zabbix, automatizar triagem e acelerar resposta a incidentes (um módulo sanitizado está publicado [aqui](https://github.com/Erickson45/Atlas-Zabbix)); reduziu em 60% o tempo de abertura de chamados.
- **SRE-Copilot** — AIOps Incident Gateway: recebe webhooks do Zabbix/Prometheus e usa RAG + LLM local (Ollama) para sugerir diagnóstico e mitigação. [Repositório](https://github.com/Erickson45/sre-copilot).
- **Nativy** — tradução simultânea em chamadas de vídeo (WebRTC) usando IA 100% local (Whisper + Ollama). [Repositório](https://github.com/Erickson45/nativy).
- **RPG IA — Academia Arcana de Elyndor** — RPG em pixel art no navegador para aprender IA (Flask, SQLite, WebSockets, Canvas), com multijogador; ficou no ar em VM Linux própria (Nginx, Gunicorn, Let's Encrypt). [Código](https://github.com/Erickson45/RPG-IA).
- **PC Estribado** — app desktop open source de manutenção do Windows (limpeza, saúde, drivers e atualizações) com atualização verificada por SHA-256. [Repositório](https://github.com/Erickson45/pc-estribado).

## Qualidade (CI)

A cada push, o GitHub Actions ([`qualidade.yml`](.github/workflows/qualidade.yml)) roda:

| Job | O que faz |
| --- | --- |
| HTML válido | `html-validate` no `index.html` e checagem de sintaxe dos scripts |
| Links funcionando | `lychee` confere todos os links do site e do README |
| Lighthouse | mede performance, acessibilidade, boas práticas e SEO |

## Detalhes técnicos

- Animações só rodam com a seção visível (`IntersectionObserver`) e pausam com a aba em segundo plano.
- Respeita `prefers-reduced-motion`: sem animações, mas tudo continua funcionando.
- Arte em pixel desenhada em `<canvas>` a partir de código, sem sprites de imagem.
- Imagens otimizadas em `img/` (a página inteira carrega menos de 1 MB de imagens).
- Hospedagem via GitHub Pages.

## Estrutura

```
.
├── index.html                # estrutura e estilos
├── js/
│   ├── terminal.js           # terminal interativo
│   ├── mascote.js            # mini-Erickson em pixel art
│   ├── rpg.js                # carreira com XP e conquistas
│   ├── fluxo.js              # diagrama animado do Atlas
│   └── plantao.js            # minigame Plantão no NOC
├── img/                      # imagens otimizadas
├── .github/                  # pipeline de qualidade e config do Lighthouse
└── Erickson-Queiroz-Curriculo.pdf
```

## Rodando localmente

Como é uma página estática, não há instalação nem build:

```bash
git clone https://github.com/Erickson45/Meu-Portifolio.git
cd Meu-Portifolio
python3 -m http.server 8000
```

Depois é só abrir http://localhost:8000.

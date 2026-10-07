# Portfólio — Erickson Queiroz

Site pessoal para apresentar minha trajetória, projetos e foco profissional em **DevOps, SRE, Automação e AIOps**.

🔗 **Live:** https://erickson45.github.io/Meu-Portifolio/

## O que tem aqui

Uma single-page em HTML/CSS/JS puro, sem build step e sem dependências externas de runtime, com:

- **Home** — apresentação rápida e principais eixos de atuação (Monitoramento, Automação, AIOps).
- **História / Carreira** — linha do tempo profissional completa, da primeira experiência (Brisanet, 2019) até a posição atual na Softplan, incluindo as transições internas de cargo.
- **Projetos** — cards com os projetos que mais representam meu trabalho, entre eles:
  - **Atlas** — plataforma interna de AIOps para centralizar alertas do Zabbix, automatizar triagem e acelerar resposta a incidentes (um módulo sanitizado está publicado [aqui](https://github.com/Erickson45/Atlas-Zabbix)); reduziu em 60% o tempo de abertura de chamados.
  - **SRE-Copilot** — AIOps Incident Gateway: recebe webhooks do Zabbix/Prometheus e usa RAG + LLM local (Ollama) para sugerir diagnóstico e mitigação. [Repositório](https://github.com/Erickson45/sre-copilot).
  - **Nativy** — projeto pessoal open-source de tradução simultânea em chamadas de vídeo (WebRTC) usando IA 100% local (Whisper + Ollama). [Repositório](https://github.com/Erickson45/nativy).
- **Certificações** — Google AI, Google Cybersecurity, Google Linux and SQL, IBM Software Engineering Essentials, Cisco (Cibersegurança Júnior), Alura (Especialista em IA) e Santander Academy (AWS).

## Tecnologias utilizadas

- HTML5 semântico + CSS3 (variáveis, grid/flexbox, animações via `IntersectionObserver`)
- JavaScript puro (sem frameworks)
- Ícones via [Ionicons](https://ionic.io/ionicons)
- Fallback de imagens 100% local: quando uma imagem não carrega, um gerador de placeholder em SVG (`data:` URI, embutido no próprio HTML) entra no lugar — sem chamadas a serviços externos, sem loop de retry
- Hospedagem via GitHub Pages

## Estrutura

```
.
├── index.html     # página única: estrutura, estilos e scripts
├── *.png / *.jpg  # imagens de projetos, certificações e perfil
└── README.md
```

## Rodando localmente

Como é uma página estática, não há instalação nem build:

```bash
git clone https://github.com/Erickson45/ericksonqueiroz.github.io.git
cd ericksonqueiroz.github.io
# abra o index.html direto no navegador, ou sirva com qualquer servidor estático:
python3 -m http.server 8000
```

## Sobre mim

Analista com background em NOC/monitoramento (Zabbix, Grafana), hoje atuando na interseção entre infraestrutura, automação (Python) e IA, com interesse em seguir para SRE, Observabilidade e DevOps. Mais detalhes na seção "História" do site, no [LinkedIn](https://www.linkedin.com/in/erickson-queiroz/) e no repositório do [Nativy](https://github.com/Erickson45/nativy).

# Registros de Decisão Arquitetural (ADRs)

Este documento registra as principais escolhas técnicas do projeto, avaliando trade-offs conforme exigido nos critérios do laboratório.

---

## ADR 01: Plataforma de Execução e Computação
*   **Contexto:** Necessidade de executar uma API Node.js leve para receber eventos sintéticos.
*   **Alternativas Analisadas:** Amazon EC2 (IaaS), AWS Lambda (FaaS) e Amazon ECS com AWS Fargate (CaaS).
*   **Decisão:** **Amazon ECS com AWS Fargate**.
*   **Justificativa:** O Fargate isenta a equipe da sobrecarga operacional de aplicar patches em sistemas operacionais (como seria no EC2) e resolve a necessidade de empacotamento contínuo em contêineres Docker de forma mais nativa que o Lambda para APIs de longa duração.
*   **Consequências:** Necessidade de utilizar o Amazon ECR para versionamento de imagens e configuração de Security Groups dedicados para as Tasks.

## ADR 02: Estratégia de Dados e Persistência
*   **Contexto:** O projeto base aceitava uma aplicação *stateless* (sem estado), mas o tema "CyberBank" exigia simulação de fraudes e saldos.
*   **Alternativas Analisadas:** Execução sem estado, Amazon RDS (SQL) ou Amazon DynamoDB (NoSQL).
*   **Decisão:** **Amazon DynamoDB**.
*   **Justificativa:** Optamos por não seguir a rota *stateless* para agregar valor de cibersegurança ao projeto. O DynamoDB foi escolhido por ser um serviço gerenciado, de baixa latência e integração nativa via SDK da AWS, sendo mais barato e rápido de provisionar via IaC do que um cluster RDS.
*   **Consequências:** Aumento leve na complexidade do código Node.js (necessidade de AWS SDK) e provisionamento de rotas de rede (VPC Endpoints/NAT) para alcance do serviço.

## ADR 03: Observabilidade
*   **Contexto:** Necessidade de registrar e auditar os eventos sintéticos recebidos pela aplicação.
*   **Decisão:** **Amazon CloudWatch Logs**.
*   **Justificativa:** Serviço nativo do ecossistema AWS. O driver `awslogs` do ECS Fargate envia automaticamente a saída padrão (`stdout`) da aplicação Node.js diretamente para os Log Groups, sem necessidade de instalar agentes de terceiros no contêiner.

## ADR 04: Automação e Controle de Custos (FinOps)
*   **Contexto:** Necessidade de reproduzir a arquitetura facilmente e destruí-la para não esgotar os créditos do laboratório (cleanup).
*   **Alternativas Analisadas:** Provisionamento manual via Console, AWS CloudFormation e HashiCorp Terraform.
*   **Decisão:** **Terraform**.
*   **Justificativa:** Sintaxe HCL mais amigável que o JSON/YAML do CloudFormation. O gerenciamento de estado do Terraform facilita a identificação de mudanças e garante a destruição completa do ambiente (`destroy`) com um único comando.

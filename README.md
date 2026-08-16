# ☁️ Projeto 1 AWS CloudLab - CyberBank

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Terraform](https://img.shields.io/badge/terraform-%235835CC.svg?style=for-the-badge&logo=terraform&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

Este repositório contém a arquitetura e a operação de um workload de referência na AWS, desenvolvido como projeto da unidade curricular de **Pentesting em Nuvem** do SENAI. 

A missão do projeto foi transformar os fundamentos de computação em nuvem em uma arquitetura funcional, observável, reproduzível e com consciência de custos (FinOps). A solução entrega um microsserviço (CyberBank) projetado para receber eventos sintéticos e validar lógicas de negócios transacionais focadas em cibersegurança e resiliência.

---

## 🏗️ Arquitetura e Decisões Técnicas

O ambiente foi desenhado para evitar pontos únicos de falha e reduzir a sobrecarga operacional, utilizando os seguintes componentes:

*   **VPC & Redes:** Isolamento lógico com sub-redes distribuídas em múltiplas Zonas de Disponibilidade (`us-east-1a` e `us-east-1b`).
*   **Balanceamento (ALB):** Um *Application Load Balancer* gerencia o tráfego de entrada, distribuindo as requisições de forma segura.
*   **Computação Serverless:** O workload foi empacotado em uma imagem Docker (padrão OCI) e implantado no **Amazon ECS com AWS Fargate**, eliminando a necessidade de gerenciar o sistema operacional subjacente.
*   **Armazenamento e Estado:** Embora o requisito base permitisse uma aplicação *stateless* (sem estado), a equipe optou por implementar o **Amazon DynamoDB** para suportar validações contra fraudes e rastreabilidade de transações, agregando valor arquitetural.
*   **Observabilidade:** Integração com o **Amazon CloudWatch** para a emissão de logs estruturados e monitoramento da saúde do serviço.
*   **Infraestrutura como Código (IaC):** Todo o provisionamento e *cleanup* (FinOps) são automatizados via **Terraform**.

---

## 📂 Estrutura do Repositório

Conforme os critérios de aceite do laboratório, o repositório está organizado da seguinte forma:

*   `/app`: Código-fonte da aplicação mínima (Node.js) e artefatos de construção (`Dockerfile`).
*   `/infra`: Scripts de provisionamento em Terraform.
*   `/docs`: Topologia, registros de decisão arquitetural (ADRs) e inventário.
*   `/evidence`: Evidências operacionais, capturas de observabilidade e logs de execução.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
*   [AWS CLI](https://aws.amazon.com/cli/) instalado e configurado com credenciais válidas.
*   [Terraform](https://www.terraform.io/downloads) instalado.
*   [Docker](https://www.docker.com/) instalado.

---

### Passo 1: Subir a Infraestrutura
Acesse o diretório de infraestrutura e inicie o provisionamento:

```bash
cd infra
terraform init
terraform apply -auto-approve
```

### Passo 2: Empacotar e Publicar a Imagem (ECR)
Construa a imagem Docker e faça o push para o repositório privado recém-criado:

```bash
cd ../app
docker build -t payment-app .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <SEU_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
docker tag payment-app:latest <SEU_ACCOUNT_ID>[.dkr.ecr.us-east-1.amazonaws.com/payment-app-repo:latest](https://.dkr.ecr.us-east-1.amazonaws.com/payment-app-repo:latest)
docker push <SEU_ACCOUNT_ID>[.dkr.ecr.us-east-1.amazonaws.com/payment-app-repo:latest](https://.dkr.ecr.us-east-1.amazonaws.com/payment-app-repo:latest)
```

### Passo 3: Limpeza (Cleanup)
Para evitar custos desnecessários após a validação do laboratório, destrua todos os recursos:

```bash
cd ../infra
terraform destroy -auto-approve
```

---

## 👥 Colaboradores
Equipe técnica responsável pelo planejamento arquitetural, integração de serviços e demonstração das evidências:

* [**Enrico Carvalho Marques**](https://github.com/link-do-enrico)
* [**João Gustavo da Silva**](https://github.com/KOI4884)
* [**Luigi Arnosti Reginato**](https://github.com/luigi-reginato)
* [**Naftali Lweji Bernado da Costa**](https://github.com/NaftalidaCosta)

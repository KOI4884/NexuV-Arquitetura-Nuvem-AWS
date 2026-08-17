# Runbook Operacional

Este runbook descreve os procedimentos padrão para implantar, testar e remover a infraestrutura do projeto.

## 1. Procedimento de Implantação (Deploy)

1.  Autentique-se no AWS CLI com credenciais válidas da conta Sandbox.
2.  Navegue até a pasta `/infra` e inicialize o Terraform:
    ```bash
    terraform init
    ```
3.  Aplique a infraestrutura (aprove automaticamente para ambientes de CI/CD ou laboratório):
    ```bash
    terraform apply -auto-approve
    ```
4.  Após a conclusão, o Terraform exibirá o endereço DNS do Load Balancer (ALB) ou IP associado.

## 2. Procedimento de Atualização da Aplicação

Sempre que o código em `/app` for alterado, a imagem Docker deve ser reconstruída e enviada ao ECR:

1. Navegue até a pasta `/app`.
2. Compile a nova imagem:
   ```bash
   docker build -t payment-app .
   ```
3. Autentique-se no ECR e faça o push:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   docker tag payment-app:latest <ACCOUNT_ID>[.dkr.ecr.us-east-1.amazonaws.com/payment-app-repo:latest](https://.dkr.ecr.us-east-1.amazonaws.com/payment-app-repo:latest)
   docker push <ACCOUNT_ID>[.dkr.ecr.us-east-1.amazonaws.com/payment-app-repo:latest](https://.dkr.ecr.us-east-1.amazonaws.com/payment-app-repo:latest)
   ```
4. No console do ECS, force um *Novo Implante* (Force New Deployment) no serviço para puxar a imagem atualizada.

## 3. Validação de Saúde (Healthcheck)

Para garantir que a task subiu corretamente, execute:
```bash
curl -X GET http://<IP_OU_DNS>:3000/health
```
**Comportamento Esperado:** Resposta HTTP 200 com status `healthy`.

## 4. Procedimento de Remoção e FinOps (Cleanup)

Para evitar cobranças fora da janela de testes:
1. Navegue até a pasta `/infra`.
2. Destrua os recursos provisionados:
   ```bash
   terraform destroy -auto-approve
   ```
3. Confirme no painel do Amazon Billing se não há recursos residuais ativos.

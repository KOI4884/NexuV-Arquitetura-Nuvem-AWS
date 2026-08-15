const express = require('express');
const path = require('path');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const app = express();
app.use(express.json());
app.disable('x-powered-by');

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

app.get('/', (req, res) => res.json({ service: "Payment Service", version: "2.0.0" }));

app.get('/health', (req, res) => res.json({ status: "healthy", version: "2.0.0", timestamp: new Date().toISOString() }));

app.post('/events', (req, res) => {
    console.log(JSON.stringify({ level: "INFO", message: "Evento recebido", data: req.body }));
    res.status(202).json({ id: `evt-${Date.now()}`, status: "received" });
});

app.get('/web', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const { Item } = await docClient.send(new GetCommand({ TableName: "CyberBank_Users", Key: { username } }));
        if (Item && Item.password === password) {
            res.json({ success: true, user: { username: Item.username, name: Item.name, balance: Item.balance } });
        } else {
            res.status(401).json({ success: false, message: "Credenciais inválidas." });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/balance/:username', async (req, res) => {
    try {
        const { Item } = await docClient.send(new GetCommand({ TableName: "CyberBank_Users", Key: { username: req.params.username } }));
        res.json({ balance: Item.balance });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/pix', async (req, res) => {
    const { sender, recipient, amount } = req.body;
    try {
        const senderData = await docClient.send(new GetCommand({ TableName: "CyberBank_Users", Key: { username: sender } }));
        if (senderData.Item.balance < amount) return res.status(400).json({ error: "Saldo insuficiente" });

        await docClient.send(new UpdateCommand({
            TableName: "CyberBank_Users", Key: { username: sender },
            UpdateExpression: "set balance = balance - :val", ExpressionAttributeValues: { ":val": amount }
        }));

        await docClient.send(new UpdateCommand({
            TableName: "CyberBank_Users", Key: { username: recipient },
            UpdateExpression: "set balance = balance + :val", ExpressionAttributeValues: { ":val": amount }
        }));

        const transaction = {
            transaction_id: `txn-${Date.now()}`,
            sender, recipient, amount,
            timestamp: new Date().toISOString()
        };
        await docClient.send(new PutCommand({ TableName: "CyberBank_Transactions", Item: transaction }));

        res.json({ success: true, transaction });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/history', async (req, res) => {
    try {
        const { Items } = await docClient.send(new ScanCommand({ TableName: "CyberBank_Transactions" }));
        res.json(Items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.listen(3000, () => console.log('Payment Service V2 com DynamoDB operando na porta 3000'));

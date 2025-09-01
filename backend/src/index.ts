import express from 'express';
import cors from 'cors';
import path from 'path';
import serverless from 'serverless-http';
import { authRouter } from './routes/auth';
import { resumesRouter } from './routes/resumes';
import { usersRouter } from './routes/users';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api/auth', authRouter);
app.use('/api/resumes', resumesRouter);
app.use('/api/users', usersRouter);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Servir arquivos estáticos do frontend
const frontendPath = path.join(__dirname, '../curriculo-inteligente/dist');
app.use(express.static(frontendPath));

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

// Servir o frontend para todas as rotas não-API (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../curriculo-inteligente/dist/index.html'));
});

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Health check disponível em: http://localhost:${PORT}/health`);
  });
}

// Para Vercel (serverless)
export default serverless(app);


import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // Configurar CORS más agresivo para resolver problemas inmediatos
    app.enableCors({
      origin: true, // Permitir todos los orígenes temporalmente
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
      allowedHeaders: '*',
      exposedHeaders: '*',
      preflightContinue: false,
      optionsSuccessStatus: 200
    });
    
    // Middleware simplificado para manejar preflight OPTIONS requests
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
      
      // Aplicar headers CORS a todas las respuestas
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
      res.header('Access-Control-Allow-Headers', '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400');
      res.header('Access-Control-Expose-Headers', '*');
      
      if (req.method === 'OPTIONS') {
        console.log('🔄 Handling OPTIONS preflight request');
        return res.status(200).end();
      }
      
      next();
    });

    // Configurar validación global
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // Filtro global de excepciones (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      app.useGlobalFilters(new AllExceptionsFilter());
    }
    
    // Health check endpoint para Render
    app.getHttpAdapter().get('/health', (_req, res) => {
      res.status(200).send('ok');
    });
    
    const port = process.env.PORT || 10000;
    await app.listen(port);
    
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔍 Diagnostic endpoint: http://localhost:${port}/diag`);
    console.log(`🌐 CORS enabled for origins: https://precious-travesseiro-c0f1d0.netlify.app, localhost:3000, localhost:5173`);
    
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();

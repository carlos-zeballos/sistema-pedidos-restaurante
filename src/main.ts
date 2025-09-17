import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // Configurar CORS para permitir el frontend de Netlify
    app.enableCors({
      origin: [
        'https://precious-travesseiro-c0f1d0.netlify.app',
        'https://sistema-pedidos-kurp.netlify.app',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:3001'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma'
      ],
      exposedHeaders: ['Authorization'],
      preflightContinue: false,
      optionsSuccessStatus: 200
    });
    
    // Middleware para logging de requests
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
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

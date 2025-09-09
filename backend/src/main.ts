import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // Configurar CORS más robusto
    app.enableCors({
      origin: function (origin, callback) {
        console.log('🌐 CORS request from origin:', origin);
        
        // Permitir requests sin origin (mobile apps, postman, etc.)
        if (!origin) {
          console.log('✅ CORS: Allowing request without origin');
          return callback(null, true);
        }
        
        const allowedOrigins = [
          'https://precious-travesseiro-c0f1d0.netlify.app',
          'https://vermillion-snickerdoodle-5f1291.netlify.app',
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:3001',
          process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000'
        ];
        
        console.log('🔍 Allowed origins:', allowedOrigins);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
          console.log('✅ CORS: Allowing origin:', origin);
          callback(null, true);
        } else {
          console.log('🚫 CORS: Blocking origin:', origin);
          // En desarrollo, permitir temporalmente para debug
          if (process.env.NODE_ENV !== 'production') {
            console.log('⚠️ CORS: Allowing blocked origin in development mode');
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'), false);
          }
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Accept', 
        'X-Requested-With',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers'
      ],
      exposedHeaders: ['Authorization', 'Access-Control-Allow-Origin'],
      preflightContinue: false,
      optionsSuccessStatus: 200
    });
    
    // Middleware para manejar preflight OPTIONS requests
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
      
      if (req.method === 'OPTIONS') {
        console.log('🔄 Handling OPTIONS preflight request');
        
        const origin = req.headers.origin;
        const allowedOrigins = [
          'https://precious-travesseiro-c0f1d0.netlify.app',
          'https://vermillion-snickerdoodle-5f1291.netlify.app',
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:3001'
        ];
        
        if (origin && allowedOrigins.includes(origin)) {
          res.header('Access-Control-Allow-Origin', origin);
        } else {
          res.header('Access-Control-Allow-Origin', '*');
        }
        
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Max-Age', '86400'); // 24 hours
        res.header('Access-Control-Expose-Headers', 'Authorization, Access-Control-Allow-Origin');
        
        console.log('✅ OPTIONS response headers set');
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
    
    const port = process.env.PORT || 3001;
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

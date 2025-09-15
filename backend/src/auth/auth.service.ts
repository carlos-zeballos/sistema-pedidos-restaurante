import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SupabaseService } from '../lib/supabase.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,          // lo dejamos por compatibilidad aunque no se use
    private jwtService: JwtService,
    private supabaseService: SupabaseService,
  ) {}

  private normalizeUser(u: any) {
    if (!u) return null;
    return {
      id: u.id,
      username: u.username,
      firstName: null,
      lastName: null,
      email: u.email ?? null,
      role: (u.role ?? '').toString(),
      isActive: true,
    };
  }

  async validateUser(identifier: string, password: string): Promise<any> {
    console.log('🔍 AuthService.validateUser - Iniciando validación...');
    console.log(`📤 Identifier: ${identifier}, Password: ${password ? '***' : 'undefined'}`);
    
    // 1) Intento con RPC auth_login (DB-side verificación)
    try {
      console.log('🔄 AuthService.validateUser - Intentando RPC auth_login...');
      const { data, error } = await this.supabaseService
        .getClient()
        .rpc('auth_login', { p_username: identifier, p_password: password });

      if (!error && data && Array.isArray(data) && data.length > 0) {
        console.log('✅ AuthService.validateUser - RPC exitoso');
        return this.normalizeUser(data[0]);
      }
      if (error) {
        // Si es 42703 (columna no existe) seguimos al fallback
        if (error.code !== '42703') {
          console.error('❌ Auth validate error (RPC):', error);
        } else {
          console.log('⚠️ AuthService.validateUser - RPC no disponible, usando fallback');
        }
      }
    } catch (e) {
      console.error('❌ Auth validate exception (RPC):', e);
    }

    // 2) Fallback JS-side: consulta directa + bcryptjs (tolerante a mayúsc/minúsculas)
    try {
      console.log('🔄 AuthService.validateUser - Usando fallback JS-side...');
      const client = this.supabaseService.getClient();

      // Busca por username o email (match exacto; si quieres case-insensitive, duplica intentos con ilike)
      console.log(`🔍 AuthService.validateUser - Buscando usuario: ${identifier}`);
      const { data, error } = await client
        .from('User')
        .select('id, username, email, role, password_hash')
        .or(`username.eq.${identifier},email.eq.${identifier}`)
        .limit(1);

      if (error) {
        console.error('❌ Auth validate error (fallback select):', error);
        return null;
      }

      console.log(`📊 AuthService.validateUser - Resultados de búsqueda: ${data?.length || 0} usuarios`);
      
      const row = data?.[0];
      if (!row) {
        console.log('❌ AuthService.validateUser - Usuario no encontrado');
        return null;
      }

      console.log(`✅ AuthService.validateUser - Usuario encontrado: ${row.username} (${row.role})`);
      console.log(`🔐 AuthService.validateUser - Verificando contraseña...`);

      const ok = await bcrypt.compare(password, row.password_hash);
      if (!ok) {
        console.log('❌ AuthService.validateUser - Contraseña incorrecta');
        return null;
      }

      console.log('✅ AuthService.validateUser - Contraseña correcta');

      // Asumir que todos los usuarios están activos (no hay columna isActive)
      console.log('✅ AuthService.validateUser - Usuario considerado activo');

      console.log('✅ AuthService.validateUser - Usuario validado exitosamente');
      return this.normalizeUser(row);
    } catch (e) {
      console.error('❌ Auth validate exception (fallback):', e);
      return null;
    }
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }
}

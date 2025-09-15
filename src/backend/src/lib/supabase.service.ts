import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      console.log('🔧 SupabaseService - SUPABASE_URL:', supabaseUrl ? 'Presente' : 'Faltante');
      console.log('🔧 SupabaseService - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Presente' : 'Faltante');

      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ SupabaseService - Variables de entorno faltantes');
        throw new Error('Supabase configuration is missing');
      }

      this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
        db: { schema: 'public' },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      console.log('✅ SupabaseService - Cliente creado correctamente');
    } catch (error) {
      console.error('❌ SupabaseService - Error en constructor:', error);
      throw error;
    }
  }

  getClient(): SupabaseClient {
    if (!this.supabase) {
      console.error('❌ SupabaseService - Cliente no inicializado');
      throw new Error('Supabase client not initialized');
    }
    return this.supabase;
  }
}

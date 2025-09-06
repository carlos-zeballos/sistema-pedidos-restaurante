import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../lib/supabase.service';

@Injectable()
export class DiagService {
  constructor(private readonly supabase: SupabaseService) {}

  private async check(table: string, columns: string) {
    const sb = this.supabase.getClient();
    const { data, error } = await sb.from(table).select(columns).limit(1);
    return {
      table,
      columns,
      ok: !error,
      count: data?.length ?? 0,
      error: error
        ? {
            code: (error as any).code ?? null,
            message: error.message,
            details: (error as any).details ?? null,
            hint: (error as any).hint ?? null,
          }
        : null,
    };
  }

  runAll() {
    // Ajusta columnas CRÍTICAS que suelen romper por nombres
    return Promise.all([
      this.check('Category', 'id, name, "isActive", ord, "updatedAt"'),
      this.check('Product',  'id, code, name, price, type, "categoryId", "preparationTime", "isEnabled", "isAvailable", "updatedAt"'),
      this.check('Space',    'id, code, name, type, capacity, status, "isActive", "updatedAt"'),
      this.check('Combo',    'id, code, name, "basePrice", "isEnabled", "isAvailable", "categoryId", "updatedAt"'),
      this.check('ComboComponent', 'id, "comboId", name, type, price, "isRequired", "isAvailable", "maxSelections", ord'),
    ]);
  }
}






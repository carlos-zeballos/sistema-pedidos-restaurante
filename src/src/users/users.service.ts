import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../lib/supabase.service';

export interface User {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: 'ADMIN' | 'MOZO' | 'COCINERO' | 'CAJA' | 'BARRA';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  async findOne(username: string): Promise<User | null> {
    const { data, error } = await this.supabaseService.getClient()
      .from('User')
      .select('*')
      .eq('username', username)
      .eq('isActive', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data as User;
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabaseService.getClient()
      .from('User')
      .select('*')
      .eq('id', id)
      .eq('isActive', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data as User;
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await this.supabaseService.getClient()
      .from('User')
      .select('*')
      .eq('isActive', true)
      .order('firstName', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data as User[];
  }

  async createUser(data: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    role: 'ADMIN' | 'MOZO' | 'COCINERO' | 'CAJA' | 'BARRA';
  }): Promise<User> {
    const { data: newUser, error } = await this.supabaseService.getClient()
      .from('User')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }

    return newUser as User;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const { data: updatedUser, error } = await this.supabaseService.getClient()
      .from('User')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }

    return updatedUser as User;
  }

  async deleteUser(id: string): Promise<User> {
    return this.updateUser(id, { isActive: false });
  }
}



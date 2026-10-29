// Composição das dependências: o resto do app usa apenas as interfaces.
import { supabase } from '@/config/supabase';
import { AdminSentimentoService } from './AdminSentimentoService';
import { AuthService } from './AuthService';
import type { IAdminSentimentoService } from './interfaces/IAdminSentimentoService';
import type { IAuthService } from './interfaces/IAuthService';
import type { ILogService } from './interfaces/ILogService';
import type { ISentimentoService } from './interfaces/ISentimentoService';
import type { IStorageService } from './interfaces/IStorageService';
import type { ITemaService } from './interfaces/ITemaService';
import { LogService } from './LogService';
import { SentimentoService } from './SentimentoService';
import { StorageService } from './StorageService';
import { TemaLocalService } from './TemaLocalService';

export const storageService: IStorageService = new StorageService(supabase);
export const sentimentoService: ISentimentoService = new SentimentoService(supabase);
export const adminSentimentoService: IAdminSentimentoService = new AdminSentimentoService(supabase);
export const logService: ILogService = new LogService(supabase);
export const authService: IAuthService = new AuthService(supabase);
export const temaService: ITemaService = new TemaLocalService();

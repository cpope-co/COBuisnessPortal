import { HttpContextToken } from '@angular/common/http';

export const SKIP_AUTH_KEY = new HttpContextToken<boolean>(() => false);
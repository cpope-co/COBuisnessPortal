import { HttpContextToken } from '@angular/common/http';

export const SKIP_AUTH_KEY = new HttpContextToken<boolean>(() => false);
export const SKIP_REFRESH_KEY = new HttpContextToken<boolean>(() => false);
import { InjectionToken } from '@angular/core';
import type { Response } from 'express';

export const SERVER_RESPONSE = new InjectionToken<Response | null>('SERVER_RESPONSE');

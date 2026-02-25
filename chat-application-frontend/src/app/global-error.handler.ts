import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.group('🔥 Angular Global Error');
    console.error(error);
    console.trace();
    console.groupEnd();
  }
}
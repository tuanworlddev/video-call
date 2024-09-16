import { HttpInterceptorFn } from '@angular/common/http';

export const ngrokInterceptor: HttpInterceptorFn = (req, next) => {
  const newReq = req.clone({
    headers: req.headers.set('ngrok-skip-browser-warning', 'true')
  });
  return next(newReq);
};

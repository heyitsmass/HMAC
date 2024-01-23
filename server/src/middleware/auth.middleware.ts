import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const { authorization } = req.headers;

    if (authorization) {
      if (
        !authorization.match(
          /^(?:Bearer (?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?)$/g,
          '',
        )
      ) {
        return res.status(401).send({
          message: 'Invalid authorization header',
        });
      }

      res.setHeader('x-signature', authorization.split(' ')[1]).status(200);
      return next();
    }

    return res.status(401).send({
      message: 'Missing authorization header',
    });
  }
}

import { JwtPayload } from "../path-to-your-payload"; // Fix the path

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

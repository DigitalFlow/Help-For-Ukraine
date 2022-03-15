import { Request, Response } from "express";
import { pool } from "./DbConnection.js";
import { DbUser } from "../model/DbUser.js";

export function IsAuthenticated(req: Request, res: Response, next: Function) {
    if (!req.user) {
      return res.sendStatus(401);
    }

    return next();
}

export const IsAdmin = async (req: Request) => {
  if (!req.user) {
    return false;
  }

  return pool.query(`SELECT is_admin FROM help_for_ukraine.user WHERE id = '${ req.user }'`)
  .then(result => {
    if (result.rowCount < 1) {
      return false;
    }

    const user = result.rows[0] as DbUser;

    return !!user.is_admin;
  });
};

export function EnsureAdmin(req: Request, res: Response, next: Function) {
  IsAdmin(req)
  .then((isUserAdmin) => {
    if (!isUserAdmin) {
      return res.sendStatus(403);
    }
    else {
      return next();
    }
  })
  .catch(err => {
    return res.sendStatus(403);
  });
}
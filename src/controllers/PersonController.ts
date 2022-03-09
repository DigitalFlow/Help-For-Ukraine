import { Request, Response, NextFunction } from "express";
import ValidationResult from "../model/ValidationResult.js";
import { pool } from "../domain/DbConnection.js";
import { DbPerson } from "../model/DbPerson.js";

export const getPersons = (req: Request, res: Response) => {
  const count = req.query.count;

  pool.query(`SELECT * from help_for_ukraine.person ORDER BY created_on DESC ${ count ? `LIMIT $1` : "" };`, count ? [count] : [])
  .then(result => {
    res.json(result.rows);
  })
  .catch(err => {
    res.status(500).send(err.message);
  });
};

const findPersonById = (id: string) => pool.query("SELECT * from help_for_ukraine.person WHERE id=$1;", [id]);

export const getPerson = (req: Request, res: Response) => {
  const id = req.params.id;

  findPersonById(id)
  .then(result => {
    res.json(result.rows);
  })
  .catch(err => {
    res.status(500).send(err.message);
  });
};

export const deletePerson = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const persons = await findPersonById(id);

    if (persons.rows.length < 1) {
      return res.sendStatus(404);
    }

    const person = persons.rows[0];

    if (person.user_id !== req.user) {
      return res.sendStatus(403);
    }

    const result = await pool.query("DELETE from help_for_ukraine.person WHERE id=$1;", [id]);
    return res.sendStatus(200);
  }
  catch (e) {
    res.status(500).send(e.message);
  }
};

export const upsertPerson = async (req: Request, res: Response) => {
  const id = req.params.id;
  const payload = req.body as DbPerson;

  if (!payload) {
    return res.sendStatus(400);
  }

  try {
    const personQuery = await findPersonById(id);

    if (personQuery.rows.length > 0) {
      const person = personQuery.rows[0] as DbPerson;

      if (person.user_id !== req.user) {
        return res.sendStatus(403);
      }
    }

    // user_id can be set initially, but no update possible
    const query = ["INSERT INTO help_for_ukraine.person(id, first_name, last_name, city, description, question, user_id)",
                "VALUES ($1, $2, $3, $4, $5, $6, $7)",
                "ON CONFLICT(id) DO",
                "UPDATE SET first_name=$2, last_name=$3, city=$4, description=$5, question=$6",
                "WHERE help_for_ukraine.person.id=$1;"]
                .join("\n");

    const values = [id, payload.first_name, payload.last_name, payload.city, payload.description, payload.question, req.user];

    pool.query(query, values)
    .then(result => {
      res.sendStatus(200);
    })
    .catch(err => {
      res.status(500).send(err.message);
    });
  }
  catch (e) {
    res.status(500).send(e.message);
  }
};

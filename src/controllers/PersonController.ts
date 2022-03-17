import { Request, Response, NextFunction } from "express";
import ValidationResult from "../model/ValidationResult.js";
import { pool } from "../domain/DbConnection.js";
import { DbPerson } from "../model/DbPerson.js";
import CryptoJS from "crypto-js";
import { DbPersonSecret } from "../model/DbPersonSecret.js";
import { IsAdmin } from "../domain/AuthRestrictions.js";

const getPersonsBase = (req: Request, res: Response, approved: boolean) => {
  const count = req.query.count;
  const [query, params] = approved
    ? [`SELECT * from help_for_ukraine.person WHERE approved = true OR user_id = $1 ORDER BY created_on DESC ${ count ? `LIMIT $2` : "" };`, count ? [req.user, count] : [req.user] ]
    : [`SELECT * from help_for_ukraine.person WHERE approved <> true AND user_id = $1 ORDER BY created_on DESC ${ count ? `LIMIT $2` : "" };`, count ? [req.user, count] : [req.user] ];

  pool.query(query, params)
  .then(result => {
    res.json(result.rows);
  })
  .catch(err => {
    res.status(500).send(err.message);
  });
};

export const getPersons = (req: Request, res: Response) => getPersonsBase(req, res, true);

export const getUnapprovedPersons = (req: Request, res: Response) => getPersonsBase(req, res, false);

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
      if (!IsAdmin(req)) {
        return res.sendStatus(403);
      }
    }

    const result = await pool.query("DELETE from help_for_ukraine.person WHERE id=$1;", [id]);
    return res.sendStatus(200);
  }
  catch (e) {
    res.status(500).send(e.message);
  }
};

export const publishPerson = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const persons = await findPersonById(id);

    if (persons.rows.length < 1) {
      return res.sendStatus(404);
    }

    await pool.query("UPDATE help_for_ukraine.person SET approved=$2 WHERE id=$1;", [id, true]);
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

    if (payload.secret_answer && payload.secret_answer.length < 4) {
      return res.sendStatus(400);
    }

    // user_id can be set initially, but no update possible
    const query = ["INSERT INTO help_for_ukraine.person(id, first_name, last_name, city, description, question, approved, user_id)",
                "VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                "ON CONFLICT(id) DO",
                "UPDATE SET first_name=$2, last_name=$3, city=$4, description=$5, question=$6, approved=$7",
                "WHERE help_for_ukraine.person.id=$1;"]
                .join("\n");

    const values = [id, payload.first_name, payload.last_name, payload.city, payload.description, payload.question, false, req.user];

    await pool.query(query, values);

    if (payload.contact_information && payload.secret_answer) {
      // Passphrase automatically uses AES-256. We store it all lower case for making it easier for the family. There will be rate limiting and the secret is never exposed, so this should be fine.
      const secret = payload.contact_information;
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify({ secret }), payload.secret_answer.toLocaleLowerCase()).toString();

      const secretQuery = [
        "INSERT INTO help_for_ukraine.personsecret(person_id, secret)",
        "VALUES ($1, $2)",
        "ON CONFLICT(person_id) DO",
        "UPDATE SET secret=$2",
        "WHERE help_for_ukraine.personsecret.person_id=$1;"
      ].join("\n");

      await pool.query(secretQuery, [id, encrypted ]);
    }

    res.sendStatus(200);
  }
  catch (e) {
    res.status(500).send(e.message);
  }
};

export const answerSecret = async (req: Request, res: Response) => {
  const id = req.params.id;
  const payload = req.body as DbPerson;

  try {
    const personSecrets = await pool.query("SELECT * FROM help_for_ukraine.personsecret WHERE person_id=$1", [ id ]);

    if (personSecrets.rows.length < 1) {
      return res.sendStatus(404);
    }

    const personSecret = personSecrets.rows[0] as DbPersonSecret;
    const encrypted = personSecret.secret;

    const result = CryptoJS.AES.decrypt(encrypted, payload.secret_answer.toLocaleLowerCase()).toString(CryptoJS.enc.Utf8);

    if (!result) {
      return res.sendStatus(400);
    }

    const decrypted = JSON.parse(result);
    return res.status(200).send({ contact_information: decrypted.secret } as DbPerson);
  }
  catch (e) {
    res.status(400).send(e.message);
  }
};
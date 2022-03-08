import express from "express";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as dotenv from "dotenv";
import * as path from "path";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import helmet from "helmet";

// Load environment variables
dotenv.config({ path: ".env.config" });

// No d.ts yet
const vhost = require("vhost");

// Controllers
import * as userController from "./controllers/UserController";
import * as homeController from "./controllers/HomeController";
import * as postController from "./controllers/PostController";
import * as personController from "./controllers/PersonController";

// Load authenticator
import { Authentication } from "./domain/Authentication";
import { IsAuthenticated, IsAdmin } from "./domain/AuthRestrictions";

// Connect to MySQL
import { pool, sequelize, User } from "./domain/DbConnection";

console.log("Authenticating sequelize");

sequelize.authenticate({ logging: true })
  .then(() => {
    console.log("Creating scheme using sequelize");
    return sequelize.createSchema("help_for_ukraine", { logging: true });
  })
  .then(() => {
    console.log("Ensuring pgcrypto");
    return pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
  })
  .then(() => {
    console.log("Scheme created");
    return sequelize.sync({ logging: true });
  })
  .then(() => {
    console.log("Scheme synced");
    return pool.query("set schema 'help_for_ukraine'");
  })
  .then(() => {
    console.log("Connected to database");
    return pool.query("SELECT id from help_for_ukraine.user WHERE id = 'f39f13b4-b8c6-4013-ace6-087a45dbd23d'");
  })
  .then((result) => {
    if (result.rows.length) {
      console.log("Admin user is existing");
      return;
    }
    else {
      console.log("Admin user is missing, creating it");
      return pool.query("INSERT INTO help_for_ukraine.user (id, user_name, email, is_admin, password_hash) VALUES ('f39f13b4-b8c6-4013-ace6-087a45dbd23d', 'root', 'root@local.domain', true, '$2a$10$covQWp6GhzWOIik3T6oiveFVnIxTVG7X1c9ziHRM3jTiEFPT0cjd2')");
    }
  })
  .then((result) => {
    if (result) {
      console.log("Admin user created successfully");
    }
  })
  .catch(err => {
    console.log("Database connection error. Please make sure the database is running and your config in .env.config is correct. Error: " + err.message);
    process.exit();
  });

// Connect to MySql
process.on("SIGINT", function() {
  console.log("Closing database connection");

  pool.end()
  .then(() => {
    console.log("Successfully terminated pool");
    process.exit();
  })
  .catch(err => {
      console.log("Failed closing pool, doing a force exit");
      process.exit();
  });
});

/**
 * Create Express server.
 */
const app = express();

app.enable("trust proxy");
app.use(helmet());
app.use(cookieParser());
app.use(Authentication);
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

/**
 * Express configuration.
 */
app.set("port", process.env.PORT || 80);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use((request, response, next) => {
  if (process.env.NODE_ENV !== "development" && !request.secure) {
    return response.redirect(`https://${request.headers.host}${request.url}`);
  }

  next();
});

app.use(express.static(path.resolve(__dirname, "..", "dist")));

/**
 * Primary app routes.
 */
app.post("/login", userController.postLogin);
app.post("/logout", userController.postLogout);
app.get("/retrieveProfile/:id", IsAdmin, userController.getProfile);
app.get("/retrieveProfile", IsAuthenticated, userController.getProfile);
app.get("/userList", IsAdmin, userController.getUserList);
app.post("/profile/:id", IsAdmin, userController.postProfile);
app.post("/profile", IsAuthenticated, userController.postProfile);
app.post("/signup", userController.postSignup);

app.get("/posts", IsAuthenticated, postController.getPosts);
app.get("/posts/:id", IsAuthenticated, postController.getPost);
app.post("/posts/:id", IsAdmin, postController.upsertPost);
app.delete("/posts/:id", IsAdmin, postController.deletePost);

app.get("/persons", IsAuthenticated, personController.getPersons);
app.get("/persons/:id", IsAuthenticated, personController.getPerson);
app.post("/persons/:id", IsAuthenticated, personController.upsertPerson);
app.delete("/persons/:id", IsAuthenticated, personController.deletePerson);

// Always return the main index.html, so react-router renders the route in the client
app.get("*", homeController.getAll);

const port = process.env.PORT || 8080;
const server = http.createServer(app);

server.listen(port);
console.log("Server running at http://localhost:%d", port);

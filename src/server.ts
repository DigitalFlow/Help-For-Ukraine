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

const dbVersion = 0.1;

// Load environment variables
dotenv.config({ path: ".env.config" });

// Controllers
import * as userController from "./controllers/UserController";
import * as homeController from "./controllers/HomeController";
import * as postController from "./controllers/PostController";
import * as personController from "./controllers/PersonController";

// Load authenticator
import { Authentication } from "./domain/Authentication";
import { IsAuthenticated, EnsureAdmin } from "./domain/AuthRestrictions";

// Connect to MySQL
import { pool, sequelize, User } from "./domain/DbConnection";
import rateLimit from "express-rate-limit";
import { runMigrations } from "./domain/DbMigration";

console.log("Authenticating sequelize");

sequelize.authenticate({ logging: true })
  .then(() => {
    console.log("Creating scheme using sequelize");
    return sequelize.createSchema("help_for_ukraine", { logging: true });
  })
  .then(() => {
    console.log("Scheme synced");
    return pool.query("set schema 'help_for_ukraine'");
  })
  .then(() => {
    console.log("Ensuring pgcrypto");
    return pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
  })
  .then(() => {
    console.log("Scheme created");
    return sequelize.sync({ logging: true });
  })
  .then(() => runMigrations(dbVersion))
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

const secretLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 2, // Limit each user to 2 requests per minute per person listing
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers,
  keyGenerator: (req, res) => `${req.user}_${req.params.id}`,
  skipSuccessfulRequests: true,
  skipFailedRequests: false
});

const personLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each user to 5 profiles per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers,
  keyGenerator: (req, res) => req.user,
  skipSuccessfulRequests: false,
  skipFailedRequests: true
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each user to 60 requests per minute
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

const signUpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1, // Limit each ip to one sign up per 5 minutes
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers,
  skipSuccessfulRequests: false,
  skipFailedRequests: true
});

app.use(apiLimiter);

/**
 * Primary app routes.
 */
app.post("/login", userController.postLogin);
app.post("/logout", userController.postLogout);
app.get("/retrieveProfile/:id", EnsureAdmin, userController.getProfile);
app.get("/retrieveProfile", IsAuthenticated, userController.getProfile);
app.get("/userList", EnsureAdmin, userController.getUserList);
app.post("/profile/:id", EnsureAdmin, userController.postProfile);
app.post("/profile", IsAuthenticated, userController.postProfile);
app.post("/signup", signUpLimiter, userController.postSignup);

app.get("/posts", postController.getPosts);
app.get("/posts/:id", postController.getPost);
app.post("/posts/:id", EnsureAdmin, postController.upsertPost);
app.delete("/posts/:id", EnsureAdmin, postController.deletePost);

app.get("/persons", personController.getPersons);
app.get("/persons/unapproved", EnsureAdmin, personController.getUnapprovedPersons);
app.get("/persons/:id", personController.getPerson);
app.post("/publishPerson/:id", EnsureAdmin, personController.publishPerson);
app.post("/persons/:id", IsAuthenticated, personLimiter, personController.upsertPerson);
app.post("/personsecret/:id", IsAuthenticated, secretLimiter, personController.answerSecret);
app.delete("/persons/:id", IsAuthenticated, personController.deletePerson);

// Always return the main index.html, so react-router renders the route in the client
app.get("*", homeController.getAll);

const port = process.env.PORT || 8080;
const server = http.createServer(app);

server.listen(port);
console.log("Server running at http://localhost:%d", port);

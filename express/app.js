const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");
const cookieSession = require("cookie-session");

// Express
const app = express();

const port = 3000;

// Mongo
mongoose.connect("mongodb://localhost:27017/make-it-real", {
  useNewUrlParser: true,
});

mongoose.connection.on("error", (error) => console.error(error));

mongoose.connection.once("open", () => console.log("Mongoose connected"));

const UserSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

UserSchema.statics.authenticate = async function (email, password) {
  const user = await UserModel.findOne({ email });

  if (user) {
    const passwordMatch = await bcrypt.compare(password, user.password);

    return passwordMatch ? user : false;
  }

  return false;
};

const UserModel = mongoose.model("User", UserSchema);

// Routes

const requireUser = async (request, response, next) => {
  const { userId } = request.session;

  if (userId) {
    const user = await UserModel.findById(userId);

    request.user = user;
    next();
  } else {
    response.redirect("/login");
  }
};

const loggedIn = (request, response, next) => {
  const { userId } = request.session;
  const { path } = request;
  const paths = ["/", "/logout"];

  if (!paths.includes(path) && userId) {
    response.redirect("/");
  } else {
    next();
  }
};

const logger = (request, response, next) => {
  console.log(`Request to ${request.path}`);
  next();
};

app.use(logger);

app.use(
  cookieSession({
    secret: "make-it-real",
    maxAge: 5 * 60 * 1000,
  })
);

app.use(express.urlencoded({ extended: true }));

app.use("/", loggedIn, express.static(path.join(__dirname, "public")));

app.post("/login", loggedIn, async (request, response) => {
  const { email, password } = request.body;

  const user = await UserModel.authenticate(email, password);

  if (user) {
    request.session.userId = user._id;
    response.redirect("/");
  } else {
    response.redirect("/login");
  }
});

app.get("/logout", (request, response) => {
  request.session.userId = null;

  response.redirect("/");
});

app.post("/register", async (request, response) => {
  const { name, email, password } = request.body;

  const user = new UserModel({
    name,
    email,
    password: await bcrypt.hash(password, 10),
  });

  user.save(async (error) => {
    if (error) {
      console.error(error);
      return;
    }

    const userData = await UserModel.authenticate(email, password);

    if (user) {
      request.session.userId = userData._id;
    }

    response.redirect("/");
  });
});

app.get("/", requireUser, async (request, response) => {
  const users = await UserModel.find({});
  const { user } = request;

  const message = `Hola ${user.name}`;

  const table = `
    ${
      request.session.userId
        ? `<a href="/logout">Logout</a>`
        : `<a href="/login">Login</a><a href="/register">Register</a>`
    }
    ${message}
    <table>
      <thead>
        <th>Name</th>
        <th>Email</th>
      </thead>
      <tbody>
        ${users
          .map((user) => {
            return `<tr><td>${user.name}</td><td>${user.email}</td>`;
          })
          .join("")}
      </tbody>
    </table>
  `;

  response.send(table);
});

app.listen(port, () => console.log(`Server listening on port ${port}`));

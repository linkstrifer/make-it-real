const express = require("express");
const path = require("path");
const cookieSession = require("cookie-session");

// Express
const app = express();

const port = 3000;

const { loginPost, register, root, logout } = require("./Routes.js");

const { UserModel } = require("./mongoose/index.js");

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

app.post("/login", loggedIn, loginPost);

app.get("/logout", logout);

app.post("/register", register);

app.get("/", root);

app.listen(port, () => console.log(`Server listening on port ${port}`));

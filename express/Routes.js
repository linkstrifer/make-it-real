const { UserModel } = require("./mongoose");

const loginPost = async (request, response) => {
  const { email, password } = request.body;

  const user = await UserModel.authenticate(email, password);

  if (user) {
    request.session.userId = user._id;
    response.redirect("/");
  } else {
    response.redirect("/login");
  }
};

const logout = (request, response) => {
  request.session.userId = null;

  response.redirect("/");
};

const register = async (request, response) => {
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
};

const root = async (request, response) => {
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
};

module.exports = {
  loginPost,
  logout,
  register,
  root,
};

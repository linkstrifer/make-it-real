const bcrypt = require("bcrypt");

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
  const users = await UserModel.find({}, "name email");

  response.json(users);
};

module.exports = {
  loginPost,
  logout,
  register,
  root,
};

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

mongoose.connect(
  process.env.MONGO_URL || "mongodb://localhost:27017/make-it-real",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

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

module.exports = {
  UserModel,
};

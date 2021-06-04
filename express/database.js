const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/make-it-real", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("error", (error) => console.log(error));

mongoose.connection.once("open", () => console.log("Mongoose connected"));

const bookSchema = mongoose.Schema({
  name: String,
  author: String,
  publicationDate: String,
  available: { type: Boolean, default: false },
});

const BookModel = mongoose.model("Book", bookSchema);

const firstBook = new BookModel({
  name: "Harry Potter",
  author: "No me acuerdo",
  publicationDate: "2021-05-25",
  available: true,
});

firstBook.save((error) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log("Document created");
});

BookModel.create(
  {
    name: "Otro de Harry",
    author: "Tampoco me acuerdo",
  },
  (error) => {
    if (error) {
      console.log(error);
      return;
    }

    console.log("Document created");
  }
);

const express = require("express");
const path = require("path");

// Express
const app = express();

const port = process.env.PORT || 3000;

app.get("/", (request, response) => {
  response.send("hola");
});

app.listen(port, () => console.log(`Server listening on port ${port}`));

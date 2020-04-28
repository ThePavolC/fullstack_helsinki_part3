const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

/**
 * Middleware
 */

app.use(express.json());
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      req.body ? JSON.stringify(req.body) : "{}",
    ].join(" ");
  })
);
app.use(cors());
app.use(express.static("build"));

/**
 * ID generator
 */

const getRandomId = () => {
  const MAX = 999999;
  const MIN = 1;
  const tempRandomInt = Math.floor(Math.random() * (MAX - MIN)) + MIN;
  const existingIds = persons.map((p) => p.id);
  if (existingIds.includes(tempRandomInt)) {
    return getRandomId();
  }
  return tempRandomInt;
};

/**
 * DB
 */

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
];

/**
 * API
 */

app.get("/", (req, res) => {
  res.send("<h1>Part 3</h1><div><a href='/api/persons'>/api/persons</a></div>");
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((p) => p.id === id);
  if (person) {
    return res.json(person);
  } else {
    return res.status(404).end();
  }
});

app.get("/info", (req, res) => {
  const time = new Date();
  res.send(
    `<div>Phonebook has info for ${persons.length} people</div><div>${time}</div>`
  );
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((p) => p.id !== id);
  res.status(204).end();
});

app.post("/api/persons/", (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({ error: "missing data" });
  }

  const doesNameExist = Boolean(persons.find((p) => p.name === body.name));
  if (doesNameExist) {
    return res.status(400).json({ error: "name must be unique" });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: getRandomId(),
  };

  persons = persons.concat(person);
  res.json(person);
});

/**
 * Port settings
 */

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

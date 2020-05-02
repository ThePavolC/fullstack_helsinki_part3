const mongoose = require("mongoose");
const DB_NAME = "phonebook";

if (process.argv.length < 3) {
  process.exit(1);
}

const [_node, _script, password, name, number] = process.argv;

const connectToDB = (password, DB_NAME) => {
  const url = `mongodb+srv://fullstack:${password}@cluster0-jtsmv.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const definePersonModel = () => {
  const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  });

  return mongoose.model("Person", personSchema);
};

const addNewPerson = (personModel, name, number) => {
  const person = new personModel({
    name,
    number,
  });
  person.save().then((result) => {
    console.log(`added ${name} number ${number} to ${DB_NAME}`);
    mongoose.connection.close();
  });
};

const getAllPersonRecords = (personModel) => {
  personModel.find({}).then((result) => {
    console.log("Phonebook:");
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
};

connectToDB(password, DB_NAME);
const Person = definePersonModel();

if (process.argv.length === 3) {
  getAllPersonRecords(Person);
} else if (process.argv.length === 5 && name && number) {
  addNewPerson(Person, name, number);
} else {
  console.log("Invalid number of argument.");
  mongoose.connection.close();
}

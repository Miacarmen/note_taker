// Require Dependencies
const express = require("express");
const fs = require("fs");
const path = require("path");
// helper to generate unique ids
const { uuid } = require("uuidv4");
var dbData = require("./db/db.json");

// Set up Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// sets up Express to handle data parsing
app.use(express.urlencoded({ extended: true }));
// recognizes the incoming Request Object as a JSON object
app.use(express.json());
// static middelware to serve assets in public folder
app.use(express.static("public"));

// HTML Routes
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/notes.html"));
});

// Route to index.html
app.get("/index", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

// API Routes

// GET route to return ALL saved notes as JSON
app.get("/api/notes", (req, res) => {
  console.info(`${req.method} request received for notes`);
  // read/parse the db.json file
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(JSON.parse(data));
    }
  });
});

// POST Route to receive /api/notes and save it on the request body
app.post("/api/notes", (req, res) => {
  console.info(`${req.method} request received to add a note`);
  console.log(req.body);
  // const data = JSON.parse(notes);
  // save a new note on the request body
  const { title, text } = req.body;
  // if required properties are present
  if (title && text) {
    const newNote = {
      title,
      text,
      // give each note a unique id
      id: uuid(),
    };

    fs.readFile("./db/db.json", "utf8", (err, data) => {
      if (err) {
        console.log(err);
      } else {
        const parsedNotes = JSON.parse(data);
        parsedNotes.push(newNote);
        dbData = parsedNotes;

        fs.writeFile(
          "./db/db.json",
          JSON.stringify(parsedNotes, null, 4),
          (writeErr) => {
            writeErr
              ? console.error(writeErr)
              : console.info("Successfully updated in notes");
          }
        );
      }
    });

    const response = {
      body: newNote,
    };

    console.log(response);
    res.json(response);
  } else {
    res.json("Error in creating new note");
  }
});

// add a DELETE route
// DELETE /api/notes/:id should receive a query parameter that contains the unique id of a note to delete
app.delete("/api/notes/:id", (req, res) => {
    console.info(`${req.method} request received for notes`);
    // remove the note with the given id property
    let noteId = req.params.id;
    console.log(noteId);
  // read all notes from the db.json file
    fs.readFile('./db/db.json', "utf8", (err, data) => {
      if(err) {
        console.log(err);
      } else {
        let noteData = JSON.parse(data);
        for(let i = 0; i < noteData.length; i++) {
          if(noteId == noteData[i].id) {
            noteData.splice(i, 1);
            // rewrite the notes to the db.json file
            fs.writeFile("./db/db.json", JSON.stringify(noteData, null, 4), (err) => {
              if(err) {
                console.log(err);
              } else {
                console.log("Note has been deleted");
              }
            });
          };
        };
      };
    });
    res.end();
});


// Fallback route if user attempts to visit routes that don't exsist
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

// Listener
app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
});

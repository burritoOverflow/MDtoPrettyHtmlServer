const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
app.use(express.static("public"));

const zipFile = __dirname + "/output.zip";
const outputDir = "output";
const inputDir = __dirname + "/input";

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./input");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const deleteFiles = fileArr => {
  fileArr.forEach(filename => {
    fs.unlinkSync(filename);
  });
};

const deleteDirRecursive = path => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDirRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/html/index.html");
});

app.post("/upload", upload.single("upl"), (req, res) => {
  try {
    exec(
      "generate-md --layout github --input ./input --output ./output && zip -r output.zip output",
      (err, stdout) => {
        if (err) {
          console.error(err);
          res.sendStatus(500);
        } else {
          console.log(`${stdout}`);
          res.sendFile(zipFile, err => {
            if (err) {
              res.send("Error");
            } else {
              deleteFiles([__dirname + "/input/index.md", "output.zip"]);
              deleteDirRecursive(outputDir);
            }
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.listen(9000, () => {
  if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir);
  }
});

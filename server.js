var http = require("http");
var formidable = require("formidable");
var fs = require("fs");
var path = require("path");

const port = process.env.port || 1337;

http
  .createServer(function(req, res) {
    if (req.url == "/fileupload" && req.method == "POST") {
      const form = new formidable.IncomingForm();
      form.parse(req, function(err, fields, files) {
        try {
          const oldpath = files.filetoupload.path;
          const downloadFolder = "downloads";
          const downloadPath = path.resolve(__dirname, downloadFolder);
          const timestamp = new Date()
            .toJSON()
            .split(".")[0]
            .replace(/:/g, "-");
          const newpath = path.resolve(
            downloadPath,
            timestamp + "_" + files.filetoupload.name
          );

          if (!fs.existsSync(downloadPath)) {
            fs.mkdirSync(downloadPath);
          }

          fs.createReadStream(oldpath).pipe(fs.createWriteStream(newpath));
          res.writeHead(200, { "Content-Type": "text/html" });
          let content = getContent(`
          File uploaded and copied!<br>
          <a href="/">New Upload</a>
          `);
          res.write(content);
          res.end();
        } catch (e) {
          res.write("" + e);
          res.end();
        }
      });
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      let content = getContent(`
    <form action="fileupload" method="post" enctype="multipart/form-data">
      <input type="file" name="filetoupload"><br>
      <input type="submit">
    </form>`);

      res.write(content);
      return res.end();
    }
  })
  .listen(port);

function getContent(bodyContent) {
  var template = fs.readFileSync(path.resolve(__dirname, "template.html"), {
    encoding: "utf8"
  });
  return template.replace("{{BODY_CONTENT}}", bodyContent);
}

import multer from "multer";

// store files temporarily in "uploads/" folder
// const upload = multer({ dest: "uploads/" });
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/temp"); // store files in "./public/temp" folder temporary
    },
    filename: (req, file, cb) => {
      // custom filename -> originalname + timestamp
      const uniqueName = Date.now() + "-" + file.originalname;
      cb(null, uniqueName);
    },
  });
  // insterd of null u can write ERROR object
  // Multer middleware
export const upload = multer(
    {storage}
);
//? cb stands for callback function.
// Multer calls it when it needs to know:
// Where to store the file (destination)
// What to name the file (filename)
// Think of it like:
// 👉 “Hey developer, I’ve got a file — tell me (via cb) where and what name to save it with.

//?data will come from below form.....
 /* <form action="/upload" method="post" enctype="multipart/form-data">
  <input type="file" name="image" />
  <button type="submit">Upload</button>
</form> */ 
// field image will 


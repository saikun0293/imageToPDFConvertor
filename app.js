//IMPORTS
const express=require("express");
const app=express();
const fs = require("fs"); //to read and create files
const multer = require("multer"); //uploading files to server
const {TesseractWorker} = require("tesseract.js"); //For reading the images
const worker = new TesseractWorker();

//STORAGE
//gets called whenever we upload a file
const storage = multer.diskStorage({
    destination: (req,res,cb)=>{
        cb(null,"./uploads");
    },
    filename: (req,file,cb)=>{
        cb(null,file.originalname);//keeps in the original name of the file passed in as args
    }
});

//specifying storage so that it runs above function
//single accepts a single file with the name fieldName
const upload = multer({storage:storage}).single("avatar");


app.set("view engine","ejs");
app.use(express.static("public"));

app.get("/",(req,res)=>{
    res.render("index");
})

app.post("/upload",(req,res)=>{
    upload(req,res,err=>{ //req,res,cb with arg err
        //console.log(req.file);
        fs.readFile(`./uploads/${req.file.originalname}`,(err,data)=>{
            if(err){console.log(err);}

            worker
            .recognize(data,"eng",{tessjs_create_pdf:'1'})//third arg is to get some data from pdf converted from image
            .progress(progress=>{
                console.log(progress);//if everything is working and current process state
            })
            .then(result=>{
                //res.send(result.text);//to send the text directly else to create pdf we do
                res.redirect("/download");
            })
            .finally(()=>{
                worker.terminate()
            });//good practice
        })
    })
})

app.get("/download",(req,res)=>{
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
})
const PORT = 5000 || process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Server is running successfully on port ${PORT}`)
})
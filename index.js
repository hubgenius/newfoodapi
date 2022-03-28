const express=require('express')
const  port = process.env.port || 8000;
const app=express();
const router = express.Router();
const  morgan = require("morgan");
const cors=require("cors")
const bodyParser = require('body-parser');
const appRoutes = require("./route/api")(router);
app.use('/upload',express.static('uploads'));

const mongoose = require('mongoose')
const DB ="mongodb+srv://mern:kju5566@cluster0.ql0e8.mongodb.net/genius?retryWrites=true&w=majority";
mongoose.connect(DB)
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false}));

app.use('/',appRoutes);

app.get('/', (req, res) => {
    res.send("Working");
})

app.listen(port,()=>console.log("succsessfull"));
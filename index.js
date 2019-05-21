
const tf = require('@tensorflow/tfjs'),
Promise = require("bluebird");
//require('@tensorflow/tfjs-node')
Jimp = require('jimp');
multer=require("multer")

upload=multer({
	dest:"uploads",
	fileFilter:(req,file,cb)=>{
		if(file.mimetype.startsWith("image/")){
			cb(null,true)
		}else{
			req.__err=true;
			cb(null,false)
		}
	}
})

console.log(process.env.HEROKU_URL)
const express=require("express"),
formidable = require('formidable')
;
// Load the binding (CPU computation)
var model=null;
var app=express();
app.use(express.static("statics"));
var port= process.env.PORT || 5000;
var url=process.env.HEROKU_URL || "http://127.0.0.1:"+port+"/"

const labels=["Daisy","Dandelion","Rose","Sunflower","Tulip"];

app.all("/classify",(req,res,next)=>{
	res.header("Access-Control-Allow-Methods","POST")
   res.header("Access-Control-Allow-Origin", '*');
	next()
})
app.post("/form",(req,res)=>{
	try{
		new formidable.IncomingForm().parse(req)
		.on("file",(name,file)=>{
			Jimp.read(file.path, (err, img) => {
				img.resize(96, 96)   

				let sen=tf.tensor(img.bitmap.data, [1,96,96,4])
					.gather([3,2,1,0],3)
					.slice([0,0,0,1],[1,96,96,3])
					.div(tf.scalar(255))
			res.end(labels[model.predict(sen).argMax(1).dataSync()[0]])
			});

		})
		.on("fileBegin",(name,file)=>{
			console.log(file)
			file.path = __dirname + '/uploads/' + file.name
		})
	}
	catch(e){
		res.err(JSON.stringify({err:e}))
	}
});
app.post("/classify",upload.single("file"),(req,res)=>{

	if(req.__err){
		res.status(400).send("HATA");
		return;
	}
	
	try{
		Jimp.read(req.file.path,(err,img)=>{
			if(err){
				res.status(400).send({status:"fail",err:"corrupted image"});
				return;
			}
			img.resize(96, 96)   
			let sen=tf.tensor(img.bitmap.data, [1,96,96,4])
				.gather([3,2,1,0],3)
				.slice([0,0,0,1],[1,96,96,3])
				.div(tf.scalar(255));
			let rates=model.predict(sen).dataSync();
			
			rates=Object.keys(rates).map(function(i){
				return rates[i];
			});
			let max=rates.indexOf(Math.max(...rates));
			let resp={
				"status":"OK",
				"predicted":max,
				"predictedLabel":labels[max],
				"rates":rates
			}
			res.send(resp);
		})
	}
	catch(e){
		res.status(400).send({status:"fail",err:"unexcepted error"});
	}

	
});
app.get("/",(req,res)=>{
	res.send("OK")
})
app.listen(port, () => {
	console.log('Example app listening on: '+url)

	tf.loadLayersModel(url+'model.json')
	.then(mdl=>{
		model=mdl;
		console.log("model loaded");
		
	})
	.catch(err=>{
		console.error(err)
	})
    
})

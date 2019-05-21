
const Jimp=require("jimp")

let arr=["buney.jpg","images.jpeg"]
let b=arr.map(async k=>{
	return Jimp.read(k)
})
Promise.all(b)
.then(res=>{
	console.log(res)
})
const mongoose=require("mongoose");

  let AdminSchema=new mongoose.Schema({

    name:{type:String,required:true},
    email:{type:String,required:true},
    contact:{type:Number,required:true},
    password:{type:String,required:true},
    location:{type:String,required:true},
    img:{type:String,required:true},
    createdAt:{type:Date,default:Date.now()},
    updatedAt:{type:Date,default:Date.now()}

  })
   const AdminTable= mongoose.model("Admin",AdminSchema);
   
   module.exports={AdminTable}
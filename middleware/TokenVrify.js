const jwt=require("jsonwebtoken")

const tokenVerify=async(req,res,next)=>{
    const token=await req?.headers?.authorization?.split(" ")[1]
    console.log(token);
    
      await jwt.verify(token,process.env.JWTCODE,(err,decode)=>{
            if(err){
                res.json({
                    success:false,
                    error:true,
                    code:401,
                    message:"session expire plz login again.."
                })
            }else{
                //console.log(decode)
                next()
            }
        })
}
module.exports=tokenVerify
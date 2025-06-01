const express=require("express")
const recruiterRoute=express.Router()
const {recruiterTable} =require('../models/recruiterModel');
const {jobPostTable}=require('../models/jobpost');
const {appliedJobTable}=require('../models/appliedJob');
const {seekerTable}=require("../models/seekerModel");
recruiterRoute.post("/recruiter-register",async(req,res)=>{
  const name=req.body.name;
  const email=req.body.email;
  const contact=req.body.contact;
  const password=req.body.password;
  const location=req.body.location;
  let logo=req.files.logo;
    logo.mv("uploads/"+logo.name,(err)=>{
        if(err){
            res.send(err)
        }
    })
   const data=  new recruiterTable({name: name,email:email,contact:contact,password:password,location:location,logo:logo.name})
   const result= await data.save()
       res.json({
        code :200,
        data:result
       })
})
recruiterRoute.post("/recruiter-login", async (req, res) => {
    const {email,password}=req.body;
    
          const result = await recruiterTable.findOne({email,password}); 
          if (!result) {
            res.json({
              code: 302,
              message: "Invaild Email or Password",
              result: {}
            })
          } else {
            if (result.isBlock) {
              res.json({
                code: 203,
                message: "Your Account is Blocked",
                result: {}
              })
            }
            else {
              res.json({
                code: 200,
                message: "Login successfull",
                data: result
              })
            }
          }
      });

 recruiterRoute.post("/recruiter-jobpost",async(req,res)=>{
  try{
    const {companyId,category,jobTitle,experience,jobType,vacancies,jobLocation,salary,applyDate}=req.body;
  const data= new  jobPostTable({companyId,category,jobTitle,experience,jobType,vacancies,jobLocation,salary,applyDate })
  const result=await data.save();
  res.json({
    code:200,
    message:"Job posted successfull..",
    data:result
  })

  }catch(err){
    console.log(err);
  }    
 })     

recruiterRoute.post("/recruiter-postedjob",async(req,res)=>{
      const { companyId }=req.body;
      const jobPost=await jobPostTable.find({companyId:companyId}).sort({createdAt:-1});
      const finnalData= await Promise.all(
        jobPost.map(async(item)=>{
        const companyDetails= await recruiterTable.findOne({_id:item.companyId});
         return {
              _id:item._id,
              category:item.category,
              jobTitle:item.jobTitle,
              experience:item.experience,
              jobType:item.jobType,
              vacancies:item.vacancies,
              jobLocation:item.jobLocation,
              salary:item.salary,
               applyDate:item.applyDate,
              logo:companyDetails.logo,
              name:companyDetails.name
        }
        })
       )
       res.json({
        code:200,
        message:"data found",
        data:finnalData
       })
}) 

recruiterRoute.post("/recruiter-applied",async(req,res)=>{
  const companyId=req.body.companyId;
    const appliedList=await appliedJobTable.find({companyId:companyId}).sort({createdAt:-1});
    const finalData=await Promise.all(
      appliedList.map(async(item)=>{
        const jobData= await jobPostTable.findOne({_id:item.jobId})
         const seekerData=await seekerTable.findOne({_id:item.userId})
         return {
          _id:item?._id,
          jobId:item?.jobId,
          jobTitle:jobData?.jobTitle,
          experience:jobData?.experience,
          jobType:jobData?.jobType,
          jobLocation:jobData?.jobLocation,
          salary:jobData?.salary,
          applyDate:jobData?.applyDate,
          category:jobData?.category,
          vacancies:jobData?.vacancies,
          name:seekerData?.name,
          email:seekerData?.email,
           contact:seekerData?.contact,
           resume:seekerData?.resume,
           img:seekerData?.img
         }
      })
    )
   res.json({
    code:200,
    message:"data found",
    data:finalData
   }) 
})

recruiterRoute.put("/recruiter-update/:_id",async(req,res)=>{
   const _id=req.params._id;
   const {name,email,contact,location,password }=req.body;
   let logo=req.files.logo
   logo.mv("uploads/"+logo.name,(err)=>{
    if(err){
        res.send(err)
    }
})
const result=await recruiterTable.findByIdAndUpdate({_id:_id},{
       $set:{name,email,contact,location,password,logo:logo.name}},
      {new:true}
)
 res.json({
  code:200,
  message:"Data updated Successfull",
  data:result
 })

})
 module.exports={recruiterRoute}
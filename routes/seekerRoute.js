const express = require("express")
const seekerRoute = express.Router()
const { seekerTable } = require('../models/seekerModel');
const { jobPostTable } = require('../models/jobpost');
const { recruiterTable } = require('../models/recruiterModel');
const { appliedJobTable } = require('../models/appliedJob');
seekerRoute.post("/seeker-register", async (req, res) => {
  const { name, email, contact, password, qualification, location, preference } = req.body;
  let img = req.files.img;
  let resume = req.files.resume;
  img.mv("uploads/" + img.name, (err) => {
    if (err) {
      res.send(err)
    }
  })
  resume.mv("uploads/" + resume.name, (err) => {
    if (err) {
      res.send(err)
    }
  })
  const data = new seekerTable({ name: name, img: img.name, email: email, contact: contact, password: password, qualification: qualification, location: location, preference: preference, resume: resume.name })
  const result = await data.save()
  res.json({
    code: 200,
    data: result
  })
})
seekerRoute.post("/seeker-login", async (req, res) => {
  const { email, password } = req.body;
  const result = await seekerTable.findOne({ email, password });
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

seekerRoute.get("/seeker-joblist", async (req, res) => {

  const jobPost = await jobPostTable.find().sort({createdAt:-1});
  const finnalData = await Promise.all(
    jobPost.map(async (item) => {
      const companyDetails = await recruiterTable.findOne({ _id: item.companyId });
      return {
        _id: item?._id,
        companyId: item?.companyId,
        category: item?.category,
        jobTitle: item?.jobTitle,
        experience: item?.experience,
        jobType: item?.jobType,
        vacancies: item?.vacancies,
        jobLocation: item?.jobLocation,
        salary: item?.salary,
        applyDate: item?.applyDate,
        logo: companyDetails?.logo,
        name: companyDetails?.name
      }
    })
  )
  res.json({
    code: 200,
    message: "data found",
    data: finnalData
  })
})

seekerRoute.post("/seeker-apply", async (req, res) => {
  const { jobId, companyId, userId } = req.body;
  const isAppleid = await appliedJobTable.findOne({ jobId, userId })
  if (isAppleid) {
    res.json({
      code: 301,
      message: "Already Applied",
      data: isAppleid
    })
  } else {
    const data = new appliedJobTable({ jobId, companyId, userId });
    const result = await data.save();
    res.json({
      code: 200,
      message: "Applied Successfully",
      data: result
    })

  }
})
seekerRoute.post("/seeker-applied", async (req, res) => {
  const userId = req.body.userId;
  const appliedList = await appliedJobTable.find({ userId: userId }).sort({createdAt:-1});
  const finalData = await Promise.all(
    appliedList.map(async (item) => {
      const jobData = await jobPostTable.findOne({ _id: item.jobId })
      const companyData = await recruiterTable.findOne({ _id: item.companyId })
      return {
        _id: item?._id,
        jobId: item?.jobId,
        jobTitle: jobData?.jobTitle,
        experience: jobData?.experience,
        jobType: jobData?.jobType,
        jobLocation: jobData?.jobLocation,
        salary: jobData?.salary,
        applyDate: jobData?.applyDate,
        category: jobData?.category,
        vacancies: jobData?.vacancies,
        name: companyData?.name,
        logo: companyData?.logo
      }
    })
  )
  res.json({
    code: 200,
    message: "data found",
    data: finalData
  })
})

seekerRoute.put("/seeker-update/:_id", async (req, res) => {
  const _id = req.params._id;
  const { name, email, contact, location, password, qualification, preference } = req.body;
  let img = req.files.img;
  img.mv("uploads/" + img.name, (err) => {
    if (err) {
      res.send(err)
    }
  })
  let resume = req.files.resume;
  resume.mv("uploads/" + resume.name, (err) => {
    if (err) {
      res.send(err)
    }
  })
  const result = await seekerTable.findByIdAndUpdate({ _id: _id }, {
    $set: { name, email, contact, location, password, qualification, preference, img: img.name, resume: resume.name }
  },
    { new: true }
  )
  res.json({
    code: 200,
    message: "Data updated Successfull",
    data: result
  })

})



module.exports = { seekerRoute }
import CompanyGuide from "../models/companyGuide.js";
import axios from 'axios'

async function getCompanies(req,res){
    try{
        console.log('Controller hit!')
        const companies = await CompanyGuide.find({})
        return res.status(200).json({"success":"true","data":companies})
    }catch(err){
        console.error(err)
    }
}
async function getCompany(req,res){
    try{
        console.log('Controller hit!')
        const {company} = req.params
        const companyData= await CompanyGuide.findOne({company:company.toUpperCase()})
        return res.status(200).json({"success":"true","data":companyData})
    }catch(err){
        console.error(err)
    }
}
export {getCompanies,getCompany};
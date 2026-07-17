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
export default getCompanies;
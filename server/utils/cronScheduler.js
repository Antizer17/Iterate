import cron from "node-cron"
import { runDailyEmailJob } from "./mailer.js"

const cronSchedular = ()=>{
 cron.schedule("58 19 * * *", async ()=>{
    try{
        console.log("Dispatching revision content...")
        await runDailyEmailJob()
        console.log("Content delivery successful!")
    }catch(err){
        console.error(`Cron delivery failed!, ${err}`)
    }
 })
}
export default cronSchedular;
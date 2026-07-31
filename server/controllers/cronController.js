import { runDailyEmailJob } from "../utils/mailer.js"
async function runTask(req,res){
  const authHeader = req.headers['authorization'];
  const expectedHeader = `Bearer ${process.env.CRON_SECRET}`;
  if (!authHeader || authHeader !== expectedHeader) {
    return res.status(401).json({ error: 'Unauthorized: Invalid cron secret' });
  }
    try{
        console.log('Executing cron job...')
        await runDailyEmailJob()
        res.status(200).json({success:true, message:"Content delivery successful!"})
    }catch(err){
        console.error(`Error running email delivery function:${err}`)
        res.status(500).json({error:err})
    }
}
export default runTask;
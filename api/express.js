import app from "@/backend";
import serverless from "serverless-http";


const handler = serverless(app);

export default handler;
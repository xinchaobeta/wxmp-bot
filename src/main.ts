import { ChatGPTBot } from "./bot.js";
import express, { Response, Request } from 'express'

interface MessageRequest extends Request {
  query: {
    userId: string;
  },
}
const PORT = process.env.PORT || 80;

const chatGPTBot = new ChatGPTBot();
async function main() {
  await chatGPTBot.startGPTBot()
  const app = express();
  app.use(express.json())
  app
    .get('/ping', (req, res) => res.send('pong'))
    .post('/message', async (req: MessageRequest, res) => {
      const { userId } = req.query;
      const { content } = req.body;
      console.log(`userId: ${userId}`);
      console.log(`Message: ${content}`);
      try {
        const gptAnswer = await chatGPTBot.handleMesaage(content, userId);
        console.log('gptAnswer: ', gptAnswer);
        res.json({ content: gptAnswer });
      } catch (e) {
        console.log('--------- server error start ----------')
        console.error(e);
        console.log('--------- server error end ----------')
      } 
    })
  ;
  app.listen(PORT, () => {
    console.log(`服务器已启动 0.0.0.0:${PORT}`);
  });
}

main();

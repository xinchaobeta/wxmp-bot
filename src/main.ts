import { ChatGPTBot } from "./bot.js";
import { WechatApp } from "./wechatapp.js";
import { renderOutTextMsg } from "./wechatDefaultController.js";

const chatGPTBot = new ChatGPTBot();
async function main() {
  await chatGPTBot.startGPTBot();
  const app = new WechatApp({
    appId: process.env.WECHAT_APP_ID!,
    appSecret: process.env.WECHAT_APP_SECRET!,
    token: process.env.WECHAT_TOKEN!,
    encodingAESKey: process.env.WECHAT_ENCODING_AES_KEY!,
  });

  app
    .on('inTextMsg', async (message) => {
      const { getFromUserName: userId, getContent: content } =  message;
      if (!chatGPTBot.ready) {
        return renderOutTextMsg(message, 'gpt not ready');
      }
      if (content.startsWith("/ping")) {
        return renderOutTextMsg(message, 'pong')
      }
      try {
        console.log(`Message: ${content}`);
        const gptAnswer = await chatGPTBot.handleMesaage(content, userId);
        // todo: 分段文字回复
        return renderOutTextMsg(message, gptAnswer?.join(''));
      } catch (e) {
        console.error(e);
        return renderOutTextMsg(message, (e as Error)?.message ?? 'server error');
      }
    })

  try {
    await app.start();
  } catch (e) {
    console.error(
      `⚠️ app start failed, error = ${e}`
    );
  }
}
main();

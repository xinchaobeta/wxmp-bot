import { EventEmitter } from 'node:events';
import { type MsgAdapter, type OutMsg, ApiConfig, ApiConfigKit, WeChat } from 'tnwx'
import express, { Response, Request } from 'express'
import { WechatDefaultController } from './wechatDefaultController.js';

interface WxMessageGetRequest extends Request {
  query: {
    signature: string; //微信加密签名
    timestamp: string; //时间戳
    nonce: string; //随机数
    echostr: string; //随机字符串
  }
}
interface WxMessagePostRequest extends Request {
  query: {
    msg_signature: string;
    timestamp: string;
    nonce: string;
  }
}
type TnwxEvent<N=keyof MsgAdapter> = N extends `process${infer E}` ? Uncapitalize<E> : never;
type TnwxProcess<N extends TnwxEvent> = MsgAdapter[`process${Capitalize<N>}`];
const PORT = process.env.PORT;

const handleMessageGet = (req: WxMessageGetRequest, res: Response) => {
  const { signature, timestamp, nonce, echostr } = req.query;
  console.log('signature, timestamp, nonce, echostr = ', signature, timestamp, nonce, echostr);
  const result = WeChat.checkSignature(signature, timestamp, nonce, echostr);
  console.log('checkSignature result = ', result);
  res.send(result);
}

const handleMessagePost = (req: WxMessagePostRequest, res: Response, adapter: MsgAdapter) => {
  const { msg_signature, nonce, timestamp } = req.query;
  const buffer: Uint8Array[] = []
  req.on('data', function (data: any) {
    buffer.push(data)
  })
  req.on('end', function () {
    const msgXml = Buffer.concat(buffer).toString('utf-8')
    WeChat.handleMsg(adapter, msgXml, msg_signature, timestamp, nonce)
      .then(data => {
        res.send(data)
      })
      .catch(error => console.log(error))
  })
}
const defaultListener = () => Promise.resolve('')
export class WechatApp {
  listeners: MsgAdapter = new WechatDefaultController();
  server = express();
  constructor(option: {appId: string, appSecret: string, token: string, encodingAESKey: string}) {
    const { appId, appSecret, token, encodingAESKey } = option;
    console.log('appId, appSecret, token, encodingAESKey = ', appId, appSecret, token, encodingAESKey);
    const apiConfig = new ApiConfig(appId, appSecret, token, false, encodingAESKey);
    ApiConfigKit.putApiConfig(apiConfig);
    ApiConfigKit.setCurrentAppId(appId);
    ApiConfigKit.devMode = true;
    this.server
      .get('/ping', (req, res) => res.send('pong'))
      .get('/msg', handleMessageGet)
      .post('/msg', (req: WxMessagePostRequest, res) => {
        handleMessagePost(req, res, this.listeners as MsgAdapter)
      })
  }
  start() {
    this.server.listen(PORT, () => {
      console.log(`服务器已启动 0.0.0.0:${PORT}`);
    });
  }
  on<N extends TnwxEvent>(
    eventName: N, 
    handler: TnwxProcess<N>
  ): this {
    const capitializedEventName = `${eventName[0].toUpperCase()}${eventName.slice(1)}` as Capitalize<N>;
    const processName = `process${capitializedEventName}` as `process${Capitalize<N>}`;
    this.listeners[processName] = handler;
    return this;
  }
}
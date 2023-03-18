import { ChatGPTAPI } from "chatgpt";
export interface AccountWithUserInfo {
  password: string;
  email: string;
  isGoogleLogin: boolean;
}

// Account will be one in the session token or email and password
export type IAccount = AccountWithUserInfo;

export interface IChatGPTItem {
  chatGpt: ChatGPTAPI;
  account: IAccount;
}
export interface IConversationItem {
  conversation: ChatGPTAPI;
  account: IAccount;
  conversationId?: string;
  messageId?: string;
}

export interface IConfig {
  chatGPTAccountPool: IAccount[];
  chatGptRetryTimes: number;
  chatPrivateTiggerKeyword: string;
  openAIProxy?: string;
  clearanceToken: string;
  userAgent: string;
}

export interface WechatPushMessageCommon {
  //开发者微信号
  ToUserName: string;
  //发送方帐号（一个OpenID）
  FromUserName: string;
  //消息创建时间 （整型）
  CreateTime: number;
  // 消息id，64位整型
  MsgId: string;
	// 消息的数据ID（消息如果来自文章时才有）
  MsgDataId: string;
	// 多图文时第几篇文章，从1开始（消息如果来自文章时才有）
  Idx: string;
}

export interface WechatPushMessageText extends WechatPushMessageCommon {
  // 消息类型，文本为text
  MsgType: 'text';
  // 文本消息内容
  Content: string;
}

export interface WechatPushMessageAction {
  // 开发者微信号
  ToUserName: string;
	// 发送方帐号（一个OpenID）
  FromUserName: string;
	// 消息创建时间 （整型）
  CreateTime: number;
	// 消息类型，event
  MsgType: 'event';
	// 事件类型，subscribe
  Event: 'subscribe' | 'unsubscribe' | 'SCAN' | 'LOCATION' | 'VIEW';
}

export interface WechatPushMessageOtherType extends WechatPushMessageCommon {
  // 消息类型，文本为text
  MsgType: 'image' | 'voice' | 'video' | 'shortvideo' | 'location' | 'link';
}

export type WechatPushMessage = WechatPushMessageAction | WechatPushMessageText | WechatPushMessageOtherType;
export type WechatPushMessageByType<T, M = WechatPushMessage> = M extends { MsgType: T } ? M : never;


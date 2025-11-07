import crypto from 'crypto';

/**
 * 加密算法配置
 */
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

/**
 * 加密结果
 */
interface EncryptionResult {
  /** 加密后的数据（Base64编码） */
  encryptedData: string;
  /** 初始化向量（Base64编码） */
  iv: string;
  /** 认证标签（Base64编码） */
  tag: string;
}

/**
 * 加密工具类
 */
export class Encryption {
  private readonly key: Buffer;

  /**
   * 创建加密实例
   * @param secret 加密密钥
   */
  constructor(secret: string) {
    // 使用PBKDF2从密钥派生加密密钥
    this.key = crypto.pbkdf2Sync(secret, 'salt', 10000, KEY_LENGTH, 'sha256');
  }

  /**
   * 加密文本
   * @param text 要加密的文本
   * @returns 加密结果
   */
  encrypt(text: string): EncryptionResult {
    // 生成随机初始化向量
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // 创建加密器
    const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, this.key);
    cipher.setAAD(Buffer.from('additional-data'));
    
    // 加密数据
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 获取认证标签
    const tag = cipher.getAuthTag();
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  /**
   * 解密文本
   * @param encryptionResult 加密结果
   * @returns 解密后的文本
   */
  decrypt(encryptionResult: EncryptionResult): string {
    // 创建解密器
    const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, this.key);
    decipher.setAAD(Buffer.from('additional-data'));
    decipher.setAuthTag(Buffer.from(encryptionResult.tag, 'hex'));
    
    // 解密数据
    let decrypted = decipher.update(encryptionResult.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * 加密对象并序列化为JSON字符串
   * @param obj 要加密的对象
   * @returns 加密后的JSON字符串
   */
  encryptObject(obj: any): string {
    const jsonString = JSON.stringify(obj);
    const encryptionResult = this.encrypt(jsonString);
    return JSON.stringify(encryptionResult);
  }

  /**
   * 解密JSON字符串并反序列化为对象
   * @param encryptedJson 加密的JSON字符串
   * @returns 解密后的对象
   */
  decryptObject(encryptedJson: string): any {
    const encryptionResult: EncryptionResult = JSON.parse(encryptedJson);
    const decryptedJson = this.decrypt(encryptionResult);
    return JSON.parse(decryptedJson);
  }
}

/**
 * 默认加密实例
 */
let defaultEncryption: Encryption | null = null;

/**
 * 初始化默认加密实例
 * @param secret 加密密钥
 */
export function initEncryption(secret: string): void {
  defaultEncryption = new Encryption(secret);
}

/**
 * 获取默认加密实例
 * @returns 加密实例
 * @throws 如果未初始化加密实例
 */
export function getEncryption(): Encryption {
  if (!defaultEncryption) {
    throw new Error('Encryption not initialized. Call initEncryption first.');
  }
  return defaultEncryption;
}

/**
 * 便捷的加密函数
 * @param text 要加密的文本
 * @returns 加密结果
 */
export function encryptText(text: string): EncryptionResult {
  return getEncryption().encrypt(text);
}

/**
 * 便捷的解密函数
 * @param encryptionResult 加密结果
 * @returns 解密后的文本
 */
export function decryptText(encryptionResult: EncryptionResult): string {
  return getEncryption().decrypt(encryptionResult);
}

/**
 * 便捷的对象加密函数
 * @param obj 要加密的对象
 * @returns 加密后的JSON字符串
 */
export function encryptObject(obj: any): string {
  return getEncryption().encryptObject(obj);
}

/**
 * 便捷的对象解密函数
 * @param encryptedJson 加密的JSON字符串
 * @returns 解密后的对象
 */
export function decryptObject(encryptedJson: string): any {
  return getEncryption().decryptObject(encryptedJson);
}
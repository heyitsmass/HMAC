import { TSchema } from "../types";
import { TContextType } from "../types/context";
import HMAC from "./hmac";

export default class SecureConnection { 

  private hmac:HMAC; 

  private constructor(hmac:HMAC){
    this.hmac = hmac;

  }

  /**
   * 
   * @returns 
   */
  private static async establish():Promise<TContextType>{
    const hmac = await HMAC.init();
    try { 
      const database = await hmac.getData<TSchema>();
      return { 
        conn: new this(hmac),
        data: database
      }
    } catch (error) {
      throw new Error("Unable to establish secure connection.");
    }
  }

  /**
   * 
   * @returns 
   */
  public fetch(){
    return this.hmac.getData<TSchema>();
  }

  /**
   * 
   * @param data 
   * @returns 
   */
  public send(data: TSchema){
    return this.hmac.postData<TSchema>(data);
  }

  /**
   * 
   * @returns 
   */
  public verify(){
    return this.hmac.verifyData();
  }

  /**
   * 
   * @returns 
   */
  public close(){
    return this.hmac.close();
  }

  /**
   * 
   * @returns 
   */
  public static async init(){
    return this.establish();
  }


}
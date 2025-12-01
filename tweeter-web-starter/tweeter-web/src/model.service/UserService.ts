import { Buffer } from "buffer";
import { AuthToken, User, FakeData } from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "../network/ServerFacade";

export class UserService  implements Service{
  private serverFacade = new ServerFacade();
    

  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null>{
    const request = {
      token: authToken.token,
      alias: alias
    };
    return this.serverFacade.getUser(request);
  };

  public async login (
    alias: string,
    password: string
  ): Promise<[User, AuthToken]> {
    const request = {
      alias: alias,
      password: password
    };
    return this.serverFacade.login(request);
  };

  public async logout (authToken: AuthToken): Promise<void> {
    const request = {
      token: authToken.token
    };
    return this.serverFacade.logout(request);
  };

  public async register (
      firstName: string,
      lastName: string,
      alias: string,
      password: string,
      userImageBytes: Uint8Array,
      imageFileExtension: string
    ): Promise<[User, AuthToken]> {
      const imageStringBase64: string =
        Buffer.from(userImageBytes).toString("base64");
      const request = {
        firstName: firstName,
        lastName: lastName,
        alias: alias,
        password: password,
        userImageBytes: imageStringBase64,
        imageFileExtension: imageFileExtension
      };
      return this.serverFacade.register(request);
    };

}
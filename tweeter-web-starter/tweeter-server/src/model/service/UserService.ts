import { Buffer } from "buffer";
import { AuthToken, User, FakeData, UserDto, AuthTokenDto } from "tweeter-shared";
import { Service } from "./Service";

export class UserService  implements Service{
    

  public async getUser(
    authToken: string,
    alias: string
  ): Promise<UserDto | null>{
    const user = FakeData.instance.findUserByAlias(alias);
    return user ? user.dto : null;
  };

  public async login (
    alias: string,
    password: string
  ): Promise<[UserDto, AuthTokenDto]> {
    const user = FakeData.instance.firstUser;

    if (user === null) {
      throw new Error("Invalid alias or password");
    }

    return [user.dto, FakeData.instance.authToken.dto];
  };

  public async logout (
    authToken: string
  ): Promise<void> {
    // Pause so we can see the logging out message. Delete when the call to the server is implemented.
    await new Promise((res) => setTimeout(res, 1000));
  };

  public async register (
      firstName: string,
      lastName: string,
      alias: string,
      password: string,
      userImageBytes: string,
      imageFileExtension: string
    ): Promise<[UserDto, AuthTokenDto]> {
      
      const user = FakeData.instance.firstUser;
  
      if (user === null) {
        throw new Error("Invalid registration");
      }
  
      return [user.dto, FakeData.instance.authToken.dto];
    };

}
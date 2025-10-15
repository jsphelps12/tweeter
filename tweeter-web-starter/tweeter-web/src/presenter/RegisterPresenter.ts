import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { NavigateFunction } from "react-router-dom";
import { Buffer } from "buffer";
import { Presenter, View } from "./Presenter";
import { AuthenticatorPresenter, AuthenticatorView } from "./AuthenticatorPresenter";


export interface RegisterView extends AuthenticatorView{
    setImageUrl: (imageUrl: string) => void;
    setImageFileExtension: (imageFileExtension: string) => void
    setImageBytes: (imageBytes: Uint8Array) => void
  }

export class RegisterPresenter extends AuthenticatorPresenter<RegisterView> {

    private firstName = "";
    private lastName = ""
    private alias = "";
    private password = ""
    private imageBytes: Uint8Array = new Uint8Array();
    private imageFileExtension = "";

    public checkSubmitButtonStatus (firstName: string, lastName: string, alias: string, password: string, imageUrl: string, imageFileExtension: string): boolean {
        return (
        !firstName ||
        !lastName ||
        !alias ||
        !password ||
        !imageUrl ||
        !imageFileExtension
        );
    };

    protected itemDescription(): string {
        return "register user";
    }
    
    protected async performAuth(): Promise<[User, AuthToken]> {
        return this.userService.register(this.firstName, this.lastName, this.alias, this.password, this.imageBytes, this.imageFileExtension);   
    }

    public async doRegister (firstName: string, lastName: string, alias: string, password: string, imageBytes: Uint8Array, imageFileExtension: string, rememberMe: boolean) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.alias = alias;
        this.password = password;
        this.imageBytes = imageBytes;
        this.imageFileExtension = imageFileExtension;
        await this.doAuthAction(rememberMe);
        // await this.doFailureReportingOperation(async () => {
        //     const [user, authToken] = await this.userService.register(
        //         firstName,
        //         lastName,
        //         alias,
        //         password,
        //         imageBytes,
        //         imageFileExtension
        //     );

        //     this.view.updateUserInfo(user, user, authToken, rememberMe);
        //     this.view.navigate(`/feed/${user.alias}`);
        // }, "register user");
        
    };

    public handleImageFile (file: File | undefined) {
        if (file) {
        this.view.setImageUrl(URL.createObjectURL(file));
    
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const imageStringBase64 = event.target?.result as string;
    
            // Remove unnecessary file metadata from the start of the string.
            const imageStringBase64BufferContents =
            imageStringBase64.split("base64,")[1];
    
            const bytes: Uint8Array = Buffer.from(
            imageStringBase64BufferContents,
            "base64"
            );
    
            this.view.setImageBytes(bytes);
        };
        reader.readAsDataURL(file);
    
        // Set image file extension (and move to a separate method)
        const fileExtension = this.getFileExtension(file);
        if (fileExtension) {
            this.view.setImageFileExtension(fileExtension);
        }
        } else {
        this.view.setImageUrl("");
        this.view.setImageBytes(new Uint8Array());
        }
    };
      
    public getFileExtension (file: File): string | undefined {
        return file.name.split(".").pop();
    };



}
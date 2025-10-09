import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { NavigateFunction } from "react-router-dom";
import { Buffer } from "buffer";


export interface RegisterView {
    displayErrorMessage: (message: string) => void;
    navigate: NavigateFunction;
    setIsLoading: (isLoading: boolean) => void;
    setImageUrl: (imageUrl: string) => void;
    setImageFileExtension: (imageFileExtension: string) => void
    setImageBytes: (imageBytes: Uint8Array) => void
    updateUserInfo: (loggedInUser: User, displayedUser: User, authToken: AuthToken, rememberMe: boolean) => void;
  }

export class RegisterPresenter {
    // Implementation not shown as it's not part of the comparison
    private userService: UserService;
    private _view: RegisterView;
    
    constructor(view: RegisterView) {
        this.userService = new UserService();
        this._view = view;
    }

    public get view() {
        return this._view;
    }

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

    public async doRegister (firstName: string, lastName: string, alias: string, password: string, imageBytes: Uint8Array, imageFileExtension: string, rememberMe: boolean) {
        try {
        this.view.setIsLoading(true);

        const [user, authToken] = await this.register(
            firstName,
            lastName,
            alias,
            password,
            imageBytes,
            imageFileExtension
        );

        this.view.updateUserInfo(user, user, authToken, rememberMe);
        this.view.navigate(`/feed/${user.alias}`);
        } catch (error) {
        this.view.displayErrorMessage(
            `Failed to register user because of exception: ${error}`
        );
        } finally {
        this.view.setIsLoading(false);
        }
    };

    public async register (
        firstName: string,
        lastName: string,
        alias: string,
        password: string,
        userImageBytes: Uint8Array,
        imageFileExtension: string
      ): Promise<[User, AuthToken]>{
        return this.userService.register(firstName, lastName, alias, password, userImageBytes, imageFileExtension);
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
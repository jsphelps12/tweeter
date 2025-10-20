export interface View {
    displayErrorMessage: (message: string) => void;
}

export interface MessageView extends View {
    displayInfoMessage: (message: string, duration: number) => string;
    deleteMessage: (messageId: string) => void;
}

//parent presenter
export abstract class Presenter<V extends View> {
    // Common functionality for all presenters can be added here
    private _view: V;

    protected constructor(view: V){
        this._view = view;
    }

    protected get view(): V {
        return this._view;
    }

    protected async doFailureReportingOperation(operation: () => Promise<void>, operationDescription: string) {
        try {
            await operation();
        } catch (error) {
            this.view.displayErrorMessage(`Failed to ${operationDescription} because of exception: ${(error as Error).message}`);
        }
        };
}
import { renderToString } from "react-dom/server";
import * as React from "react";
import { SSRRenderer } from "./SSRRenderer";
import { Store, Action } from "redux";
import { Provider } from "react-redux";

export class SSRStateOnly<T> extends SSRRenderer {
    private element: React.ReactElement<any>;
    protected store: Store<T> | undefined;

    constructor(element: React.ReactElement<any>, store?: Store<T>, onRender?: Promise<Action>) {
        super();
        
        this.element = element;
        this.store = store;
        this.onRender = onRender;
    }

    protected updateBody() {
        if(this.store) {
            this.body = renderToString(
                <Provider store={this.store}>
                    {this.element}
                </Provider>
            )
        } else {
            this.body = renderToString(this.element);
        }
    }

    public render(): Promise<string> {
        this.updateBody();
        
        if (this.onRender) {
            return this.onRender.then((reduxAction: Action) => {
                if (this.store) {
                    this.store.dispatch(reduxAction);
                }
                return super.render();
            });
        } else {
            return super.render();
        }
    }
}
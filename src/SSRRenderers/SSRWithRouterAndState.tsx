import { IsomorphicRouteWithState } from "./../IsomorphicRoute";
import { SSRRenderer } from "./SSRRenderer";

import { StaticRouter, Switch, Route } from "react-router";

import { Request } from 'express';
import { renderToString } from "react-dom/server";
import * as React from "react";
import { Store, Provider } from "react-redux";
import { Action } from "redux";

export class SSRWithRouterAndState<T> extends SSRRenderer {
    protected store: Store<T>;
    private routes: IsomorphicRouteWithState<T>[] = [];
    private request: Request;

    constructor(store: Store<T>, req: Request, routes?: IsomorphicRouteWithState<T>[]) {
        super();

        this.store = store;
        this.request = req;

        if (routes) {
            this.routes = routes;
        }
    }

    protected updateBody() {
        this.body = renderToString(
            <Provider store={this.store}>
                <StaticRouter location={this.request.url} context={{}}>
                    <Switch>
                        {
                            this.routes.map((route: IsomorphicRouteWithState<T>) => {
                                return (
                                    <Route 
                                        key={route.path}
                                        path={route.path}
                                        render={(routeParams: any) => {
                                            if (route.onRender) {
                                                this.onRender = route.onRender(this.store.getState() as T, routeParams);
                                            }
                                            return route.component;
                                        }}
                                    />
                                );
                            })
                        }
                    </Switch>
                </StaticRouter>
            </Provider>
        );
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
import * as React from "react";
import { Request } from 'express';
import { IsomorphicRoutePure } from "./../IsomorphicRoute";
import { renderToString } from 'react-dom/server';
import { Route, StaticRouter, Switch } from "react-router";
import { SSRRenderer } from "./SSRRenderer";

export class SSRRouterOnly extends SSRRenderer {
    private currentRequest: Request;
    private routes: IsomorphicRoutePure[] = [];

    constructor (request: Request, routes: IsomorphicRoutePure[]) {
        super();

        this.currentRequest = request;
        this.routes = routes;        
        this.body = ``;
    }

    protected updateBody() {
        this.body = renderToString(
            <StaticRouter location={this.currentRequest.url} context={{}}>
                <Switch>
                    {
                        this.routes.map((route: IsomorphicRoutePure) => {
                            return (
                                <Route 
                                    key={route.path}
                                    path={route.path}
                                    render={() => {
                                        if (route.onRender) {
                                            this.onRender = route.onRender();
                                        }
                                        return route.component;
                                    }}
                                />
                            );
                        })
                    }
                </Switch>
            </StaticRouter>
        )
    }
}
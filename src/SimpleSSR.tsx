import { StaticRouter, Switch, Route } from "react-router";

import { Request } from 'express';
import { renderToString } from "react-dom/server";
import * as React from "react";
import { Store, Provider } from "react-redux";
import { Action, createStore, Reducer } from "redux";
import { IsomorphicRouteWithState, IsomorphicRoute, SSRWithRouterAndState, SSRRouterOnly, SSRStateOnly } from ".";

export class SimpleSSR<T> {
    private store?: Store<T>;
    private routes?: IsomorphicRouteWithState<T>[] | IsomorphicRoute[] = [];
    private request?: Request;
    private startupElement?: React.ReactElement<any>;
    private onRender?: Promise<Action<any>>;

    public addStore(store: Store<T>) {
        this.store = store;

        return this;
    }

    public addRoutes(routes: IsomorphicRouteWithState<T>[] | IsomorphicRoute[], request: Request) {
        this.routes = routes;
        this.request = request;
    
        return this;
    }

    public addStartupElement(element: React.ReactElement<any>, onRender?: Promise<any>) {
        this.startupElement = element;

        if(onRender) {
            this.addOnRender(onRender);
        }

        return this;
    }

    public addOnRender(onRender: Promise<any>) {
        this.onRender = onRender;

        return this;
    }

    public render(): Promise<string> {
        if(this.store && this.request && this.routes) {
            return new SSRWithRouterAndState(this.store, this.request, this.routes).render();
        }

        if(this.request && this.routes) {
            return new SSRRouterOnly(this.request, this.routes as IsomorphicRoute[]).render();
        }

        if(this.startupElement) {
            return new SSRStateOnly(this.startupElement, this.store, this.onRender).render();
        }

        return new SSRStateOnly(<h1>Invalid server configuration</h1>).render();
    }
}

declare var Window: {
    [key:string]: any;
    prototype: Window;
    new(): Window;
}

export function syncStoreStateWithSSR<T>(reducer: Reducer<T>): Store<T> {
    if(typeof window === 'undefined' || Object.keys(window).indexOf('__initialData__') === -1) {
        return createStore(reducer);
    } else {
        return createStore(reducer, Window['__initialData__']);
    }
}
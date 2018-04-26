import { RouteComponentProps } from "react-router";
import { Action } from "redux";

export interface IsomorphicRoute {
    path: string;
    component: React.ReactChild;
}

export interface IsomorphicRoutePure extends IsomorphicRoute {
    onRender?: (route?: RouteComponentProps<any>) => Promise<void>;
}

export interface IsomorphicRouteWithState<S> extends IsomorphicRoute {
    onRender?: (state: S, route?: RouteComponentProps<any>) => Promise<Action>;
}
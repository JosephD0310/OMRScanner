import { ComponentType } from "react";
import config from "../config";
import Result from "../pages/Result";
import Home from "../pages/Home";

interface IRoute {
    path: string;
    component: ComponentType;
    layout?: ComponentType
}

const publicRoutes : IRoute[] = [
    { path: config.routes.home, component:Home},
    { path: config.routes.result, component:Result}
]

export {publicRoutes}
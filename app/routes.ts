import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";


export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
    route("create", "routes/create.tsx"),
    route("manage", "routes/manage.tsx"),
  ])
] satisfies RouteConfig;
